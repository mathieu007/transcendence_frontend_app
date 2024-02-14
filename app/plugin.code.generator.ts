import { Visitor } from "@babel/traverse";
import * as BabelTypes from "@babel/types";

export default function ({ types: t }: { types: typeof BabelTypes }): {
    visitor: Visitor;
} {
    return {
        visitor: {
            Identifier(path) {
                console.log(`Visiting: ${path.node.name}`);
            }
        }
    };
}
