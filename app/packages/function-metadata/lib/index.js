"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts = __importStar(require("typescript"));
const file = __importStar(require("./find.files"));
function visit(node) {
    if (ts.isMethodDeclaration(node) && ts.canHaveDecorators(node)) {
        let method = node;
        ts.getDecorators(method)?.forEach((decorator) => {
            if (ts.isCallExpression(decorator.expression)) {
                const decoratorIdentifier = decorator.expression.expression;
                if (ts.isIdentifier(decoratorIdentifier) &&
                    decoratorIdentifier.text === "Route") {
                    console.log("Found @Route decorator");
                    console.log("Method name:", method.name.getText());
                    method.parameters.forEach((parameter) => {
                        console.log("Parameter:", parameter.name.getText());
                    });
                }
            }
        });
    }
    ts.forEachChild(node, visit);
}
class UserService {
    getUser(id) {
        return { id: 2, name: "user" };
    }
    updateUser(id, user) {
        return true;
    }
}
function invokeInstanceMethod(instance, methodName, ...args) {
    return instance[methodName](...args);
}
const userService = new UserService();
const user = invokeInstanceMethod(userService, "getUser", 1);
const success = invokeInstanceMethod(userService, "updateUser", 1, {
    id: 1,
    name: "John Doe"
});
function generate() {
}
function parseSourceFile(fileNames) {
    fileNames.forEach((fileName) => {
        const fileContent = ts.sys.readFile(fileName);
        if (fileContent) {
            const sourceFile = ts.createSourceFile(fileName, fileContent, ts.ScriptTarget.Latest, true);
            ts.forEachChild(sourceFile, visit);
        }
    });
}
// Using the functions to parse all TypeScript files in a directory
const tsFiles = file.findAllTsFiles("../../../src");
parseSourceFile(tsFiles);
//# sourceMappingURL=index.js.map