import Stream from './Stream';

function isWhiteSpace(char: string) {
  return ' \t\n\r'.indexOf(char) >= 0;
}

function isSeperatorChar(char: string) {
  return '(),;'.indexOf(char) >= 0;
}

function isOperatorChar(char: string) {
  return '+-*/%=&|^=<>!'.indexOf(char) >= 0;
}

function isDigit(char: string) {
  return /[0-9]/i.test(char);
}

export interface Token {
  type: 'function' | 'keyword' | 'identifier' | 'number' | 'string' | 'operator' | 'seperator';
  value: string | number;
}

export class Tokenizer {
  private currentToken: Token | null = null;
  readonly operators: string[] = [
    '!',
    '+',
    '-',
    '*',
    '/',
    '%',
    '&',
    '|',
    '^',
    '=',
    '>',
    '<',
    '>=',
    '<=',
    '<>',
    '!=',
    '+=',
    '-=',
    '*=',
    '/=',
    '%=',
    '&=',
    '&&',
    '||',
    ':=',
    '<<',
    '>>',
    '<=>',
    '^-=',
    '|*=',
  ];
  readonly keywords: string[] = [
    'USE',
    'SELECT',
    'FROM',
    'WHERE',
    'IS',
    'NOT',
    'NULL',
    'ORDER',
    'BY',
    'INSERT',
    'INTO',
    'VALUES',
    'DELETE',
    'FROM',
    'WHERE',
    'XOR',
    'AND',
    'OR',
    'MOD',
    'DIV',
    'CREATE',
    'TABLE',
    'VARCHAR',
    'INT',
  ];
  readonly stream: Stream;

  constructor(stream: Stream) {
    this.stream = stream;
  }

  readWhileIt(boolFunc: Function): string {
    let string: string = '';
    while (!this.stream.eof() && boolFunc(this.stream.currentChar())) {
      string = string.concat(this.stream.nextChar());
    }
    return string;
  }

  readNumber(): Token | null {
    let digits: string = '';
    while (
      !isWhiteSpace(this.stream.currentChar()) &&
      !isSeperatorChar(this.stream.currentChar())
      ) {
      digits = digits.concat(this.stream.currentChar());
      this.stream.nextChar();
    }
    const number: number = Number(digits);
    if (isNaN(number)) {
      this.stream.throwErrorWithPosition(`Its not a valid number: ${digits}`);
      return null;
    }
    return { type: 'number', value: number };
  }

  readString(closingSign: string): Token | null {
    let letters: string = '';
    let escaped: boolean = false;
    this.stream.nextChar();
    while (!this.stream.eof()) {
      let char: string = this.stream.nextChar();
      if (escaped) {
        letters = letters.concat(char);
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === closingSign) {
        break;
      } else {
        letters = letters.concat(char);
      }
    }
    return { type: 'string', value: letters };
  }

  readOperator(): Token | null {
    let value = this.readWhileIt(isOperatorChar);
    if (value.length > 3) {
      this.stream.throwErrorWithPosition(
        `This operator is not valid: ${value}`,
      );
      return null;
    }
    if (this.operators.includes(value)) {
      return { type: 'operator', value };
    }
    this.stream.throwErrorWithPosition(`This operator is not valid: ${value}`);
    return null;
  }

  readIdentifier(): Token | null {
    let value: string = '';
    while (!isWhiteSpace(this.stream.currentChar())) {
      const currentChar: string = this.stream.currentChar();
      if (currentChar === '\x27' || currentChar === '\x22') {
        this.stream.throwErrorWithPosition(
          `This sign is not allowed there: ${currentChar}`,
        );
        return null;
      }
      if (isSeperatorChar(currentChar)) {
        if (currentChar === '(') {
          return { type: 'function', value };
        }
        break;
      }
      value = value.concat(currentChar);
      this.stream.nextChar();
    }
    if (this.keywords.includes(value.toUpperCase())) {
      return { type: 'keyword', value: value.toUpperCase() };
    }
    return { type: 'identifier', value };
  }

  readNextToken(): Token | null {
    this.readWhileIt(isWhiteSpace);
    if (this.stream.eof()) {
      return null;
    }
    const currentChar = this.stream.currentChar();
    if (isDigit(currentChar)) {
      return this.readNumber();
    }
    if (currentChar === '\x27' || currentChar === '\x22') {
      return this.readString(currentChar === '\x27' ? '\x27' : '\x22');
    }
    if (isOperatorChar(currentChar)) {
      return this.readOperator();
    }
    if (isSeperatorChar(currentChar)) {
      this.stream.nextChar();
      return { type: 'seperator', value: currentChar };
    }
    const identifierToken: Token | null = this.readIdentifier();
    if (identifierToken) {
      return identifierToken;
    }
    this.stream.throwErrorWithPosition(
      `Cannot handle character: ${currentChar}`,
    );
    return null;
  }

  getCurrentToken(): Token | null {
    if (this.currentToken) {
      return this.currentToken;
    }
    this.currentToken = this.readNextToken();
    return this.currentToken;
  }

  getNextToken(): Token | null {
    this.currentToken = this.readNextToken();
    return this.currentToken;
  }

  eof(): boolean {
    return this.getCurrentToken() === null;
  }

  throwErrorWithPosition(msg: string) {
    this.stream.throwErrorWithPosition(msg);
  }
}
