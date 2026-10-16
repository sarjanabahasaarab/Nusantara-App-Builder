/**
 * Nusantara App Builder - Safe Expression Parser & Evaluator
 * Phase 6: Zero-eval, sandboxed AST expression engine for condition branches and data bindings.
 */

export interface ExpressionValidationResult {
  isValid: boolean;
  error?: string;
  ast?: ASTNode;
}

export type ASTNodeType =
  | 'Literal'
  | 'Identifier'
  | 'UnaryExpression'
  | 'BinaryExpression'
  | 'MemberExpression';

export interface ASTNode {
  type: ASTNodeType;
  value?: any;
  name?: string;
  operator?: string;
  left?: ASTNode;
  right?: ASTNode;
  argument?: ASTNode;
  object?: ASTNode;
  property?: string;
}

// TokenType definitions
type TokenType =
  | 'NUMBER'
  | 'STRING'
  | 'BOOLEAN'
  | 'NULL'
  | 'IDENTIFIER'
  | 'OPERATOR'
  | 'PUNCTUATION'
  | 'EOF';

interface Token {
  type: TokenType;
  value: any;
  pos: number;
}

export class SafeExpressionEngine {
  /**
   * Tokenizes an expression string safely without regular expression catastrophic backtracking
   */
  private static tokenize(expr: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    const len = expr.length;

    while (i < len) {
      const ch = expr[i];

      // Skip whitespace
      if (/\s/.test(ch)) {
        i++;
        continue;
      }

      // Numbers
      if (/[0-9]/.test(ch)) {
        let numStr = '';
        const start = i;
        while (i < len && /[0-9.]/.test(expr[i])) {
          numStr += expr[i];
          i++;
        }
        tokens.push({ type: 'NUMBER', value: parseFloat(numStr), pos: start });
        continue;
      }

      // Strings (single or double quotes)
      if (ch === '"' || ch === "'") {
        const quote = ch;
        const start = i;
        i++;
        let strVal = '';
        while (i < len && expr[i] !== quote) {
          if (expr[i] === '\\' && i + 1 < len) {
            i++;
            strVal += expr[i];
          } else {
            strVal += expr[i];
          }
          i++;
        }
        i++; // skip closing quote
        tokens.push({ type: 'STRING', value: strVal, pos: start });
        continue;
      }

      // Multi-char operators: ==, !=, >=, <=, &&, ||
      const twoChar = expr.substring(i, i + 2);
      if (['==', '!=', '>=', '<=', '&&', '||'].includes(twoChar)) {
        tokens.push({ type: 'OPERATOR', value: twoChar, pos: i });
        i += 2;
        continue;
      }

      // Single-char operators & punctuation: >, <, !, +, -, *, /, (, ), .
      if (['>', '<', '!', '+', '-', '*', '/'].includes(ch)) {
        tokens.push({ type: 'OPERATOR', value: ch, pos: i });
        i++;
        continue;
      }

      if (['(', ')', '.'].includes(ch)) {
        tokens.push({ type: 'PUNCTUATION', value: ch, pos: i });
        i++;
        continue;
      }

      // Identifiers / Keywords (AND, OR, NOT, true, false, null, variable names)
      if (/[a-zA-Z_$]/.test(ch)) {
        let idStr = '';
        const start = i;
        while (i < len && /[a-zA-Z0-9_$]/.test(expr[i])) {
          idStr += expr[i];
          i++;
        }

        const upper = idStr.toUpperCase();
        if (upper === 'AND') {
          tokens.push({ type: 'OPERATOR', value: '&&', pos: start });
        } else if (upper === 'OR') {
          tokens.push({ type: 'OPERATOR', value: '||', pos: start });
        } else if (upper === 'NOT') {
          tokens.push({ type: 'OPERATOR', value: '!', pos: start });
        } else if (idStr === 'true') {
          tokens.push({ type: 'BOOLEAN', value: true, pos: start });
        } else if (idStr === 'false') {
          tokens.push({ type: 'BOOLEAN', value: false, pos: start });
        } else if (idStr === 'null') {
          tokens.push({ type: 'NULL', value: null, pos: start });
        } else {
          tokens.push({ type: 'IDENTIFIER', value: idStr, pos: start });
        }
        continue;
      }

      throw new Error(`Unexpected character "${ch}" at index ${i}`);
    }

    tokens.push({ type: 'EOF', value: '', pos: len });
    return tokens;
  }

  /**
   * Recursive descent parser generating clean AST
   */
  public static parse(expression: string): ASTNode {
    const trimmed = expression.trim();
    if (!trimmed) {
      throw new Error('Expression cannot be empty.');
    }

    const tokens = this.tokenize(trimmed);
    let cur = 0;

    const peek = () => tokens[cur];
    const consume = (expectedVal?: string) => {
      const tok = tokens[cur];
      if (expectedVal && tok.value !== expectedVal) {
        throw new Error(`Expected "${expectedVal}", but found "${tok.value}" at position ${tok.pos}`);
      }
      cur++;
      return tok;
    };

    // Logical OR
    const parseLogicalOr = (): ASTNode => {
      let node = parseLogicalAnd();
      while (peek().value === '||') {
        const op = consume().value;
        const right = parseLogicalAnd();
        node = { type: 'BinaryExpression', operator: op, left: node, right };
      }
      return node;
    };

    // Logical AND
    const parseLogicalAnd = (): ASTNode => {
      let node = parseEquality();
      while (peek().value === '&&') {
        const op = consume().value;
        const right = parseEquality();
        node = { type: 'BinaryExpression', operator: op, left: node, right };
      }
      return node;
    };

    // Equality (==, !=)
    const parseEquality = (): ASTNode => {
      let node = parseRelational();
      while (['==', '!='].includes(peek().value)) {
        const op = consume().value;
        const right = parseRelational();
        node = { type: 'BinaryExpression', operator: op, left: node, right };
      }
      return node;
    };

    // Relational (<, >, <=, >=)
    const parseRelational = (): ASTNode => {
      let node = parseAdditive();
      while (['<', '>', '<=', '>='].includes(peek().value)) {
        const op = consume().value;
        const right = parseAdditive();
        node = { type: 'BinaryExpression', operator: op, left: node, right };
      }
      return node;
    };

    // Additive (+, -)
    const parseAdditive = (): ASTNode => {
      let node = parseMultiplicative();
      while (['+', '-'].includes(peek().value)) {
        const op = consume().value;
        const right = parseMultiplicative();
        node = { type: 'BinaryExpression', operator: op, left: node, right };
      }
      return node;
    };

    // Multiplicative (*, /)
    const parseMultiplicative = (): ASTNode => {
      let node = parseUnary();
      while (['*', '/'].includes(peek().value)) {
        const op = consume().value;
        const right = parseUnary();
        node = { type: 'BinaryExpression', operator: op, left: node, right };
      }
      return node;
    };

    // Unary (!, -)
    const parseUnary = (): ASTNode => {
      if (['!', '-'].includes(peek().value)) {
        const op = consume().value;
        const arg = parseUnary();
        return { type: 'UnaryExpression', operator: op, argument: arg };
      }
      return parsePrimary();
    };

    // Primary (literal, variable, member expression, grouped parentheses)
    const parsePrimary = (): ASTNode => {
      const tok = peek();

      if (tok.type === 'NUMBER' || tok.type === 'STRING' || tok.type === 'BOOLEAN' || tok.type === 'NULL') {
        consume();
        return { type: 'Literal', value: tok.value };
      }

      if (tok.type === 'IDENTIFIER') {
        consume();
        let baseNode: ASTNode = { type: 'Identifier', name: tok.value };

        // Support dot notation: e.g. user.profile.name
        while (peek().value === '.') {
          consume('.');
          const propTok = consume();
          if (propTok.type !== 'IDENTIFIER') {
            throw new Error(`Expected property identifier after "." at position ${propTok.pos}`);
          }
          baseNode = {
            type: 'MemberExpression',
            object: baseNode,
            property: propTok.value,
          };
        }
        return baseNode;
      }

      if (tok.value === '(') {
        consume('(');
        const exprNode = parseLogicalOr();
        consume(')');
        return exprNode;
      }

      throw new Error(`Unexpected token "${tok.value}" at position ${tok.pos}`);
    };

    const ast = parseLogicalOr();
    if (peek().type !== 'EOF') {
      throw new Error(`Unexpected trailing tokens at position ${peek().pos}`);
    }

    return ast;
  }

  /**
   * Validates expression syntax and reports errors
   */
  public static validate(expression: string): ExpressionValidationResult {
    try {
      const ast = this.parse(expression);
      return { isValid: true, ast };
    } catch (err) {
      return { isValid: false, error: (err as Error).message };
    }
  }

  /**
   * Safely evaluates an AST against a variable scope dictionary
   */
  public static evaluate(ast: ASTNode, scope: Record<string, any> = {}): any {
    switch (ast.type) {
      case 'Literal':
        return ast.value;

      case 'Identifier': {
        const varName = ast.name || '';
        return Object.prototype.hasOwnProperty.call(scope, varName) ? scope[varName] : undefined;
      }

      case 'MemberExpression': {
        const obj = this.evaluate(ast.object!, scope);
        if (obj === null || obj === undefined) return undefined;
        return obj[ast.property!];
      }

      case 'UnaryExpression': {
        const val = this.evaluate(ast.argument!, scope);
        if (ast.operator === '!') return !val;
        if (ast.operator === '-') return -val;
        throw new Error(`Unsupported unary operator "${ast.operator}"`);
      }

      case 'BinaryExpression': {
        const left = this.evaluate(ast.left!, scope);
        const right = this.evaluate(ast.right!, scope);

        switch (ast.operator) {
          case '==':
            return left == right;
          case '!=':
            return left != right;
          case '>':
            return Number(left) > Number(right);
          case '<':
            return Number(left) < Number(right);
          case '>=':
            return Number(left) >= Number(right);
          case '<=':
            return Number(left) <= Number(right);
          case '&&':
            return Boolean(left) && Boolean(right);
          case '||':
            return Boolean(left) || Boolean(right);
          case '+':
            return typeof left === 'string' || typeof right === 'string'
              ? String(left ?? '') + String(right ?? '')
              : Number(left) + Number(right);
          case '-':
            return Number(left) - Number(right);
          case '*':
            return Number(left) * Number(right);
          case '/':
            return Number(right) === 0 ? 0 : Number(left) / Number(right);
          default:
            throw new Error(`Unsupported operator "${ast.operator}"`);
        }
      }

      default:
        throw new Error(`Unknown AST node type ${(ast as any).type}`);
    }
  }

  /**
   * Converts AST back to Kotlin expression syntax for code generation
   */
  public static toKotlin(ast: ASTNode): string {
    switch (ast.type) {
      case 'Literal':
        if (typeof ast.value === 'string') return `"${ast.value.replace(/"/g, '\\"')}"`;
        if (ast.value === null) return 'null';
        return String(ast.value);

      case 'Identifier':
        return ast.name!;

      case 'MemberExpression':
        return `${this.toKotlin(ast.object!)}?.${ast.property}`;

      case 'UnaryExpression':
        return `${ast.operator}${this.toKotlin(ast.argument!)}`;

      case 'BinaryExpression': {
        const leftK = this.toKotlin(ast.left!);
        const rightK = this.toKotlin(ast.right!);
        let op = ast.operator;
        if (op === '==') op = '==';
        if (op === '!=') op = '!=';
        return `(${leftK} ${op} ${rightK})`;
      }

      default:
        return 'true';
    }
  }
}
