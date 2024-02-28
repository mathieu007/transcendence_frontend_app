import {
    ClassDeclaration,
    Project,
    SyntaxKind,
    type SourceFile,
    type ImportDeclaration,
    ts,
    type Type,
    type Node,
    type Symbol,
    type ParameterDeclaration
} from "ts-morph";
import {} from "dotenv";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";
import { dirname } from "path";
import { generateTemplateFile } from "./generate.template.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __srcDir = __dirname.split("/explicit.js.mvc")[0];
const appDir = __srcDir + "/..";

export class ComponentModel {
    fieldPath: string;
    typeName: string;
    constructorParameters: Array<string>;
}

export class TemplateModel {
    imports: Map<string, string>;
    templateType: string;
    modelType: string;
    elementParamName: string;
    layoutParamName: string;
    layoutParamType: string;
    componentType: string;
    componentParamName: string;
    modelParamName: string;
    components: Array<ComponentModel>;
}

// Initialize a Project - assumes you have a tsconfig.json file in your project
const project = new Project({
    tsConfigFilePath: appDir + "/tsconfig.json"
});

function getHeritedTemplateType(classDeclaration: ClassDeclaration): string {
    const heritageClauses = classDeclaration.getHeritageClauses();
    for (const clause of heritageClauses) {
        const types = clause.getTypeNodes();
        for (const type of types) {
            const identifier = type.getFirstChildByKind(SyntaxKind.Identifier);
            if (identifier?.getText() === "Template") {
                const typeArguments = type.getTypeArguments();
                if (typeArguments.length > 0) {
                    const implementedType = typeArguments[0].getText();
                    return implementedType;
                }
            }
        }
    }
}

function findImportByTypeName(sourceFile: SourceFile, type: string): ImportDeclaration | undefined {
    const importDeclaration = sourceFile.getImportDeclaration((declaration) => {
        return declaration.getNamedImports().some((namedImport) => namedImport.getName() === type);
    });
    return importDeclaration;
}

function createTempSourceFile(sourceFile: SourceFile): SourceFile {
    const tempSourceFile = project.createSourceFile(sourceFile.getFilePath() + ".tempFile.ts", "", {
        overwrite: true
    });
    return tempSourceFile;
}

function createTempClassContent(sourceFile: SourceFile, tempClassName: string): string {
    let content = sourceFile.getText();
    const pattern = /export class (.+?)Template extends/;

    content = content.replace(pattern, `export class ${tempClassName} extends`);
    return content;
}

function getExpressionReturnType(
    extractedExpression: string,
    tempSourceFile: SourceFile,
    tempClassName: string,
    methodIndex: number,
    content: string
): Type<ts.Type> {
    let index = content.lastIndexOf("}");
    if (index === -1) return undefined;
    let start = content.substring(0, index);
    let methodname = `tempMethod${methodIndex}`;
    let method = `
        ${methodname}() {
            return ${extractedExpression};
        }`;
    let end = content.substring(index);
    content = start + method + end;
    tempSourceFile.addStatements(content);
    const tempClass = tempSourceFile.getClassOrThrow(tempClassName);
    const tempMethod = tempClass.getMethodOrThrow(methodname);
    const returnStatement = tempMethod.getDescendantsOfKind(SyntaxKind.ReturnStatement)[0];
    // let returnTypeName = "";
    let returnType: Type<ts.Type>;
    if (returnStatement) {
        returnType = returnStatement.getExpression()?.getType();
        // returnTypeName = returnType?.getText();
    }
    return returnType;
}

function getTypeNameFromType(
    attrType: string,
    sourceFile: SourceFile,
    tempClassName: string,
    methodIndex: number,
    content: string
): string {
    const returnType = getExpressionReturnType(attrType, sourceFile, tempClassName, methodIndex, content);
    let typeName = "";
    if (returnType.isUnion()) {
        const types = returnType.getUnionTypes();
        let typeCount = 0;
        types.forEach((type) => {
            if (typeName !== "undefined" && typeName !== "null") {
                typeName = type.getText();
                typeCount++;
            }
        });
        if (typeCount > 1 || typeCount === 0) {
            console.log(`The type attribute on the component is invalid, should be a valid type.`);
        }
    } else {
        typeName = returnType.getText();
    }
    return typeName;
}

function getTypeName(returnType: Type<ts.Type>): string {
    let typeName = "";
    if (returnType.isUnion()) {
        const types = returnType.getUnionTypes();
        let typeCount = 0;
        types.forEach((type) => {
            if (typeName !== "undefined" && typeName !== "null") {
                typeName = type.getText();
                typeCount++;
            }
        });
        if (typeCount > 1 || typeCount === 0) {
            throw new Error(`The type attribute on component tag is invalid. You should specify a valid type.`);
        }
    } else {
        typeName = returnType.getText();
    }
    return typeName;
}

function getImportDeclaration(importTypeName: string): Symbol {
    let match = importTypeName.match(/typeof import\("(.+)"\)\.(.+)/);
    if (!match) match = importTypeName.match(/import\("(.+)"\)\.(.+)/);
    if (match) {
        let [, importPath, typeName] = match;
        typeName = typeName.trim();
        importPath = importPath.trim();
        // Try to get the source file
        const sourceFile = project.getSourceFile(importPath + ".ts");
        if (sourceFile) {
            // Now find the export declaration or class declaration by name
            const exportDeclaration = sourceFile.getClasses();

            const exportedSymbol = exportDeclaration
                .find((n) => n.getName() === typeName)
                .getNameNode()
                .getSymbol();
            return exportedSymbol;
        }
    }
}
function setImport(param: ParameterDeclaration, map: Map<string, string>): void {
    const sourceFile = param.getSourceFile();
    const symbol = param.getType().getSymbol();
    const importDeclarations = sourceFile.getImportDeclarations();
    importDeclarations.forEach((importDeclaration) => {
        const namedImports = importDeclaration.getNamedImports();
        namedImports.forEach((namedImport) => {
            if (namedImport.getName() === symbol.getName()) {
                const importPath = importDeclaration.getModuleSpecifier().getLiteralValue();
                let importLine = `import { ${symbol.getName()} } from "${importPath}";`;
                map.set(symbol.getName(), importLine);
            }
        });
    });
}

function getConstructorParamType(typeSymbol: Symbol, map: Map<string, string>) {
    const declarations = typeSymbol.getDeclarations();
    const classDeclaration = declarations.length > 0 ? declarations[0] : null;
    if (classDeclaration && classDeclaration.isKind(ts.SyntaxKind.ClassDeclaration)) {
        const constructorDeclaration = classDeclaration.getConstructors()[0];
        if (constructorDeclaration) {
            const parameterTypes = constructorDeclaration.getParameters().map((parameter) => {
                const type = parameter.getType();
                setImport(parameter, map);
                const typeText = type.getText(parameter);
                return typeText;
            });
            return parameterTypes;
        }
    }
    return Array<string>();
}

export function processTemplateFile(filePath: string, replacedOrRemoved: boolean) {
    let imports: Map<string, string> = new Map<string, string>();
    const sourceFile = project.getSourceFileOrThrow(filePath);
    const classes = sourceFile.getClasses();
    for (const cls of classes) {
        const baseClass = cls.getBaseClass();
        if (
            baseClass?.getName().includes("Template") ||
            baseClass?.getName().includes("LayoutTemplate") ||
            baseClass?.getName().includes("HeaderTemplate") ||
            baseClass?.getName().includes("ControllerTemplate")
        ) {
            const templateBaseTypeArg = baseClass.getTypeParameters()[0];
            const templateBaseGenericTypeName = templateBaseTypeArg?.getText();
            if (templateBaseGenericTypeName !== "TModel extends DomObservableModel")
                console.log(
                    `Template ${cls.getName()} does not extends Template<T> or LayoutTemplate<T> or HeaderTemplate<T> or ControllerTemplate<T>, T should be a class that extend DomObservableModel.`
                );
            const generateTemplateMethod = cls.getMethod("generateTemplate");
            if (generateTemplateMethod) {
                const parameters = generateTemplateMethod.getParameters();
                const compParam = parameters[0];
                const modelParam = parameters[1];
                const childContentParam = parameters[2];
                const layoutParam = parameters[3];

                const templateType = cls.getName();
                const modelType = getHeritedTemplateType(cls);
                let elementParamName: string = null;
                let layoutParamName: string = null;
                let layoutParamType: string = null;
                if (layoutParam) {
                    layoutParamName = layoutParam.getName();
                    layoutParamType = layoutParam.getTypeNode().getText();
                }
                if (childContentParam) elementParamName = childContentParam.getName();
                const componentType = compParam.getTypeNode().getText();
                const componentParamName = compParam.getName();

                // Results
                const results: TemplateModel = {
                    templateType: templateType,
                    modelType: modelType,
                    elementParamName: elementParamName === null ? "" : elementParamName,
                    layoutParamName: layoutParamName === null ? "" : layoutParamName,
                    layoutParamType: layoutParamType === null ? "" : layoutParamType,
                    componentType: componentType,
                    componentParamName: componentParamName,
                    modelParamName: modelParam?.getName(),
                    components: new Array<ComponentModel>(),
                    imports: imports
                };

                const templateLiteral = generateTemplateMethod.getFirstDescendantByKind(SyntaxKind.TemplateExpression);

                const templateText = templateLiteral?.getText();
                const dom = new JSDOM(templateText);
                const document = dom.window.document;
                const tempClassName = "TempClassTemplate";
                const components = document.querySelectorAll("component");
                if (components.length > 0) {
                    const tempSourceFile = createTempSourceFile(sourceFile);
                    const content = createTempClassContent(sourceFile, tempClassName);
                    let methodIndex = 0;
                    components.forEach((component) => {
                        if (component) {
                            let compModel = new ComponentModel();
                            results.components.push(compModel);
                            let returnTypeName = "";
                            let attrType = component.getAttribute("type");
                            if (attrType) attrType = attrType.trim();
                            if (attrType && attrType.startsWith("${") && attrType.endsWith("}")) {
                                attrType = attrType.substring(2).substring(0, attrType.length - 3);
                                const returnType = getExpressionReturnType(
                                    attrType,
                                    tempSourceFile,
                                    tempClassName,
                                    methodIndex,
                                    content
                                );
                                returnTypeName = getTypeName(returnType);
                                const declaration = getImportDeclaration(returnTypeName);
                                if (declaration) {
                                    compModel.typeName = declaration.getName();
                                    compModel.constructorParameters = getConstructorParamType(declaration, imports);
                                }
                            }
                            methodIndex++;
                            let attrAssign = component.getAttribute("assign");
                            let assignPath = "";
                            if (attrAssign) attrAssign = attrAssign.trim();
                            if (attrAssign && attrAssign.startsWith("${") && attrAssign.endsWith("}")) {
                                assignPath = attrAssign.substring(2).substring(0, attrAssign.length - 3);
                                compModel.fieldPath = assignPath;
                                if (!compModel.typeName) {
                                    const returnType = getExpressionReturnType(
                                        assignPath,
                                        tempSourceFile,
                                        tempClassName,
                                        methodIndex,
                                        content
                                    );
                                    returnTypeName = getTypeName(returnType);
                                    const symbol = getImportDeclaration(returnTypeName);
                                    if (symbol) {
                                        compModel.typeName = symbol.getName();
                                        compModel.constructorParameters = getConstructorParamType(symbol, imports);
                                    }
                                }
                            }
                            if (!assignPath) {
                                console.log(`Could not find the assign attribute on the component.`);
                                return;
                            }

                            methodIndex++;
                        }
                    });
                    project.removeSourceFile(tempSourceFile);
                }

                console.log(results);
                generateTemplateFile(filePath, results);
            }
        }
    }
}
