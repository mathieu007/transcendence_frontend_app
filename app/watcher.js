import { watch } from "chokidar";
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { JSDOM } from "jsdom";
import { Parser } from "htmlparser2";

let dom = new JSDOM("");

function parseHtml(initialNode, html) {
    let currentNode = initialNode; // Start from the initial node
    let nodeStack = [currentNode]; // Initialize stack with the initial node

    const parser = new Parser(
        {
            onopentag(name) {
                const newNode = dom.window.document.createElement(name);
                currentNode.appendChild(newNode);
                currentNode = newNode; // Move into the new node
            },
            onclosetag() {
                if (currentNode.parentNode) {
                    // Move back up to the parent node
                    currentNode = currentNode.parentNode;
                }
            }
        },
        { decodeEntities: true }
    );

    parser.write(html);
    parser.end();

    console.log(
        "Navigation completed. Last unclosed node:",
        currentNode ? currentNode.name : "No current node"
    );
    return currentNode;
}

const { Node, Element } = dom.window;
var modelVarName = "";
var contentVarName = "";
var componentVarName = "";

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

function generateComponent(element, varName, tagName) {
    let tags = tagName.split("-");
    tagName = "";
    tags.forEach((tag) => {
        tag[0].toUpperCase();
        tagName += tag;
    });
    Array.from(element.attributes).forEach((attr, index) => {
        const name = attr.name;
        const value = attr.value;
        if (name === "click") {
            //nothing to do now
        } else if (name === "template") {
            //nothing to do now
        } else if (name === "model") {
            //nothing to do now
        } else if (value.indexOf("${") !== -1) {
            creationCode += `\t\t${modelVarName}.addAttributeCallback(${varName}, "${name}", "${value}");\n`;
        } else {
            creationCode += `\t\t${varName}.setAttribute("${name}", "${value}");\n`;
        }
    });
}

function extractFunctionBody(functionString) {
    let depth = 0;
    let inString = false;
    let inComment = false;
    let stringChar = "";
    let start = -1;
    let end = -1;
    let escapeNext = false;

    for (let i = 0; i < functionString.length; i++) {
        const char = functionString[i];
        const nextChar = functionString[i + 1];

        // Handle escape character within strings
        if (inString && char === "\\" && !escapeNext) {
            escapeNext = true;
            continue;
        }
        // Exiting string mode
        if (inString && char === stringChar && !escapeNext) {
            if (stringChar === "`" || char !== "`") {
                inString = false;
            }
        } else if (!inString && !inComment) {
            // Entering string mode
            if (char === '"' || char === "'" || char === "`") {
                inString = true;
                stringChar = char;
            }
        }
        // Handle comments
        if (!inString && !inComment && char === "/" && nextChar === "/") {
            inComment = "line";
            i++; // Skip next char
        } else if (
            !inString &&
            !inComment &&
            char === "/" &&
            nextChar === "*"
        ) {
            inComment = "block";
            i++; // Skip next char
        } else if (inComment === "line" && char === "\n") {
            inComment = false;
        } else if (inComment === "block" && char === "*" && nextChar === "/") {
            inComment = false;
            i++; // Skip next char
        }
        if (!inString && !inComment) {
            // Tracking braces only if not in a string or comment
            if (char === "{") {
                depth++;
                if (depth === 1) start = i + 1;
            } else if (char === "}") {
                depth--;
                if (depth === 0) {
                    end = i;
                    break; // Assuming we want to stop at the first function's closing brace
                }
            }
        }
        escapeNext = false;
    }
    if (start !== -1 && end !== -1) {
        return functionString.substring(start, end).trim();
    }
    return ""; // No function body found or braces unbalanced
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

function generateDomCreationCode(element, varNamePrefix = "elem", depth = 0) {
    const varName = `${varNamePrefix}_${depth}`;
    const tagName = element.tagName.toLowerCase();
    let creationCode = "";
    if (tagName.endsWith("-component"))
        creationCode += generateComponent(element, varName, tagName);
    else {
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
            }

            // else if (name === "template") {
            //     //nothing to do now
            // } else if (name === "model") {
            //     //nothing to do now }
            else if (attr.value.indexOf("${") !== -1) {
                creationCode += `\t\t${modelVarName}.addAttributeCallback(${varName}, "${name}", "${attr.value}");\n`;
            } else {
                creationCode += `\t\t${varName}.setAttribute("${name}", "${attr.value}");\n`;
            }
        });
    }

    // Handle children
    Array.from(element.childNodes).forEach((child, index) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            creationCode += generateDomCreationCode(child, varName, index);
            creationCode += `\t\t${varName}.appendChild(${varName}_${index});\n`;
        } else if (
            child.nodeType === Node.TEXT_NODE &&
            child.textContent?.trim()
        ) {
            const escapedText = escapeText(child.textContent.trim());
            let splits = escapedText.split(regexSplitVars);
            for (let i = 0; i < splits.length; i++) {
                if (i % 2 === 1) {
                    let path = splits[i];
                    if (path === contentVarName)
                        creationCode += `\t\t${modelVarName}.setVarContentNode(${varName}, ${componentVarName}.content);\n`;
                    else
                        creationCode += `\t\t${modelVarName}.addTextNodeCallback(${varName}, "${path}");\n`;
                } else
                    creationCode += `\t\t${modelVarName}.setTextNode(${varName}, "${splits[i]}");\n`;
            }
        }
    });
    return creationCode;
}

function generateCodeFromHtml(htmlString) {
    const dom = new JSDOM(htmlString);
    const doc = dom.window.document;
    let generatedCode = "";
    Array.from(doc.body.childNodes).forEach((node, index) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            generatedCode += generateDomCreationCode(node, "rootElem", index);
        }
    });
    return generatedCode;
}

const regexMatchVars =
    /generateTemplate\(\s*([^,]+?)\s*,\s*([^,]+?)((\s*,\s*([^,]+?)\s*)|)\)/;

function setVariableName(str) {
    let matches = str.match(regexMatchVars);
    if (matches) {
        if (matches[1]) componentVarName = matches[1].split(":")[0].trim();
        else componentVarName = "";
        if (matches[2]) modelVarName = matches[2].split(":")[0].trim();
        else modelVarName = "";
        if (matches[3] && matches[3].trim() !== "")
            contentVarName = matches[5].split(":")[0].trim();
        else contentVarName = "";
    } else {
        componentVarName = "";
        modelVarName = "";
        contentVarName = "";
    }
}

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

function processFile(filePath) {
    handlerCount = 0;
    console.log(`File ${filePath} has changed, generating template...`);
    const templateString = readFileSync(filePath, "utf8");
    const strs = templateString.split("`");
    setVariableName(strs[0]);
    let code = "";
    if (strs.length == 3) {
        code += generateCodeFromHtml(strs[1]);
    } else throw new Error(`File: ${filePath} do not have template.`);
    const outputFilePath = filePath
        .replace(".template.ts", ".dom.ts")
        .replace("src/", "gen/");
    let lastIndex = strs[0].lastIndexOf("{") + 1;
    let prefix = "";
    let str = strs[0];
    if (lastIndex >= 0) str = strs[0].substring(0, lastIndex);
    prefix = "// Auto-generated file, do not edit!!!\n";
    prefix += 'import { Listeners } from "@explicit.js.mvc/listeners";\n';
    prefix += str + "\n";
    if (modelVarName !== "")
        prefix += `\t\t${modelVarName}.contentVarName = "${contentVarName}";\n`;
    let suffix = "\t\tthis.rootElement = rootElem_0;\n";
    suffix += "\t\treturn this.rootElement;\n";
    suffix += strs[2].substring(strs[2].indexOf("}") + 2) + "\n";
    suffix += "\n}\n";
    writeFileRecursiveSync(outputFilePath, prefix + code + suffix);
    console.log(`Generated file: ${outputFilePath}`);
    filesCount++;
}

function processDirectory(directory) {
    readdirSync(directory, { withFileTypes: true }).forEach((dirent) => {
        const fullPath = join(directory, dirent.name);
        if (fullPath && fullPath.indexOf("explicit.js.mvc") === -1) {
            if (dirent.isDirectory()) {
                processDirectory(fullPath);
            } else if (
                dirent.isFile() &&
                dirent.name.endsWith(".template.ts")
            ) {
                processFile(fullPath);
            }
        }
    });
}

// Initial processing of all .html.ts files
processDirectory(filesDirectory);

// Set up the watcher for changes
watch(`${filesDirectory}/**/*.template.ts`).on("change", (filePath) => {
    if (fullPath && fullPath.indexOf("explicit.js.mvc") === -1) {
        processFile(filePath);
    }
});
