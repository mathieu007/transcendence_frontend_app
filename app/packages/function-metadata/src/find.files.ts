import * as fs from "fs";
import * as path from "path";

export function findAllTsFiles(dir: string, allFiles: string[] = []) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            findAllTsFiles(filePath, allFiles);
        } else if (filePath.endsWith(".ts")) {
            allFiles.push(filePath);
        }
    });
    return allFiles;
}


