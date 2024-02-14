import { Project, SyntaxKind } from "ts-morph";
require("dotenv").config();

function processControllerFile(controllerFilePath: string): void {
    const appFilePath = process.env.APP_FILE_PATH || "./src/app.ts";
    const appClassName = process.env.APP_CLASS_NAME || "App";
    const project = new Project({
        tsConfigFilePath: "tsconfig.json"
    });

    // Add or get the controller source file
    const controllerSourceFile =
        project.addSourceFileAtPath(controllerFilePath);
    const className = controllerSourceFile.getClasses()[0]?.getName();
    const appSourceFile = project.addSourceFileAtPath(controllerFilePath);

    if (!className) {
        console.error("No class found in the controller file.");
        return;
    }

    const fieldName = className.replace(/Controller$/, "").toLowerCase();
    const fieldType = className;

    let appClass = appSourceFile.getClass(appClassName);

    if (!appClass) {
        console.error(`Class ${appClassName} not found in ${appFilePath}.`);
        return;
    }

    // Check if the field already exists in the class
    const existingProperty = appClass.getProperty(fieldName);
    if (existingProperty) {
        console.log(
            `The field '${fieldName}' already exists in ${appClassName}.`
        );
        return;
    }

    // Add the new field to the class
    appClass.addProperty({
        name: fieldName,
        type: fieldType,
        initializer: `Container.register(${fieldType})`
    });

    // Save changes
    appSourceFile.saveSync();
}

// Expect the file path as an argument
const controllerFilePath = process.argv[2];
if (controllerFilePath) {
    processControllerFile(controllerFilePath);
} else {
    console.log("No controller file path provided.");
}
