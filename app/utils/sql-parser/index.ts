/**
 * https://github.com/testbuddy/GetASTFromSQL
 */
import * as fs from 'fs';
import * as path from 'path';
import Stream from './Stream';
import { Tokenizer } from './Tokenizer';
import { Parser } from './Parser';
export function parser(script: string){
  const stream = new Stream(script);
  const tokenizer = new Tokenizer(stream);
  const parser = new Parser(tokenizer);
  const json = parser.parseTopLevel();
  fs.writeFileSync(path.join(__dirname, 'temp.json'), JSON.stringify(json,null, 2));
  return json;
}
export {
  Tokenizer,
  Stream
}
