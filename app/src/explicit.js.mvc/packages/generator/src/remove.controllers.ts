import { Project, type PropertyDeclaration, type SourceFile } from "ts-morph";
import {} from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __srcDir = __dirname.split("/explicit.js.mvc")[0];
const sourceDir = __srcDir + "/explicit.js.mvc";
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

function getPropTypeName(prop: PropertyDeclaration): string {
    const typeNode = prop.getTypeNode();

    // If a type node exists, return its text, otherwise default to "unknown"
    const typeName = typeNode ? typeNode.getText() : "unknown";
    return typeName;
}

export function removeControllerFile(controllerFilePath: string, project: Project, fieldName: string, importPath: string): void {
    const routeClassName = "Routes";
    // Add or get the controller source file
    let controllerSourceFile = null;
    let controllerClassName = null;

    project.addSourceFileAtPath(routesFilePath);
    const routesFile = project.getSourceFile(routesFilePath);
    let routeClass = routesFile.getClass(routeClassName);
    let fieldType = controllerClassName;

    if (!controllerClassName) {
        console.log("controllerClassName: ", controllerClassName, " replacedOrRemoved: ");
        let prop = routeClass.getProperty(fieldName);
        if (!prop) return;
        controllerClassName = getPropTypeName(prop).trim();
        console.log("removing type: '" + controllerClassName + "'");
        fieldType = controllerClassName;
    }
    if (!routeClass) {
        console.error(`Class ${routeClassName} not found in ${routesFilePath}.`);
        return;
    }
    const existingProperty = routeClass.getProperty(fieldName);
    console.log(`remove import: "@controller/${importPath}"`);
    console.log(`removing field name: ${fieldName}, ${existingProperty.getText()}`);
    existingProperty.remove();
    removeImportIfExists(routesFile, `@controller/${importPath}`);
    routesFile.saveSync();
}
