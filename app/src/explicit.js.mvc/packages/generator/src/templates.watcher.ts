import { Client } from "fb-watchman";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { processTemplateFile } from "./process.templates.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const sourceDir = __dirname.split("/explicit.js.mvc")[0];
const excludeDir = "explicit.js.mvc";

const client = new Client();
client.capabilityCheck({ optional: [], required: ["relative_root"] }, (error) => {
    if (error) {
        console.error(error);
        client.end();
        return;
    }

    client.command(["watch-project", sourceDir], (error, resp) => {
        if (error) {
            console.error("Error initiating watch:", error);
            return;
        }

        if ("warning" in resp) {
            console.log("Warning: ", resp.warning);
        }

        const sub = {
            expression: ["allof", ["match", "*.template.ts"], ["not", ["dirname", excludeDir]]],
            fields: ["name", "size", "mtime_ms", "exists", "type"],
            relative_root: resp.relative_path
        };

        const subName = "typescript-compile";

        client.command(["subscribe", resp.watch, subName, sub], (error) => {
            if (error) {
                console.error("Error creating subscription:", error);
                return;
            }
            console.log(`Subscription ${subName} templates established.`);
        });

        client.on("subscription", (resp) => {
            if (resp.subscription === subName) {
                resp.files.forEach(async (file) => {
                    const filePath = `${sourceDir}/${file.name}`;
                    if (!file.exists) {
                        processTemplateFile(filePath, true);
                    } else {
                        processTemplateFile(filePath, false);
                    }
                });
            }
        });
    });
});

// Clean up on exit
process.on("exit", () => {
    client.end();
});
