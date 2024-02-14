const fs = require("fs");
const path = require("path");

const directory = "path/to/your/directory";

function processFile(filePath) {
  // Read the .html.ts file and generate content for .dom.ts
  const htmlTsContent = fs.readFileSync(filePath, "utf8");
  const domTsContent = generateDomContent(htmlTsContent); // Implement this function based on your requirements

  // Write to .dom.ts file
  const domFilePath = filePath.replace(".html.ts", ".dom.ts");
  fs.writeFileSync(domFilePath, domTsContent);
}

function processDirectory(directory) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach((dirent) => {
    const fullPath = path.join(directory, dirent.name);
    if (dirent.isDirectory()) {
      processDirectory(fullPath);
    } else if (dirent.isFile() && dirent.name.endsWith(".html.ts")) {
      processFile(fullPath);
    }
  });
}

processDirectory(directory);
