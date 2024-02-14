import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import * as file from "./find.files";

function visit(node: ts.Node) {
    if (ts.isMethodDeclaration(node) && ts.canHaveDecorators(node)) {
        let method = node;
        ts.getDecorators(method)?.forEach((decorator) => {
            if (ts.isCallExpression(decorator.expression)) {
                const decoratorIdentifier = decorator.expression.expression;
                if (
                    ts.isIdentifier(decoratorIdentifier) &&
                    decoratorIdentifier.text === "Route"
                ) {
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


function parseSourceFile(fileNames: string[]) {
    fileNames.forEach((fileName) => {
        const fileContent = ts.sys.readFile(fileName);
        if (fileContent) {
            const sourceFile = ts.createSourceFile(
                fileName,
                fileContent,
                ts.ScriptTarget.Latest,
                true
            );
            ts.forEachChild(sourceFile, visit);
        }
    });
}

// Using the functions to parse all TypeScript files in a directory
const tsFiles = file.findAllTsFiles("../../../src");
parseSourceFile(tsFiles);
