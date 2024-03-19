import {
    ClassDeclaration,
    Project,
    SyntaxKind,
    type SourceFile,
    type ImportDeclaration,
    ts,
    type Type,
    type Node as tsNode,
    type Symbol,
    type ParameterDeclaration,
    type MethodDeclaration
} from "ts-morph";
import {} from "dotenv";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";
import { dirname } from "path";
import { generateTemplateFile } from "./generate.template.js";
import * as acorn from "acorn";
import { simple as walkSimple, ancestor as walkAncestor } from "acorn-walk";
import type { S } from "vite/dist/node/types.d-jgA8ss1A.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __srcDir = __dirname.split("/explicit.js.mvc")[0];
const appDir = __srcDir + "/..";

export class ComponentModel {
    fieldPath: string;
    typeName: string;
    constructorParameters: Array<string>;
}

export class TemplateStringVariable {
    fullVariableExpr: string = "";
    parentNode: Node;
    node: Node;
    variablesNames: Set<string> = new Set();
}

export class TemplateString {
    position: number = 0;
    varName: string = "";
    isReturnStatement: boolean = false;
    leadingText: string = "";
    trailingText: string = "";
    operator: string = "=";
    template: string = "";
    scopedVariables: Set<string> = new Set();
    variableExprs: Array<TemplateStringVariable> = new Array<TemplateStringVariable>();
    node: Document | undefined;
}

export class TemplateModel {
    isHeaderTemplate: boolean = false;
    beforeClassCode: string;
    afterClassCode: string;
    fullClassNameCode: string;
    constructorCode: string;
    propsCode: string[];
    methodsCode: string[];
    generateTemplateCode: string;
    generateMethodName: string;
    generateMethodBody: string;
    templateStrings: Array<TemplateString>;
    components: Array<ComponentModel> = new Array();
    imports: Map<string, string>;
    templateType: string;
    modelType: string;
    elementParamName: string;
    layoutParamName: string;
    layoutParamType: string;
    componentType: string;
    componentParamName: string;
    modelParamName: string;
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

function createComponents(
    model: TemplateModel,
    components: NodeListOf<Element>,
    templateString: TemplateString,
    sourceFile: SourceFile
): void {
    const tempClassName = "TempClassTemplate";
    components.forEach((component) => {
        const tempSourceFile = createTempSourceFile(sourceFile);
        const content = createTempClassContent(sourceFile, tempClassName);
        let methodIndex = 0;
        if (component) {
            let compModel = new ComponentModel();
            model.components.push(compModel);
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
                    compModel.constructorParameters = getConstructorParamType(declaration, model.imports);
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
                        compModel.constructorParameters = getConstructorParamType(symbol, model.imports);
                    }
                }
            }
            if (!assignPath) {
                console.log(`Could not find the assign attribute on the component.`);
                return;
            }
            methodIndex++;
        }
        project.removeSourceFile(tempSourceFile);
    });
}

// Function to process text nodes
function processTextNode(textNode: Text, templateString: TemplateString) {
    // console.log("Text Node:", textNode.nodeValue);
    console.log(textNode.nodeValue);
    let exprs = findAllTemplateStringExpressions(textNode.nodeValue);
    exprs.forEach((expr) => {
        let varExpr = new TemplateStringVariable();
        varExpr.fullVariableExpr = expr;
        varExpr.variablesNames = extractVariables(expr);
        templateString.variableExprs.push(varExpr);
    });
    templateString.variableExprs.forEach((varExpr) => {
        templateString.scopedVariables = new Set<string>([
            ...varExpr.variablesNames,
            ...templateString.scopedVariables
        ]);
    });
}

function processAttributeNode(element: Element, templateString: TemplateString) {
    Array.from(element.attributes).forEach((attr) => {
        // console.log("Attribute Node:", `${attr.nodeName}="${attr.nodeValue}"`);
        let exprs = findAllTemplateStringExpressions(attr.nodeValue);
        exprs.forEach((expr) => {
            let varExpr = new TemplateStringVariable();
            varExpr.fullVariableExpr = expr;
            varExpr.variablesNames = extractVariables(expr);
            templateString.variableExprs.push(varExpr);
        });
    });
}
const dom = new JSDOM("");
function traverseDOM(node: Node, templateString: TemplateString) {
    console.log("TEXXXXXXXXXXX");
    if (node.nodeType === dom.window.Node.TEXT_NODE) {
        processTextNode(node as Text, templateString);
    }
    if (node.nodeType === dom.window.Node.ELEMENT_NODE) {
        processAttributeNode(node as Element, templateString);
        node.childNodes.forEach((child) => {
            traverseDOM(child, templateString);
        });
    }
}

function processTemplateLiterals(
    templateIndex: number,
    templateLiterals: TemplateString[],
    model: TemplateModel,
    sourceFile: SourceFile
) {
    templateLiterals.forEach((templateString) => {
        const dom = new JSDOM(templateString.template);
        const document = dom.window.document;
        const components = document.querySelectorAll("component");
        templateString.node = document;
        templateString.variableExprs = new Array<TemplateStringVariable>();
        traverseDOM(document.body, templateString);
        // let exprs = findAllTemplateStringExpressions(templateString.template);
        // exprs.forEach((expr) => {
        //     let varExpr = new TemplateStringVariable();
        //     varExpr.fullVariableExpr = expr;
        //     varExpr.variablesNames = extractVariables(expr);
        //     templateString.variableExprs.push(varExpr);
        // });
        createComponents(model, components, templateString, sourceFile);
        templateIndex++;
    });
}

// finding expression ${myvar} in template String
function findAllTemplateStringExpressions(input): string[] {
    const results: string[] = [];
    let stack: number[] = [];
    let capture = false;
    let captureStart = 0;

    for (let i = 0; i < input.length; i++) {
        if (input[i] === "$" && input[i + 1] === "{") {
            stack.push(i);
            i++;
            if (!capture) {
                capture = true;
                captureStart = i + 1;
            }
        } else if (input[i] === "}" && stack.length > 0) {
            stack.pop();
            if (stack.length === 0) {
                capture = false;
                results.push(input.substring(captureStart, i));
            }
        }
    }
    return results;
}

function findTopLevelTemplateStringExpressions(input) {
    const results = [];
    let level = 0;
    let captureStart = -1;
    for (let i = 0; i < input.length; i++) {
        if (input[i] === "$" && input[i + 1] === "{") {
            if (level === 0) {
                captureStart = i + 2;
            }
            level++;
            i++;
        } else if (input[i] === "}" && level > 0) {
            level--;
            if (level === 0 && captureStart !== -1) {
                results.push(input.substring(captureStart, i));
                captureStart = -1;
            }
        }
    }
    return results;
}
function findTemplateStrings(node: tsNode): string[] {
    let templateStrings: string[] = [];
    if (
        node.getKind() === SyntaxKind.TemplateExpression ||
        node.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral
    ) {
        templateStrings.push(node.getText());
    }
    node.forEachChild((child) => {
        templateStrings = templateStrings.concat(findTemplateStrings(child));
    });
    return templateStrings;
}

function findRootLevelLambdaWithTemplateStrings(methodDeclaration) {
    const matchingVariables: { [key: string]: string[] } = {};
    const childNodes = methodDeclaration.getChildren();
    childNodes.forEach((node) => {
        if (node.getKind() === SyntaxKind.VariableStatement) {
            const parent = node.getParent();
            if (parent && parent.getKind() === SyntaxKind.Block) {
                const grandParent = parent.getParent();
                if (grandParent && grandParent === methodDeclaration) {
                    const declarations = node.getDeclarations();
                    declarations.forEach((declaration) => {
                        const initializer = declaration.getInitializer();
                        if (initializer && initializer.getKind() === SyntaxKind.ArrowFunction) {
                            const templateStrings = findTemplateStrings(initializer);
                            if (templateStrings.length > 0) {
                                matchingVariables[declaration.getName()] = templateStrings;
                            }
                        }
                    });
                }
            }
        }
    });
    return matchingVariables;
}

function findRootLevelMethodDeclaration(classDeclaration: ClassDeclaration): MethodDeclaration[] | undefined {
    if (classDeclaration) {
        const methodDeclarations = classDeclaration.getMethods();
        return methodDeclarations;
    }
    return undefined;
}

function findRootLevelTemplateStrings(methodDeclaration) {
    const variableTemplateStrings = new Map<string, string>();
    const childNodes = methodDeclaration.getChildren();
    childNodes.forEach((node) => {
        if (node.getKind() === SyntaxKind.VariableStatement) {
            const parent = node.getParent();
            if (parent && parent.getKind() === SyntaxKind.Block) {
                const grandParent = parent.getParent();
                if (grandParent && grandParent === methodDeclaration) {
                    const declarations = node.getDeclarations();
                    declarations.forEach((declaration) => {
                        const initializer = declaration.getInitializer();
                        if (
                            initializer &&
                            (initializer.getKind() === SyntaxKind.TemplateExpression ||
                                initializer.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral)
                        ) {
                            variableTemplateStrings.set(declaration.getName(), initializer.getText());
                        }
                    });
                }
            }
        }
    });
    return variableTemplateStrings;
}

function extractExpressionsFromTemplateString(templateString: string): string[] {
    const regex = /\$\{([^}]+)\}/g;
    let match;
    const expressions: string[] = [];
    while ((match = regex.exec(templateString))) {
        expressions.push(match[1]);
    }

    return expressions;
}

// Extend the Node interface from acorn to include a parent property
interface ExtendedNode extends acorn.Node {
    parent?: ExtendedNode;
}
type AcornNodeWithParent = acorn.Node & { parent?: acorn.Node };
function extractRootVariables(expressions: string[]): Set<string> {
    const identifiers = new Set<string>();

    expressions.forEach((expression) => {
        const ast = acorn.parse(expression, { ecmaVersion: 2020 });
        walkAncestor(ast, {
            Identifier(node, state, ancestors) {
                // Checking if the current node is an Identifier and accessing 'name'
                if (node.type === "Identifier") {
                    // Ensure the direct parent (not an ancestor) is not a MemberExpression
                    const parent = ancestors[ancestors.length - 2];
                    if (parent.type !== "MemberExpression" || parent !== node) {
                        identifiers.add(node.name);
                    }
                }
            }
        });
    });
    return identifiers;
}

function extractVariables(expression: string): Set<string> {
    const identifiers = new Set<string>();
    const ast = acorn.parse(expression, { ecmaVersion: 2020 });
    walkAncestor(ast, {
        Identifier(node, state, ancestors) {
            // Checking if the current node is an Identifier and accessing 'name'
            if (node.type === "Identifier") {
                // Ensure the direct parent (not an ancestor) is not a MemberExpression
                const parent = ancestors[ancestors.length - 2];
                if (parent.type !== "MemberExpression" || parent !== node) {
                    identifiers.add(node.name);
                }
            }
        }
    });
    return identifiers;
}

function findAssignmentDetailsForTemplateExpressions(generateTemplateMethod: MethodDeclaration): Array<TemplateString> {
    const assignments = new Array<TemplateString>();
    let nodes = generateTemplateMethod.getDescendants();
    let methodStart = generateTemplateMethod.getBody().getStart() + 1;
    let methodEnd = generateTemplateMethod.getBody().getEnd() - 1;
    let sourcefile = generateTemplateMethod.getSourceFile().getFullText();
    let lastPosition = methodStart;
    nodes.forEach((node) => {
        if (
            node.getKind() === SyntaxKind.TemplateExpression ||
            node.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral
        ) {
            let templateExpr = node;
            const leadingText = sourcefile.substring(lastPosition, node.getStart());
            lastPosition = node.getEnd();
            let currentNode = templateExpr.getParent();
            while (currentNode) {
                if (currentNode.getKind() === SyntaxKind.BinaryExpression) {
                    const binaryExpr = currentNode.asKind(SyntaxKind.BinaryExpression);
                    if (binaryExpr.getOperatorToken().getKind() === SyntaxKind.PlusEqualsToken) {
                        const leftSide = binaryExpr.getLeft();
                        if (leftSide.getKind() === SyntaxKind.Identifier) {
                            let template = new TemplateString();
                            template.position = position++;
                            template.leadingText = leadingText;
                            template.operator = "+=";
                            template.varName = leftSide.getText();
                            template.template = templateExpr.getText();
                            assignments.push(template);
                            template.template = template.template.substring(1, template.template.length - 1);
                            break;
                        }
                    }
                } else if (currentNode.getKind() === SyntaxKind.VariableDeclaration) {
                    const varDecl = currentNode.asKind(SyntaxKind.VariableDeclaration);
                    if (varDecl.getInitializer() === templateExpr) {
                        let template = new TemplateString();
                        template.position = position++;
                        template.leadingText = leadingText;
                        template.operator = "=";
                        template.varName = varDecl.getName();
                        template.template = templateExpr.getText();
                        template.template = template.template.substring(1, template.template.length - 1);
                        assignments.push(template);
                        break;
                    }
                } else if (currentNode.getKind() === SyntaxKind.ReturnStatement) {
                    let template = new TemplateString();
                    template.position = position++;
                    template.leadingText = leadingText;
                    template.operator = "return";
                    template.varName = "_return_var";
                    template.isReturnStatement = true;
                    template.template = templateExpr.getText();
                    template.template = template.template.substring(1, template.template.length - 1);
                    assignments.push(template);
                    break;
                } else {
                    let template = new TemplateString();
                    template.position = position++;
                    template.leadingText = leadingText;
                    template.operator = "";
                    template.varName = "";
                    template.template = templateExpr.getText();
                    template.template = template.template.substring(1, template.template.length - 1);
                    assignments.push(template);
                    break;
                }
                currentNode = currentNode.getParent();
            }
        }
    });
    if (assignments.length > 0) {
        const trailingText = sourcefile.substring(lastPosition, methodEnd);
        assignments[assignments.length - 1].trailingText = trailingText;
    }
    return assignments;
}

function getClassConstructorAsString(cls: ClassDeclaration): string {
    const constructors = cls.getConstructors();
    if (constructors.length > 0) {
        return constructors[0].getFullText();
    }
    return "";
}

function getClassFieldsAsString(cls: ClassDeclaration): string[] {
    const fields = cls.getProperties();
    const fieldTexts = fields.map((field) => field.getFullText());
    return fieldTexts;
}

function getClassMethodsAsString(cls: ClassDeclaration): string[] {
    const methods = cls.getMethods();
    const methodsTexts = methods.map((method) => {
        if (method.getName() !== "generateTemplate") return method.getFullText();
    });
    return methodsTexts;
}

function getFullClassNameString(cls: ClassDeclaration): string {
    const fullSourceText = cls.getSourceFile().getFullText();

    const startPos = cls.getPos();
    const openBracePos = cls.getFirstChildByKind(ts.SyntaxKind.OpenBraceToken).getPos();
    const classDeclarationWithoutBody = fullSourceText.substring(startPos, openBracePos);
    return classDeclarationWithoutBody;
}

function getFullMethodNameString(method: MethodDeclaration): string {
    const methodBody = method.getBody();
    if (!methodBody) {
        console.error("Method does not have a body.");
        return "";
    }

    // Use the text of the source file up to the start of the method body as the method signature
    const fullSourceText = method.getSourceFile().getFullText();
    const methodSignature = fullSourceText.substring(method.getPos(), methodBody.getPos());

    return methodSignature;
}
function getMethodBodyString(method: MethodDeclaration): string {
    const fullSourceText = method.getSourceFile().getFullText();
    const methodBody = method.getBody();
    const methodBodyText = methodBody ? methodBody.getText() : "";
    const methodBodyTextWithoutBraces = methodBodyText.slice(1, -1);
    return methodBodyTextWithoutBraces;
}

function getBeforeClassCode(cls: ClassDeclaration, sourceFile: SourceFile): string {
    const startPos = cls.getPos();
    const fullText = sourceFile.getFullText();
    const codeBeforeClass = fullText.substring(0, startPos);
    return codeBeforeClass;
}

function getAfterClassCode(cls: ClassDeclaration, sourceFile: SourceFile): string {
    const endPos = cls.getEnd();
    const fullText = sourceFile.getFullText();
    const codeAfterClass = fullText.substring(endPos);
    return codeAfterClass;
}

let position = 0;
export function processTemplateFile(filePath: string, replacedOrRemoved: boolean) {
    position = 0;
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
                const templateLiterals = findAssignmentDetailsForTemplateExpressions(generateTemplateMethod);
                const hasHeaderTag = /<head.*?>/.test(generateTemplateMethod.getFullText());
                if (templateLiterals.length === 0) console.log("Error: No templates found!");
                else {
                    const model: TemplateModel = {
                        isHeaderTemplate: hasHeaderTag,
                        components: new Array(),
                        beforeClassCode: getBeforeClassCode(cls, sourceFile),
                        afterClassCode: getAfterClassCode(cls, sourceFile),
                        constructorCode: getClassConstructorAsString(cls),
                        fullClassNameCode: getFullClassNameString(cls),
                        methodsCode: getClassMethodsAsString(cls),
                        propsCode: getClassFieldsAsString(cls),
                        generateTemplateCode: generateTemplateMethod.getFullText(),
                        generateMethodName: getFullMethodNameString(generateTemplateMethod),
                        generateMethodBody: getMethodBodyString(generateTemplateMethod),
                        templateStrings: templateLiterals,
                        templateType: templateType,
                        modelType: modelType,
                        elementParamName: elementParamName === null ? "" : elementParamName,
                        layoutParamName: layoutParamName === null ? "" : layoutParamName,
                        layoutParamType: layoutParamType === null ? "" : layoutParamType,
                        componentType: componentType,
                        componentParamName: componentParamName,
                        modelParamName: modelParam?.getName(),
                        imports: imports
                    };
                    processTemplateLiterals(0, templateLiterals, model, sourceFile);
                    console.log(model);
                    generateTemplateFile(filePath, model);
                    throw new Error("error");
                }
            }
        }
    }
}
