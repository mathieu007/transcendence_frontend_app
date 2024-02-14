/** @type {import('vite').UserConfig} */
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import babel from "vite-plugin-babel";

const htmlImport = {
  name: "htmlImport",
  /**
   * Checks to ensure that a html file is being imported.
   * If it is then it alters the code being passed as being a string being exported by default.
   * @param {string} code The file as a string.
   * @param {string} id The absolute path.
   * @returns {{code: string}}
   */
  transform(code, id) {
    if (/^.*\.html$/g.test(id)) {
      code = `export default \`${code}\``;
    }
    return { code };
  },
};

// https://vitejs.dev/config/

export default defineConfig({
    plugins: [
        tsconfigPaths(),
        babel(),
        htmlImport,
        babel({
            babelConfig: {
                // Optional inline Babel config
            }
        })
    ],
    optimizeDeps: {
        esbuildOptions: {
            tsconfigRaw: {
                compilerOptions: {
                    experimentalDecorators: true
                }
            }
        }
    }
});
