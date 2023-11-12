"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionNode = void 0;
const hex_js_1 = require("../util/hex.js");
const node_js_1 = require("./node.js");
class ExtensionNode extends node_js_1.Node {
    constructor(nibbles, value) {
        super(nibbles, value, false);
    }
    static encodeKey(key) {
        return (0, hex_js_1.addHexPrefix)(key, false);
    }
}
exports.ExtensionNode = ExtensionNode;
//# sourceMappingURL=extension.js.map