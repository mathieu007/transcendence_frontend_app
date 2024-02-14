const { exec } = require("child_process");

// Define your project's source directory and the command to run
const sourceDir = "./src/controllers/";
const compileCommand = `node process.controller.js -- %{path}`;


// Watchman watch-del-all to clear existing watches (optional)
exec("watchman watch-del-all", (err) => {
    if (err) {
        console.error("Error clearing Watchman watches:", err);
        return;
    }

    // Setting up a new watch on your source directory
    exec(`watchman watch-project ${sourceDir}`, (err) => {
        if (err) {
            console.error("Error setting up Watchman watch:", err);
            return;
        }

        // Define the trigger
        const triggerName = "typescript-compile";
        const triggerSetup = {
            // Ignore directories that are not needed
            ignore_dirs: ["node_modules"],
            // Use a combination of match and type for file pattern
            expression: [
                "allof",
                ["match", "*controller.ts", "wholename"],
                ["type", "f"]
            ],
            // Splitting the command to provide as an array
            command: compileCommand.split(" ")
        };

        // Add the trigger to Watchman
        exec(`watchman -j`, (err, stdout, stderr) => {
            if (err) {
                console.error("Error setting Watchman trigger:", err);
                return;
            }

            console.log("Watchman trigger set up successfully:", stdout);
        }).stdin.write(
            JSON.stringify(["trigger", sourceDir, triggerName, triggerSetup])
        );
    });
});
