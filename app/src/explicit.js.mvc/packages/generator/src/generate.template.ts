import { watch } from "chokidar";
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { JSDOM } from "jsdom";
import { Parser } from "htmlparser2";
import type { ComponentModel, TemplateModel } from "./process.templates";

let dom = new JSDOM("");

const { Node, Element } = dom.window;
let data: TemplateModel = null;
const filesDirectory = "./src";

function escapeText(text) {
    const div = dom.window.document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

function isGlobalAttribute(attrName) {
    const globalAttrs = ["class", "id", "title", "lang", "dir"];
    return globalAttrs.includes(attrName.toLowerCase());
}

function isDataAttribute(attrName) {
    return attrName.startsWith("data-");
}

function isAriaAttribute(attrName) {
    return attrName.startsWith("aria-");
}

function generateController(element: Element, parentVarName: string, varName: string): string {
    let creationCode: string = "";
    creationCode += `\t\t${data.componentParamName}.insertController(${parentVarName});\n`;
    return creationCode;
}

function generateComponent(element: Element, parentVarName: string, varName: string) {
    let creationCode: string = "";
    if (curComponent) {
        let componentVarName = `${curComponent.fieldPath}`;
        creationCode += `\t\t${componentVarName} = `;
        creationCode += `new ${curComponent.typeName}(`;
        curComponent.constructorParameters.forEach((paramType) => {
            creationCode += `new ${paramType}(), `;
        });
        creationCode = creationCode.substring(0, creationCode.length - 2);
        creationCode += `);\n`;
        creationCode += `\t\t${parentVarName}.appendChild(${componentVarName}.template.rootElement);\n`;
    }
    componentIndex++;
    if (data.components.length < componentIndex) curComponent = data.components[componentIndex];
    return creationCode;
}

const regexSplitVars = /\$\{|\}/;

function generateClickEventHandler(elementName, functionName) {
    return `\t\t${elementName}.addEventListener("click", function (event) {
\t\t\t${getFunctionName(functionName)};
\t\t});\n`;
}

function getFunctionName(functionString) {
    const splited = functionString.split(RegExp("[{}]", "g"));
    if (splited.length === 3) return splited[1];
    throw new Error(`function is invalid: ${functionString}.`);
}

function generateDomCreationCode(
    parentVarName: string | null,
    element: Element,
    varNamePrefix: string = "elem",
    depth = 0
) {
    const varName = `${varNamePrefix}_${depth}`;
    const tagName = element.tagName.toLowerCase();
    let creationCode = "";
    if (tagName === "controller-component") {
        creationCode += generateController(element, parentVarName, varName);
    } else if (tagName === "component") {
        creationCode += generateComponent(element, parentVarName, varName);
    } else {
        creationCode = `\t\tlet ${varName} = document.createElement("${tagName}");\n`;
        Array.from(element.attributes).forEach((attr, index) => {
            const name = attr.name;
            if (name === "click") {
                let clickHandlerKey = `${filesCount}_${handlerCount}`;
                let clickHandlerVarName = "clickListener_" + clickHandlerKey;
                creationCode += `\t\tconst ${clickHandlerVarName} = () => { ${getFunctionName(attr.value)}; }\n`;
                creationCode += `\t\tListeners.addClickListenerFunc(${varName}, "${clickHandlerKey}", ${clickHandlerVarName});\n`;
                handlerCount++;
            } else if (name === "change") {
                let changeHandlerKey = `${filesCount}_${handlerCount}`;
                let changeHandlerVarName = "changeListener_" + changeHandlerKey;
                creationCode += `\t\tconst ${changeHandlerVarName} = () => { ${getFunctionName(attr.value)}; }\n`;
                creationCode += `\t\tListeners.addChangeListenerFunc(${varName}, "${changeHandlerKey}", ${changeHandlerVarName});\n`;
                handlerCount++;
            } else if (name === "input") {
                let inputHandlerKey = `${filesCount}_${handlerCount}`;
                let inputHandlerVarName = "inputListener_" + inputHandlerKey;
                creationCode += `\t\tconst ${inputHandlerVarName} = () => { ${getFunctionName(attr.value)}; }\n`;
                creationCode += `\t\tListeners.addInputListenerFunc(${varName}, "${inputHandlerKey}", ${inputHandlerVarName});\n`;
                handlerCount++;
            } else if (attr.value.indexOf("${") !== -1) {
                creationCode += `\t\t${data.modelParamName}.addAttributeCallback(${varName}, "${name}", "${attr.value}");\n`;
            } else {
                creationCode += `\t\t${varName}.setAttribute("${name}", "${attr.value}");\n`;
            }
        });
        if (parentVarName) creationCode += `\t\t${parentVarName}.appendChild(${varName});\n`;
    }

    // Handle children
    Array.from(element.childNodes).forEach((child, index) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            creationCode += generateDomCreationCode(varName, child as Element, varName, index);
        } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
            const escapedText = escapeText(child.textContent.trim());
            let splits = escapedText.split(regexSplitVars);
            for (let i = 0; i < splits.length; i++) {
                if (i % 2 === 1) {
                    let path = splits[i];
                    if (path === data.elementParamName)
                        creationCode += `\t\t${data.modelParamName}.appendVarContentNode(${varName}, ${data.componentParamName}.content);\n`;
                    else creationCode += `\t\t${data.modelParamName}.addTextNodeCallback(${varName}, "${path}");\n`;
                } else {
                    creationCode += `\t\t${data.modelParamName}.appendTextNode(${varName}, "${splits[i]}");\n`;
                }
            }
        }
    });
    return creationCode;
}

function countElementNodes(parentNode) {
    let count = 0;
    parentNode.childNodes.forEach((childNode) => {
        if (childNode.nodeType === Node.ELEMENT_NODE) {
            count++;
        }
    });
    return count;
}

function generateCodeFromHtml(htmlString: string, filePath: string) {
    const hasBodyTag = /<body.*?>/.test(htmlString);
    const hasHeaderTag = /<head.*?>/.test(htmlString);

    const dom = new JSDOM(htmlString);
    const doc = dom.window.document;
    let generatedCode = "";
    if (!hasHeaderTag && doc.head.children && doc.head.children.length > 0 && filePath.indexOf("/headers/") >= 0) {
        console.log(`Error: Header template: ${filePath} should contains a <head> tag.`);
        return;
    }
    if (doc.body.children && doc.body.children.length > 1) {
        console.log(`Error template: ${filePath} should contains a single root element.`);
        return;
    }
    if (hasHeaderTag && doc.head.children) {
        generatedCode += generateDomCreationCode(null, doc.head as Element, "rootElem", 0);
    } else if (doc.body.children) {
        Array.from(doc.body.children).forEach((node, index) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                generatedCode += generateDomCreationCode(null, node as Element, "rootElem", index);
            }
        });
    }
    return generatedCode;
}

const regexMatchVars = /generateTemplate\(\s*([^,]+?)\s*,\s*([^,]+?)((\s*,\s*([^,]+?)\s*)|)\)/;

function writeFileRecursiveSync(filePath, content) {
    const dirnamev = dirname(filePath);
    try {
        mkdirSync(dirnamev, { recursive: true });
        writeFileSync(filePath, content);
        console.log("File written successfully");
    } catch (err) {
        console.error("Error writing file:", err);
    }
}
var handlerCount = 0;
var filesCount = 0;
let curComponent: ComponentModel = null;
let componentIndex = 0;
export function generateTemplateFile(filePath: string, model: TemplateModel) {
    data = model;
    handlerCount = 0;
    componentIndex = 0;
    if (model.components && model.components.length > 0) curComponent = model.components[0];
    else curComponent = null;
    const templateString = readFileSync(filePath, "utf8");
    const strs = templateString.split("`");
    let code = "";
    if (strs.length == 3) {
        code += generateCodeFromHtml(strs[1], filePath);
    } else {
        console.log(`File: ${filePath} do not have template.`);
        return;
    }
    const outputFilePath = filePath.replace("/src/", "/gen/");
    let lastIndex = strs[0].lastIndexOf("{") + 1;
    let prefix = "";
    let str = strs[0];
    if (lastIndex >= 0) str = strs[0].substring(0, lastIndex);
    prefix = "// Auto-generated file, do not edit!!!\n";
    prefix += 'import { Listeners } from "@explicit.js.mvc/listeners";\n';
    model.imports.forEach((value, key) => {
        prefix += value + "\n";
    });
    prefix += str + "\n";
    if (data.modelParamName) {
        prefix += `\t\t${data.modelParamName}.contentVarName = "${data.elementParamName}";\n`;
        if (data.elementParamName)
            prefix += `\t\t${data.componentParamName}.appendContentNode(${data.elementParamName});\n`;
    }

    let suffix = "\t\tthis.rootElement = rootElem_0;\n";
    suffix += "\t\treturn this.rootElement;\n";
    suffix += strs[2].substring(strs[2].indexOf("}") + 2) + "\n";
    suffix += "\n}\n";
    writeFileRecursiveSync(outputFilePath, prefix + code + suffix);
    filesCount++;
}
