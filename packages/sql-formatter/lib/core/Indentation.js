'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _repeat = require('lodash/repeat');

var _repeat2 = _interopRequireDefault(_repeat);

var _last = require('lodash/last');

var _last2 = _interopRequireDefault(_last);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const INDENT_TYPE_TOP_LEVEL = 'top-level';
const INDENT_TYPE_BLOCK_LEVEL = 'block-level';

/**
 * Manages indentation levels.
 *
 * There are two types of indentation levels:
 *
 * - BLOCK_LEVEL : increased by open-parenthesis
 * - TOP_LEVEL : increased by RESERVED_TOPLEVEL words
 */
class Indentation {
  /**
   * @param {String} indent Indent value, default is "  " (2 spaces)
   */
  constructor(indent) {
    this.indent = indent || '  ';
    this.indentTypes = [];
  }

  /**
   * Returns current indentation string.
   * @return {String}
   */
  getIndent() {
    return (0, _repeat2.default)(this.indent, this.indentTypes.length);
  }

  /**
   * Increases indentation by one top-level indent.
   */
  increaseToplevel() {
    this.indentTypes.push(INDENT_TYPE_TOP_LEVEL);
  }

  /**
   * Increases indentation by one block-level indent.
   */
  increaseBlockLevel() {
    this.indentTypes.push(INDENT_TYPE_BLOCK_LEVEL);
  }

  /**
   * Decreases indentation by one top-level indent.
   * Does nothing when the previous indent is not top-level.
   */
  decreaseTopLevel() {
    if ((0, _last2.default)(this.indentTypes) === INDENT_TYPE_TOP_LEVEL) {
      this.indentTypes.pop();
    }
  }

  /**
   * Decreases indentation by one block-level indent.
   * If there are top-level indents within the block-level indent,
   * throws away these as well.
   */
  decreaseBlockLevel() {
    while (this.indentTypes.length > 0) {
      const type = this.indentTypes.pop();
      if (type !== INDENT_TYPE_TOP_LEVEL) {
        break;
      }
    }
  }
}
exports.default = Indentation;
//# sourceMappingURL=Indentation.js.map