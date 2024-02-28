"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_morph_1 = require("ts-morph");
require("dotenv").config();
function processControllerFile(controllerFilePath) {
    var _a;
    var appFilePath = process.env.APP_FILE_PATH || "./src/app.ts";
    var appClassName = process.env.APP_CLASS_NAME || "App";
    var project = new ts_morph_1.Project({
        tsConfigFilePath: "tsconfig.gen.json"
    });
    // Add or get the controller source file
    var controllerSourceFile = project.addSourceFileAtPath(controllerFilePath);
    var className = (_a = controllerSourceFile.getClasses()[0]) === null || _a === void 0 ? void 0 : _a.getName();
    var appSourceFile = project.addSourceFileAtPath(controllerFilePath);
    if (!className) {
        console.error("No class found in the controller file.");
        return;
    }
    var fieldName = className.replace(/Controller$/, "").toLowerCase();
    var fieldType = className;
    var appClass = appSourceFile.getClass(appClassName);
    if (!appClass) {
        console.error("Class ".concat(appClassName, " not found in ").concat(appFilePath, "."));
        return;
    }
    // Check if the field already exists in the class
    var existingProperty = appClass.getProperty(fieldName);
    if (existingProperty) {
        console.log("The field '".concat(fieldName, "' already exists in ").concat(appClassName, "."));
        return;
    }
    // Add the new field to the class
    appClass.addProperty({
        name: fieldName,
        type: fieldType,
        initializer: `Container.register("${fieldType}", ${fieldType})`
    });
    // Save changes
    appSourceFile.saveSync();
}
// Expect the file path as an argument
var controllerFilePath = process.argv[2];
if (controllerFilePath) {
    processControllerFile(controllerFilePath);
}
else {
    console.log("No controller file path provided.");
}
