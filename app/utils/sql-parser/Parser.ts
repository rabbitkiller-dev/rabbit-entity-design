import { Tokenizer, Token } from './Tokenizer';

// followed this structures and rules
// http://ns.inria.fr/ast/sql/index.html
// https://dev.mysql.com/doc/refman/8.0/en/

export interface ASTNode {
  type: string;
  value?: ASTNode | string | number;
  variant?: string;
  action?: string;
  format?: string;
  operator?: string;
  expression?: ASTNode;
  left?: ASTNode;
  right?: ASTNode;
  name?: string;
  parameter?: ASTNode[];
  from?: ASTNode;
  into?: ASTNode;
  values?: ASTNode[];
  select?: ASTNode;
  where?: ASTNode;
  order?: ASTNode[];
  statements?: ASTNode[];
  database?: {
    type: string;
    variant: string;
    value: string | number;
  };
  columns?: ASTNode[];
}

export class Parser {
  // https://dev.mysql.com/doc/refman/8.0/en/operator-precedence.html
  // no assign!
  readonly precedence: object = {
    '||': 2,
    'OR': 2,
    'XOR': 3,
    '&&': 4,
    'AND': 4,
    'NOT': 5,
    '<=>': 7,
    '>=': 7,
    '>': 7,
    '<=': 7,
    '<': 7,
    '<>': 7,
    '!=': 7,
    'IS': 7,
    '=': 7,
    'IS NOT': 7,
    '|': 8,
    '&': 9,
    '<<': 10,
    '>>': 10,
    '-': 11,
    '+': 11,
    '*': 12,
    '/': 12,
    'DIV': 12,
    '%': 12,
    'MOD': 12,
    '^': 13,
    '!': 14,
  };
  readonly keywordOperators: string[] = [
    'IS',
    'NOT',
    'XOR',
    'AND',
    'OR',
    'MOD',
    'DIV',
  ];
  readonly tokenizer: Tokenizer;

  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer;
  }

  isKeyword(string?: string): boolean {
    const token: Token | null = this.tokenizer.getCurrentToken();
    return Boolean(
      token &&
      token.type === 'keyword' &&
      !this.keywordOperators.includes(String(token.value)) &&
      (!string || token.value === string),
    );
  }

  skipKeyword(string: string) {
    if (this.isKeyword(string)) {
      this.tokenizer.getNextToken();
    } else {
      this.tokenizer.throwErrorWithPosition(`Expected keyword: ${string}`);
    }
  }

  isOperator(string?: string): boolean {
    const token: Token | null = this.tokenizer.getCurrentToken();
    return Boolean(
      token &&
      (token.type === 'operator' ||
        (token.type === 'keyword' &&
          this.keywordOperators.includes(String(token.value)))) &&
      (!string || token.value === string),
    );
  }

  isSeperator(char?: string): boolean {
    const token: Token | null = this.tokenizer.getCurrentToken();
    return Boolean(
      token && token.type === 'seperator' && (!char || token.value === char),
    );
  }

  skipSeperator(char: string) {
    if (this.isSeperator(char)) {
      this.tokenizer.getNextToken();
    } else {
      this.tokenizer.throwErrorWithPosition(`Expected sign: ${char}`);
    }
  }

  delimited(
    start: string,
    stop: string,
    separator: string,
    parserFunc: Function,
  ): ASTNode[] {
    const parameter: ASTNode[] = [];
    let first = true;
    this.skipSeperator(start);
    while (!this.tokenizer.eof()) {
      if (this.isSeperator(stop)) {
        break;
      }
      if (first) {
        first = false;
      } else {
        this.skipSeperator(separator);
      }
      // params can be missing
      if (this.isSeperator(stop)) {
        break;
      }
      parameter.push(parserFunc());
    }
    this.skipSeperator(stop);
    return parameter;
  }

  maybeBinary(left: ASTNode, currentPrecedence: Number): ASTNode {
    if (this.isOperator()) {
      const operator: Token | null = this.tokenizer.getCurrentToken();
      if (operator) {
        let operatorValue: string = String(operator.value);
        const precedenceOfOperator: Number = (this.precedence as any)[
          operatorValue
          ];
        if (precedenceOfOperator > currentPrecedence) {
          this.tokenizer.getNextToken();
          if (operator.value === 'IS' && this.isOperator('NOT')) {
            operatorValue = 'IS NOT';
            this.tokenizer.getNextToken();
          }
          return this.maybeBinary(
            {
              type: 'expression',
              variant: 'case',
              format: 'binary',
              operator: operatorValue,
              left: left,
              right: this.maybeBinary(
                this.parseElement(),
                precedenceOfOperator,
              ),
            },
            currentPrecedence,
          );
        }
      }
    }
    return left;
  }

  //TODO: More basic elements like date and so on
  parseElement(): ASTNode {
    let parsedElement: boolean = false;
    let maybeOutput: ASTNode = {
      type: 'error',
    };
    const currentToken: Token | null = this.tokenizer.getCurrentToken();
    if (currentToken) {
      if (this.isSeperator('(')) {
        parsedElement = true;
        this.tokenizer.getNextToken();
        const expression: ASTNode = this.maybeBinary(this.parseElement(), 0);
        this.skipSeperator(')');
        maybeOutput = expression;
      } else if (currentToken.type === 'function') {
        this.tokenizer.getNextToken();
        parsedElement = true;
        maybeOutput = {
          type: 'function',
          name: String(currentToken.value),
          parameter: this.delimited(
            '(',
            ')',
            ',',
            this.parseElement.bind(this),
          ),
        };
      } else if (
        currentToken.type === 'operator' &&
        (currentToken.value === '!' ||
          currentToken.value === '-' ||
          currentToken.value === '*')
      ) {
        this.tokenizer.getNextToken();
        parsedElement = true;
        if (currentToken.value === '*') {
          maybeOutput = {
            type: 'catalog object',
            variant: 'column',
            value: currentToken.value,
          };
        } else {
          maybeOutput = {
            type: 'expression',
            variant: 'case',
            format: 'unary',
            operator: String(currentToken.value),
            expression: this.maybeBinary(this.parseElement(), currentToken.value === '-' ? 11 : 14),
          };
        }
      } else if (currentToken.type === 'keyword') {
        if (currentToken.value === 'NULL') {
          this.tokenizer.getNextToken();
          parsedElement = true;
          maybeOutput = {
            type: 'literal',
            variant: 'null',
            value: 'null',
          };
        } else if (currentToken.value === 'NOT') {
          this.tokenizer.getNextToken();
          parsedElement = true;
          maybeOutput = {
            type: 'expression',
            variant: 'case',
            format: 'unary',
            operator: String(currentToken.value),
            expression: this.maybeBinary(this.parseElement(), 5),
          };
        }
      } else if (currentToken.type === 'identifier') {
        this.tokenizer.getNextToken();
        parsedElement = true;
        maybeOutput = {
          type: 'catalog object',
          variant: 'column',
          value: currentToken.value,
        };
      } else if (currentToken.type === 'number' || currentToken.type === 'string') {
        this.tokenizer.getNextToken();
        parsedElement = true;
        maybeOutput = {
          type: 'literal',
          variant: currentToken.type,
          value: currentToken.value,
        };
      }
      if (!parsedElement) {
        this.tokenizer.throwErrorWithPosition(
          `Unexpected token: ${JSON.stringify(currentToken)}`,
        );
      }
      return maybeOutput;
    }
    this.tokenizer.throwErrorWithPosition(
      `Something went wrong: ${JSON.stringify(currentToken)}`,
    );
    return maybeOutput;
  }

  parseListOfElements(): ASTNode[] {
    const elements: ASTNode[] = [];
    let first: boolean = true;
    let foundComma: boolean = false;
    let foundElement: boolean = false;
    let currentToken: Token | null = this.tokenizer.getCurrentToken();
    if (currentToken) {
      while (!this.tokenizer.eof()) {
        if (foundComma && (this.isSeperator(',') || this.isKeyword())) {
          this.tokenizer.throwErrorWithPosition(
            `Unexpected sign: ${JSON.stringify(currentToken)}`,
          );
          return [
            {
              type: 'error',
            },
          ];
        }
        if (this.isSeperator(',')) {
          if (first) {
            this.tokenizer.throwErrorWithPosition(
              `Unexpected sign: ${JSON.stringify(currentToken)}`,
            );
            return [
              {
                type: 'error',
              },
            ];
          }
          foundComma = true;
          foundElement = false;
          this.skipSeperator(',');
        } else if (this.isKeyword() || this.isSeperator(';')) {
          break;
        } else {
          if (first) {
            first = false;
          }
          if (foundElement) {
            this.tokenizer.throwErrorWithPosition(
              `Unexpected token: ${JSON.stringify(currentToken)}`,
            );
            return [
              {
                type: 'error',
              },
            ];
          }
          foundComma = false;
          foundElement = true;
          elements.push(this.maybeBinary(this.parseElement(), 0));
        }
        currentToken = this.tokenizer.getCurrentToken();
      }
      if (elements.length === 0) {
        this.tokenizer.throwErrorWithPosition(
          `Expected at least one expression: ${JSON.stringify(currentToken)}`,
        );
        return [
          {
            type: 'error',
          },
        ];
      }
    }
    return elements;
  }

  parseExpression(parseFunc: Function): Function {
    return () => {
      return this.maybeBinary(parseFunc(), 0);
    };
  }

  //TODO: cross join by select
  parseFrom(): ASTNode {
    this.skipKeyword('FROM');
    const table: Token | null = this.tokenizer.getCurrentToken();
    if (table && table.type === 'identifier') {
      this.tokenizer.getNextToken();
      return {
        type: 'catalog object',
        variant: 'table',
        value: table.value,
      };
    }
    this.tokenizer.throwErrorWithPosition(
      `Expected table name: ${JSON.stringify(table)}`,
    );
    return {
      type: 'error',
    };
  }

  parseWhere(): ASTNode {
    this.skipKeyword('WHERE');
    return this.parseExpression(this.parseElement.bind(this))();
  }

  //TODO: DESC, ASC
  parseOrderBy(): ASTNode[] {
    this.skipKeyword('ORDER');
    this.skipKeyword('BY');
    return this.parseListOfElements();
  }

  //TODO: a lot.. ;)
  parseSelect(): ASTNode {
    this.skipKeyword('SELECT');
    let output: ASTNode = {
      type: 'statement',
      variant: 'data manipulation',
      action: 'select',
    };
    const selectExpressions: ASTNode[] = this.parseListOfElements();
    if (selectExpressions.length > 0) {
      output = Object.assign(output, { columns: selectExpressions });
      if (this.isKeyword('FROM')) {
        output = Object.assign(output, { from: this.parseFrom() });
      }
      if (this.isKeyword('WHERE')) {
        if (!output.hasOwnProperty('from')) {
          this.tokenizer.throwErrorWithPosition(
            `FROM needs to be before`,
          );
          return {
            type: 'error',
          };
        }
        output = Object.assign(output, { where: this.parseWhere() });
      }
      if (this.isKeyword('ORDER')) {
        if (!output.hasOwnProperty('from') || !output.hasOwnProperty('where')) {
          this.tokenizer.throwErrorWithPosition(
            `FROM and WHERE needs to be before`,
          );
          return {
            type: 'error',
          };
        }
        output = Object.assign(output, { order: this.parseOrderBy() });
      }
      return output;
    }
    this.tokenizer.throwErrorWithPosition(
      `Expected at least one select expression`,
    );
    return {
      type: 'error',
    };
  }

  //TODO: SET, PARTITION, ON DUPLICATE KEY UPDATE
  parseInsert(): ASTNode {
    this.skipKeyword('INSERT');
    this.skipKeyword('INTO');
    const table: Token | null = this.tokenizer.getCurrentToken();
    if (table && table.type === 'identifier') {
      const currentToken: Token | null = this.tokenizer.getNextToken();
      let columns: ASTNode[] = [];
      if (this.isSeperator('(')) {
        columns = this.delimited(
          '(',
          ')',
          ',',
          (): ASTNode => {
            const currentToken: Token | null = this.tokenizer.getCurrentToken();
            if (currentToken) {
              if (currentToken.type !== 'identifier') {
                this.tokenizer.throwErrorWithPosition(
                  `Expected column name: ${JSON.stringify(currentToken)}`,
                );
                return {
                  type: 'error',
                };
              }
              this.tokenizer.getNextToken();
              return {
                type: 'catalog object',
                variant: 'column',
                value: currentToken.value,
              };
            }
            this.tokenizer.throwErrorWithPosition(
              `Something went wrong: ${JSON.stringify(currentToken)}`,
            );
            return {
              type: 'error',
            };
          },
        );
      }
      const output: ASTNode = {
        type: 'statement',
        variant: 'data manipulation',
        action: 'insert',
        into: {
          type: 'catalog object',
          variant: 'table',
          value: table.value,
          columns: columns.length > 0 ? columns : undefined,
        },
      };
      if (this.isKeyword('VALUES')) {
        this.skipKeyword('VALUES');
        return Object.assign(output, {
          values: this.delimited(
            '(',
            ')',
            ',',
            this.parseExpression(this.parseElement.bind(this)),
          ),
        });
      } else if (this.isKeyword('SELECT')) {
        return Object.assign(output, {
          select: this.parseSelect(),
        });
      }
      this.tokenizer.throwErrorWithPosition(
        `Expected VALUES or SELECT: ${JSON.stringify(currentToken)}`,
      );
      return {
        type: 'error',
      };
    }
    this.tokenizer.throwErrorWithPosition(
      `Expected table name: ${JSON.stringify(table)}`,
    );
    return {
      type: 'error',
    };
  }

  //TODO: Multiple-Table Syntax, AS, PARTITION, LIMIT
  parseDelete(): ASTNode {
    this.skipKeyword('DELETE');
    const table: ASTNode = this.parseFrom();
    if (table.type === 'catalog object') {
      let output: ASTNode = {
        type: 'statement',
        variant: 'data manipulation',
        action: 'delete',
        from: {
          type: 'catalog object',
          variant: 'table',
          value: table.value,
        },
      };
      if (this.isKeyword('WHERE')) {
        output = Object.assign(output, { where: this.parseWhere() });
      }
      if (this.isKeyword('ORDER')) {
        if (!output.hasOwnProperty('where')) {
          this.tokenizer.throwErrorWithPosition(
            `WHERE needs to be before ORDER`,
          );
          return {
            type: 'error',
          };
        }
        output = Object.assign(output, { order: this.parseOrderBy() });

      }
      this.tokenizer.getNextToken();
      return output;
    }
    this.tokenizer.throwErrorWithPosition(
      `Something went wrong: ${JSON.stringify(table)}`,
    );
    return {
      type: 'error',
    };
  }

  parseUse(): ASTNode {
    this.skipKeyword('USE');
    const currentToken: Token | null = this.tokenizer.getCurrentToken();
    if (currentToken && currentToken.type === 'identifier') {
      this.tokenizer.getNextToken();
      return {
        type: 'statement',
        variant: 'utility',
        action: 'use',
        database: {
          type: 'catalog object',
          variant: 'database',
          value: currentToken.value,
        },
      };
    }
    this.tokenizer.throwErrorWithPosition(
      `Expected database name: ${JSON.stringify(currentToken)}`,
    );
    return {
      type: 'error',
    };
  }

  //TODO: other Statements
  parseStatement(): ASTNode {
    if (this.isKeyword('SELECT')) {
      return this.parseSelect();
    }
    if (this.isKeyword('INSERT')) {
      return this.parseInsert();
    }
    if (this.isKeyword('DELETE')) {
      return this.parseDelete();
    }
    if (this.isKeyword('USE')) {
      return this.parseUse();
    }
    this.tokenizer.throwErrorWithPosition(
      `Unexpected token: ${JSON.stringify(this.tokenizer.getCurrentToken())}`,
    );
    return {
      type: 'error',
    };
  }

  parseTopLevel(): ASTNode {
    const statements: ASTNode[] = [];
    while (!this.tokenizer.eof()) {
      statements.push(this.parseStatement());
      if (!this.tokenizer.eof()) {
        this.skipSeperator(';');
      }
    }
    return { type: 'statement', variant: 'list', statements };
  }
}
