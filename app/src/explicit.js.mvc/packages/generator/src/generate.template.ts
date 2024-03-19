import { watch } from "chokidar";
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { JSDOM } from "jsdom";
import { Parser } from "htmlparser2";
import { ComponentModel, TemplateModel, TemplateString } from "./process.templates";

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
    return "";
}

function getArgsByVarName(templateString: TemplateString, varName: string): string {
    let code = "";
    let newSet = new Set<string>();
    templateString.variableExprs.forEach((vars) => {
        if ((varName = vars.fullVariableExpr)) {
            newSet = new Set<string>([...vars.variablesNames, ...newSet]);
        }
    });
    newSet.forEach((varName) => {
        code += varName + ", ";
    });
    if (code.endsWith(", ")) code = code.slice(0, code.length - 2);
    return code;
}

function getArgs(templateString: TemplateString): string {
    let code = "";
    let newSet = new Set<string>();
    templateString.variableExprs.forEach((vars) => {
        newSet = new Set<string>([...vars.variablesNames, ...newSet]);
    });
    newSet.forEach((varName) => {
        code += varName + ", ";
    });
    if (code.endsWith(", ")) code = code.slice(0, code.length - 2);
    return code;
}

function createTemplates(model: TemplateModel, templateStrings: TemplateString[], constructorCode: string): string {
    let creationCode = "";
    templateStrings.forEach((templateString) => {
        if (templateString.varName !== "") {
            let args = getArgs(templateString);
            let varName = `${templateString.varName}_${templateString.position}`;
            creationCode += `\tlet ${varName} = `;
            creationCode += "(" + args + ")";
            creationCode += " => {\n";
            creationCode += "\t\t\tlet root = new RootElement();\n";
            if (model.isHeaderTemplate) {
                templateString.node.head.childNodes.forEach((node, index) => {
                    let rootVarName = `${varName}_${index}`;
                    creationCode +=
                        "\t\t\t" +
                        generateDomCreationCode(null, node as Element, varName, index, templateString) +
                        "\n";
                    creationCode += `\t\t\troot.append(${rootVarName});\n`;
                });
                creationCode += "\t\t\treturn root;\n";
                creationCode += "\t\t}\n";
                creationCode += `\tthis.createTemplate(${templateString.position}, ${varName});\n`;
            } else {
                templateString.node.body.childNodes.forEach((node, index) => {
                    let rootVarName = `${varName}_${index}`;
                    console.log(node);
                    creationCode +=
                        "\t\t\t" +
                        generateDomCreationCode(null, node as Element, varName, index, templateString) +
                        "\n";
                    creationCode += `\t\t\troot.append(${rootVarName});\n`;
                });
                creationCode += "\t\t\treturn root;\n";
                creationCode += "\t\t}\n";
                creationCode += `\tthis.createTemplate(${templateString.position}, ${varName});\n`;
            }
        }
    });
    let args = "";
    if (model.componentParamName) args += model.componentParamName + ",";
    if (model.modelParamName) args += model.modelParamName + ",";
    if (model.layoutParamName) args += model.layoutParamName + ",";
    if (model.elementParamName) args += model.elementParamName + ",";
    if (args.endsWith(",")) args = args.substring(0, args.length - 1);
    creationCode += "\t\t}";
    creationCode = "\t\tinit(" + args + ") {\n\t\t" + creationCode + "\n\t}";
    if (constructorCode !== "") {
        creationCode += constructorCode;
    }
    return creationCode;
}

function getTemplate(templateString: TemplateString): string {
    let code = "";
    let args = getArgs(templateString);
    if (args !== "") args = ", " + args;
    if (templateString.operator === "=") {
        code += `this.getTemplate(${templateString.position}${args})`;
    } else if (templateString.operator === "+=") {
        code += `\t\t\t${templateString.varName}.appendTemplate(this.getTemplate(${templateString.position}${args}));\n`;
    } else {
        code += `this.getTemplate(${templateString.position}${args})`;
    }
    return code;
}

function generateDomCreationCode(
    parentVarName: string | null,
    element: Element,
    varNamePrefix: string = "elem",
    depth = 0,
    templateString: TemplateString
) {
    let creationCode = "";
    const varName = `${varNamePrefix}_${depth}`;
    if (element.nodeType === Node.TEXT_NODE && element.textContent?.trim()) {
        creationCode += generateTextNode(element, varName, templateString);
    } else {
        const tagName = element.tagName.toLowerCase();
        if (tagName === "controller-component") {
            creationCode += generateController(element, parentVarName, varName);
        } else if (tagName === "component") {
            creationCode += generateComponent(element, parentVarName, varName);
        } else {
            creationCode += `let ${varName} = document.createElement("${tagName}");\n`;
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
                    const regex = /\$\{|\}/;
                    let args = getArgs(templateString);
                    let split = args.split(regex);
                    for (let i = 0; i < split.length; i++) {
                        let varPath = split[i];
                        creationCode += `\t\t${data.modelParamName}.addGetters(${varPath}, (${args}) => {return ${varPath};});\n`;
                    }
                    creationCode += `\t\t${data.modelParamName}.addAttributeCallback(${varName}, "${name}", "${attr.value}", ${args});\n`;
                } else {
                    creationCode += `\t\t${varName}.setAttribute("${name}", "${attr.value}");\n`;
                }
            });
            if (parentVarName) creationCode += `\t\t${parentVarName}.appendChild(${varName});\n`;
        }
    }

    // Handle children
    Array.from(element.childNodes).forEach((child, index) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            creationCode += generateDomCreationCode(varName, child as Element, varName, index, templateString);
        } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
            creationCode += generateTextNode(child, varName, templateString);
        }
    });

    return creationCode;
}

function generateTextNode(node: Node, varName: string, templaString: TemplateString) {
    let creationCode = "";

    const escapedText = escapeText(node.textContent.trim());
    let splits = escapedText.split(regexSplitVars);
    for (let i = 0; i < splits.length; i++) {
        if (i % 2 === 1) {
            let path = splits[i];
            let args = getArgsByVarName(templaString, path);
            if (path === data.elementParamName)
                creationCode += `\t\t${data.modelParamName}.appendVarContentNode(${varName}, ${data.componentParamName}.content);\n`;
            else
                creationCode += `\t\t${data.modelParamName}.addTextNodeCallback(${varName}, "${path}", (${args}) => { return ${path};}, ${args});\n`;
        } else {
            creationCode += `\t\t${data.modelParamName}.appendTextNode(${varName}, \`${splits[i]}\`);\n`;
        }
    }
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

// function generateCodeFromHtml(template: TemplateString, filePath: string) {
//     // const hasBodyTag = /<body.*?>/.test(htmlString);
//     const hasHeaderTag = /<head.*?>/.test(template.template);

//     const doc = template.node;
//     let generatedCode = "";
//     if (!hasHeaderTag && doc.head.children && doc.head.children.length > 0 && filePath.indexOf("/headers/") >= 0) {
//         console.log(`Error: Header template: ${filePath} should contains a <head> tag.`);
//         return;
//     }
//     // if (doc.body.children && doc.body.children.length > 1) {
//     //     console.log(`Error template: ${filePath} should contains a single root element.`);
//     //     return;
//     // }
//     if (hasHeaderTag && doc.head.children) {
//         generatedCode += generateDomCreationCode(null, template, doc.head as Element, "rootElem", 0);
//     } else if (doc.body.children) {
//         Array.from(doc.body.children).forEach((node, index) => {
//             if (node.nodeType === Node.ELEMENT_NODE) {
//                 generatedCode += generateDomCreationCode(null, template, node as Element, "rootElem", index);
//             }
//         });
//     }
//     return generatedCode;
// }

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
let templateStringCount = 0;

export function generateTemplateFile(filePath: string, model: TemplateModel) {
    data = model;
    handlerCount = 0;
    componentIndex = 0;
    templateStringCount = 0;
    curComponent = null;
    if (model.components && model.components.length > 0) curComponent = model.components[0];
    let code = "";
    code += "// Auto-generated file, do not edit!!!\n";
    code += 'import { Listeners } from "@explicit.js.mvc/listeners";\n';
    code += 'import { RootElement } from "@explicit.js.mvc/template";';
    model.imports.forEach((value, key) => {
        code += value + "\n";
    });
    code += model.beforeClassCode;
    code += model.fullClassNameCode + "\n";
    code += "{\n";
    code += createTemplates(model, model.templateStrings, model.constructorCode);
    code += model.propsCode;
    code += model.methodsCode;
    const outputFilePath = filePath.replace("/src/", "/gen/");
    code += model.generateMethodName;
    code += "\t{\n";
    if (data.modelParamName) {
        code += `\t\t${data.modelParamName}.contentVarName = "${data.elementParamName}";\n`;
        if (data.elementParamName)
            code += `\t\t${data.componentParamName}.appendContentNode(${data.elementParamName});\n`;
    }
    model.templateStrings.forEach((templateString) => {
        code += templateString.leadingText;
        code += getTemplate(templateString);
        code += templateString.trailingText;
    });
    code += "\t}\n";
    code += "}\n";
    code += model.afterClassCode;
    writeFileRecursiveSync(outputFilePath, code);
    filesCount++;
    throw new Error("");
}
