"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1({ types: t }) {
    return {
        visitor: {
            Identifier(path) {
                console.log(`Visiting: ${path.node.name}`);
            }
        }
    };
}
exports.default = default_1;
//# sourceMappingURL=index.js.map