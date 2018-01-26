import antlr from 'antlr4';
import SQLiteLexer from './sqlite/SQLiteLexer';
import SQLiteListener from './sqlite/SQLiteListener';
import SQLiteParser from './sqlite/SQLiteParser';

const input = 'SELECT * FROM users';
const chars = new antlr.InputStream(input);
const lexer = new SQLiteLexer.SQLiteLexer(chars);
const tokens = new antlr.CommonTokenStream(lexer);
const parser = new SQLiteParser.SQLiteParser(tokens);
parser.buildParseTrees = true;
console.log(parser.parse().getAst());
