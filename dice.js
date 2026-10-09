const NUMBER = 'number';
const DICE = 'dice';
const BINARY = 'binary';
const UNARY = 'unary';

const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, unary: 3, atom: 4 };

function tokenize(input) {
  const tokens = [];
  const s = input.trim();
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === '+' || c === '-' || c === '*' || c === '/' || c === '(' || c === ')') {
      tokens.push({ type: c });
      i++;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9]/.test(s[j])) j++;
      if (s[j] === 'd' || s[j] === 'D') {
        let k = j + 1;
        while (k < s.length && /[0-9]/.test(s[k])) k++;
        if (k === j + 1) return null;
        const count = parseInt(s.slice(i, j), 10);
        const sides = parseInt(s.slice(j + 1, k), 10);
        if (count <= 0 || sides <= 0) return null;
        tokens.push({ type: DICE, count, sides });
        i = k;
      } else {
        tokens.push({ type: NUMBER, value: parseInt(s.slice(i, j), 10) });
        i = j;
      }
      continue;
    }
    return null;
  }
  return tokens;
}

function parseTokens(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];

  function parseExpression() {
    let node = parseTerm();
    for (;;) {
      const t = peek();
      if (t && (t.type === '+' || t.type === '-')) {
        next();
        node = { type: BINARY, op: t.type, left: node, right: parseTerm() };
      } else if (t && (t.type === NUMBER || t.type === DICE || t.type === '(')) {
        node = { type: BINARY, op: '+', left: node, right: parseTerm() };
      } else {
        break;
      }
    }
    return node;
  }

  function parseTerm() {
    let node = parseFactor();
    for (;;) {
      const t = peek();
      if (t && (t.type === '*' || t.type === '/')) {
        next();
        node = { type: BINARY, op: t.type, left: node, right: parseFactor() };
      } else {
        break;
      }
    }
    return node;
  }

  function parseFactor() {
    const t = peek();
    if (t && t.type === '-') {
      next();
      return { type: UNARY, op: '-', operand: parseFactor() };
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const t = next();
    if (!t) throw new Error('expressão incompleta');
    if (t.type === NUMBER) return { type: NUMBER, value: t.value };
    if (t.type === DICE) return { type: DICE, count: t.count, sides: t.sides };
    if (t.type === '(') {
      const node = parseExpression();
      const close = next();
      if (!close || close.type !== ')') throw new Error('parêntese não fechado');
      return node;
    }
    throw new Error('token inesperado');
  }

  const ast = parseExpression();
  if (pos !== tokens.length) throw new Error('sobraram tokens');
  return ast;
}

function countDice(node) {
  if (!node) return 0;
  if (node.type === DICE) return 1;
  if (node.type === UNARY) return countDice(node.operand);
  if (node.type === BINARY) return countDice(node.left) + countDice(node.right);
  return 0;
}

function hasLiteralDivideByZero(node) {
  if (!node) return false;
  if (node.type === UNARY) return hasLiteralDivideByZero(node.operand);
  if (node.type === BINARY) {
    if (node.op === '/' && node.right.type === NUMBER && node.right.value === 0) return true;
    return hasLiteralDivideByZero(node.left) || hasLiteralDivideByZero(node.right);
  }
  return false;
}

function parseDice(input) {
  if (typeof input !== 'string') return null;
  const tokens = tokenize(input);
  if (!tokens || tokens.length === 0) return null;
  let ast;
  try {
    ast = parseTokens(tokens);
  } catch {
    return null;
  }
  if (countDice(ast) === 0) return null;
  if (hasLiteralDivideByZero(ast)) return null;
  return ast;
}

const DICE_REGEX = /^(?=.*\d+d\d+)[\d\s+\-*/()dD]+$/;

function rollSingle(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function evaluate(node, groups) {
  if (node.type === NUMBER) return node.value;

  if (node.type === DICE) {
    const rolls = [];
    for (let i = 0; i < node.count; i++) rolls.push(rollSingle(node.sides));
    const total = rolls.reduce((a, b) => a + b, 0);
    node.value = total;
    node.rolls = rolls;
    groups.push({ count: node.count, sides: node.sides, rolls, total });
    return total;
  }

  if (node.type === UNARY) {
    const value = evaluate(node.operand, groups);
    node.value = -value;
    return node.value;
  }

  const left = evaluate(node.left, groups);
  const right = evaluate(node.right, groups);
  let value;
  switch (node.op) {
    case '+': value = left + right; break;
    case '-': value = left - right; break;
    case '*': value = left * right; break;
    case '/':
      if (right === 0) throw new Error('divisão por zero');
      value = left / right;
      break;
    default:
      throw new Error('operador desconhecido');
  }
  node.value = value;
  return value;
}

function rollDice(ast) {
  const groups = [];
  const total = evaluate(ast, groups);
  return { ast, groups, total: round(total) };
}

function extractScale(node) {
  if (node.type === DICE) return { dice: node, factors: [] };
  if (
    node.type === BINARY &&
    (node.op === '*' || node.op === '/') &&
    node.right.type === NUMBER
  ) {
    const inner = extractScale(node.left);
    if (!inner) return null;
    return { dice: inner.dice, factors: inner.factors.concat({ op: node.op, value: node.right.value }) };
  }
  return null;
}

function render(node, minPrec) {
  const p = nodePrec(node);
  let s;
  if (node.type === NUMBER) {
    s = String(node.value);
  } else if (node.type === DICE) {
    s = formatNumber(node.value);
  } else if (node.type === UNARY) {
    s = `-${render(node.operand, PREC.unary)}`;
  } else {
    const rightMin = node.op === '-' || node.op === '/' ? p + 1 : p;
    s = `${render(node.left, p)} ${node.op} ${render(node.right, rightMin)}`;
  }
  return p < minPrec ? `(${s})` : s;
}

function nodePrec(node) {
  if (node.type === NUMBER || node.type === DICE) return PREC.atom;
  if (node.type === UNARY) return PREC.unary;
  return PREC[node.op];
}

function formatResult(result, notation) {
  const { ast, groups, total } = result;

  if (groups.length === 1 && ast.type === DICE) {
    const g = groups[0];
    return `🎲 **${notation}**: [${g.rolls.join(', ')}] = **${formatNumber(total)}**`;
  }

  if (groups.length === 1) {
    const g = groups[0];
    const scale = extractScale(ast);
    if (scale && scale.factors.length > 0) {
      const factorText = scale.factors.map(f => `${f.op}${f.value}`).join('');
      const perDie = g.rolls.map(r => {
        let v = r;
        for (const f of scale.factors) v = f.op === '*' ? v * f.value : v / f.value;
        return round(v);
      });
      const lines = perDie.map((v, idx) => `(${g.rolls[idx]}${factorText}) = **${formatNumber(v)}**`);
      const rawTotal = g.rolls.reduce((a, b) => a + b, 0);
      return `🎲 **${notation}** (por dado)\n${lines.join('\n')}\nTotal: ${rawTotal}${factorText} = **${formatNumber(total)}**`;
    }
    return `🎲 **${notation}**: [${g.rolls.join(', ')}] = ${render(ast, 0)} = **${formatNumber(total)}**`;
  }

  const groupLines = groups.map(g => `\`${g.count}d${g.sides}\`: [${g.rolls.join(', ')}] = ${g.total}`);
  return `🎲 **${notation}**\n${groupLines.join('\n')}\n\`${render(ast, 0)}\` = **${formatNumber(total)}**`;
}

function round(n) {
  return Math.round(n * 1e6) / 1e6;
}

function formatNumber(n) {
  return String(round(n));
}

module.exports = { parseDice, rollDice, formatResult, DICE_REGEX };
