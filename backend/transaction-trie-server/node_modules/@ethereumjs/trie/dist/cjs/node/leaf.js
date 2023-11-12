"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeafNode = void 0;
const hex_js_1 = require("../util/hex.js");
const node_js_1 = require("./node.js");
class LeafNode extends node_js_1.Node {
    constructor(nibbles, value) {
        super(nibbles, value, true);
    }
    static encodeKey(key) {
        return (0, hex_js_1.addHexPrefix)(key, true);
    }
}
exports.LeafNode = LeafNode;
//# sourceMappingURL=leaf.js.map