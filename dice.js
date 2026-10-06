const TERM_OP_REGEX = /[*\/]/;
const MOD_TOKENS_REGEX = /\*\d+|\/\d+|\+\d+|-\d+/g;

function splitTerms(text) {
  return (text.match(MOD_TOKENS_REGEX) || []).map(term => ({
    op: term[0],
    value: parseInt(term.slice(1), 10),
  }));
}

function evaluateTerms(terms, base) {
  const parts = [String(base)];
  for (const t of terms) parts.push(`${t.op}${t.value}`);
  const expr = parts.join('');

  const tokens = expr.match(/\d+\.?\d*|[+\-*/]/g) || [];
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];

  function parseFactor() {
    const t = next();
    if (t === '+') return parseFactor();
    if (t === '-') return -parseFactor();
    return parseFloat(t);
  }

  function parseTerm() {
    let left = parseFactor();
    while (TERM_OP_REGEX.test(peek() || '')) {
      const op = next();
      const right = parseFactor();
      if (op === '*') left *= right;
      else if (op === '/') {
        if (right === 0) throw new Error('divisao por zero');
        left /= right;
      }
    }
    return left;
  }

  function parseExpr() {
    let left = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = next();
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  for (let k = 0; k < tokens.length - 1; k++) {
    if (tokens[k] === '/' && parseFloat(tokens[k + 1]) === 0) {
      throw new Error('divisao por zero');
    }
  }

  const result = parseExpr();
  if (!Number.isFinite(result)) throw new Error('resultado invalido');
  return result;
}

function round(n) {
  return Math.round(n * 1e6) / 1e6;
}

function formatNumber(n) {
  return String(round(n));
}

function buildModifierText(terms) {
  return terms.map(t => `${t.op}${t.value}`).join('');
}

function hasOperator(terms, ops) {
  return terms.some(t => ops.includes(t.op));
}

const DICE_REGEX = /^(\d+)d(\d+)((?:[+\-*/]\d+)*)(\s+\d+d\d+(?:[+\-*/]\d+)*)*$/;

function parseDice(input) {
  const tokens = input.trim().split(/\s+/);
  const parsed = [];
  for (const token of tokens) {
    const match = token.match(/^(\d+)d(\d+)((?:[+\-*/]\d+)*)$/);
    if (!match) return null;
    const terms = splitTerms(match[3] || '');
    try {
      evaluateTerms(terms, 1);
    } catch {
      return null;
    }
    parsed.push({
      count: parseInt(match[1], 10),
      sides: parseInt(match[2], 10),
      modifierText: buildModifierText(terms),
      terms,
    });
  }
  return parsed;
}

function rollSingle(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollDice(parsed) {
  return parsed.map(({ count, sides, modifierText, terms }) => {
    const rolls = [];
    for (let i = 0; i < count; i++) {
      rolls.push(rollSingle(sides));
    }
    const rawTotal = rolls.reduce((a, b) => a + b, 0);

    let total;
    try {
      total = round(evaluateTerms(terms, rawTotal));
    } catch {
      total = rawTotal;
    }

    const hasAdd = hasOperator(terms, ['+', '-']);
    const scaleTerms = terms.filter(t => t.op === '*' || t.op === '/');

    let scaledRolls = null;
    if (!hasAdd && scaleTerms.length > 0) {
      try {
        scaledRolls = rolls.map(r => round(evaluateTerms(scaleTerms, r)));
      } catch {
        scaledRolls = null;
      }
    }

    return {
      count,
      sides,
      modifierText,
      terms,
      rolls,
      scaledRolls,
      rawTotal,
      total,
      hasAdd,
      isPureScale: !hasAdd && scaleTerms.length > 0,
    };
  });
}

function formatResult(groups) {
  return groups.map(g => {
    const label = `${g.count}d${g.sides}${g.modifierText}`;

    if (g.isPureScale) {
      const lines = g.scaledRolls.map((v, i) => {
        const shown = `(${formatNumber(g.rolls[i])}${g.modifierText})`;
        return `${shown} = **${formatNumber(v)}**`;
      });
      return `🎲 **${label}** (por dado)\n${lines.join('\n')}\nTotal: ${formatNumber(g.rawTotal)}${g.modifierText} = **${formatNumber(g.total)}**`;
    }

    if (g.hasAdd) {
      const spaced = `${formatNumber(g.rawTotal)}${g.modifierText}`
        .replace(/([+\-*/])(\d+)/g, ' $1 $2');
      return `🎲 **${label}**: [${g.rolls.join(', ')}]\n${spaced} = **${formatNumber(g.total)}**`;
    }

    return `🎲 **${label}**: [${g.rolls.join(', ')}] = **${formatNumber(g.total)}**`;
  }).join('\n');
}

module.exports = {
  parseDice,
  rollDice,
  formatResult,
  DICE_REGEX,
  splitTerms,
  evaluateTerms,
};
