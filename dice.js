const DICE_REGEX = /^(\d+)d(\d+)([+-]\d+)?(\s+\d+d\d+([+-]\d+)?)*$/;

function parseDice(input) {
  const tokens = input.trim().split(/\s+/);
  return tokens.map(token => {
    const match = token.match(/^(\d+)d(\d+)([+-]\d+)?$/);
    if (!match) return null;
    return {
      count: parseInt(match[1], 10),
      sides: parseInt(match[2], 10),
      modifier: match[3] ? parseInt(match[3], 10) : 0,
    };
  }).filter(Boolean);
}

function rollSingle(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollDice(parsed) {
  const groups = parsed.map(({ count, sides, modifier }) => {
    const rolls = [];
    for (let i = 0; i < count; i++) {
      rolls.push(rollSingle(sides));
    }
    const rawTotal = rolls.reduce((a, b) => a + b, 0);
    return { count, sides, modifier, rolls, rawTotal, total: rawTotal + modifier };
  });
  return groups;
}

function formatResult(groups) {
  return groups.map(g => {
    const label = g.modifier !== 0 ? `${g.count}d${g.sides}${g.modifier > 0 ? '+' : ''}${g.modifier}` : `${g.count}d${g.sides}`;
    const total = g.total;
    const rollsStr = `[${g.rolls.join(', ')}]`;
    if (g.modifier !== 0) {
      const rawTotal = g.rawTotal;
      const modStr = g.modifier > 0 ? `+${g.modifier}` : `${g.modifier}`;
      return `🎲 **${label}**: ${rollsStr} = ${rawTotal} ${modStr} = **${total}**`;
    }
    return `🎲 **${label}**: ${rollsStr} = **${total}**`;
  }).join('\n');
}

module.exports = { parseDice, rollDice, formatResult, DICE_REGEX };
