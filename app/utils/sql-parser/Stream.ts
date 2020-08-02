import * as fs from 'fs';

export default class Stream {
  private pos: number = 0;
  private line: number = 1;
  private col: number = 0;
  readonly input: string;

  constructor(script: string) {
    // this.input = fs.readFileSync(path, 'utf8');
    this.input = script;
  }

  nextChar(): string {
    const char = this.input.charAt(this.pos++);
    if (char === '\n') {
      this.line++;
      this.col = 0;
    } else {
      this.col++;
    }
    return char;
  }

  currentChar(): string {
    return this.input.charAt(this.pos);
  }

  eof(): boolean {
    return this.currentChar() === '';
  }

  throwErrorWithPosition(msg: string) {
    throw new Error(`${msg} at (${this.line}:${this.col})`);
  }
}
