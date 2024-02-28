import { Project, type PropertyDeclaration, type SourceFile, type TypeParameterDeclaration } from "ts-morph";
import {} from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { removeControllerFile } from "./remove.controllers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __srcDir = __dirname.split("/explicit.js.mvc")[0];
const sourceDir = __srcDir + "/explicit.js.mvc";
const appDir = __srcDir + "/..";
const routesFilePath = sourceDir + "/routing/routes.ts";

function extractBetween(input: string, start: string, end: string): string | null {
    // Escape special characters for regex
    const escapedStart = start.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const escapedEnd = end.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

    const regex = new RegExp(`${escapedStart}(.+?)${escapedEnd}`);
    const match = input.match(regex);
    return match ? match[1] : null;
}

function addImportIfNotExists(sourceFile: SourceFile, moduleSpecifier: string, namedImports: string) {
    // Check if the import declaration already exists
    const existingImport = sourceFile.getImportDeclaration(moduleSpecifier);

    if (existingImport) {
        // Check if the named import already exists within the import declaration
        const existingNamedImport = existingImport.getNamedImports().find((ni) => ni.getName() === namedImports);
        if (!existingNamedImport) {
            // If the named import does not exist, add it to the existing import declaration
            existingImport.addNamedImport(namedImports);
        }
    } else {
        // If the import declaration does not exist, add a new one
        sourceFile.addImportDeclaration({
            moduleSpecifier,
            namedImports: [namedImports]
        });
    }
}

function removeImportIfExists(sourceFile: SourceFile, moduleSpecifier: string) {
    const existingImport = sourceFile.getImportDeclaration(moduleSpecifier);
    if (existingImport) {
        existingImport.remove();
    }
}

function removeProperty(sourceFile: SourceFile, moduleSpecifier: string) {
    const existingImport = sourceFile.getImportDeclaration(moduleSpecifier);
    if (existingImport) {
        existingImport.remove();
    }
}

export function getPropTypeName(prop: PropertyDeclaration): string {
    const typeNode = prop.getTypeNode();
    const typeName = typeNode ? typeNode.getText() : "unknown";

    return typeName;
}

export function processControllerFile(controllerFilePath: string, replacedOrRemoved: boolean) {
    const routeClassName = "Routes";
    const project = new Project({
        tsConfigFilePath: appDir + "/tsconfig.json"
    });
    // Add or get the controller source file
    let controllerSourceFile = null;
    let controllerClassName = null;

    const importPath = extractBetween(controllerFilePath, "/controllers/", ".controller.ts").trim();
    const parts = importPath.split("/");
    const fieldName = parts[parts.length - 1].replaceAll(".controller.ts", "").toLowerCase();

    if (replacedOrRemoved) {
        removeControllerFile(controllerFilePath, project, fieldName, importPath);
        return;
    }

    controllerSourceFile = project.addSourceFileAtPath(controllerFilePath);
    controllerClassName = controllerSourceFile.getClasses()[0]?.getName();

    project.addSourceFileAtPath(controllerFilePath);
    project.addSourceFileAtPath(routesFilePath);
    const routesFile = project.getSourceFile(routesFilePath);
    let routeClass = routesFile.getClass(routeClassName);
    let fieldType = controllerClassName;

    if (!controllerClassName) {
        console.error("No class found in the controller file.");
        return;
    }
    if (!routeClass) {
        console.error(`Class ${routeClassName} not found in ${routesFilePath}.`);
        return;
    }
    const existingProperty = routeClass.getProperty(fieldName);
    if (existingProperty && getPropTypeName(existingProperty) === fieldType) {
        addImportIfNotExists(routesFile, `@controller/${importPath}`, controllerClassName);
        console.log(`The field '${fieldName}' already exists in ${routeClassName}, skipping code generation.`);
        routesFile.saveSync();
        return;
    }

    if (!existingProperty) {
        addImportIfNotExists(routesFile, `@controller/${importPath}`, controllerClassName);
        routeClass.addProperty({
            name: fieldName,
            type: fieldType,
            isStatic: false,
            initializer: `Router.register("${fieldType}",${fieldType})`
        });
    }
    routesFile.saveSync();
}

// const controllerFilePath = process.argv[2];
// const replacedOrRemoved = process.argv[3];
// if (controllerFilePath && replacedOrRemoved) {
//     await processControllerFile(controllerFilePath, replacedOrRemoved);
// } else {
//     console.log("No controller file path provided.");
// }
