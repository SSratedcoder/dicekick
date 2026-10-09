const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');
const { parseDice, rollDice, formatResult, DICE_REGEX } = require('./dice');
const { addEntry } = require('./history');
const { getPreset, findCandidates } = require('./presets');
const { handleHelp, handleHistory, handleAdd, handleRemove, handleList, handleRoll, HELP_LINES } = require('./commands');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const rateLimit = new Map();
const RATE_LIMIT_MS = 2000;

function checkRateLimit(userId) {
  const now = Date.now();
  const last = rateLimit.get(userId);
  if (last && now - last < RATE_LIMIT_MS) {
    return false;
  }
  rateLimit.set(userId, now);
  return true;
}

function cleanOldRateLimits() {
  const now = Date.now();
  for (const [key, val] of rateLimit) {
    if (now - val > RATE_LIMIT_MS * 2) rateLimit.delete(key);
  }
}

setInterval(cleanOldRateLimits, 60000);

function performRoll(message, parsed, notation) {
  if (!checkRateLimit(message.author.id)) {
    return message.reply('Calma aí, vai com calma! Aguarde 2 segundos entre rolagens.');
  }

  let rolled;
  try {
    rolled = rollDice(parsed);
  } catch (err) {
    return message.reply(`Não consegui rolar \`${notation}\`: ${err.message}.`);
  }

  const resultStr = formatResult(rolled, notation);
  addEntry(message.author.id, message.author.username, notation, resultStr, rolled.total);
  return message.reply(resultStr);
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();
  const prefix = config.prefix || '!';

  if (content.startsWith(prefix)) {
    const args = content.slice(prefix.length).trim();
    const cmd = (args.split(/\s+/)[0] || '').toLowerCase();
    const rest = args.split(/\s+/).slice(1).join(' ');
    if (!HELP_LINES[cmd]) return;
    if (cmd === 'help') return handleHelp(message);
    if (cmd === 'history') return handleHistory(message);
    if (cmd === 'add' || cmd === 'criar') return handleAdd(message, rest);
    if (cmd === 'rm' || cmd === 'apagar') return handleRemove(message, rest);
    if (cmd === 'list' || cmd === 'lista') return handleList(message);
    if (cmd === 'roll' || cmd === 'rolar') {
      const found = await handleRoll(message, rest);
      if (found && found.preset) {
        const parsed = parseDice(found.preset.notation);
        if (parsed) return performRoll(message, parsed, found.preset.name);
      }
    }
    return;
  }

  const preset = getPreset(message.author.id, content);
  if (preset) {
    const parsed = parseDice(preset.notation);
    if (parsed) return performRoll(message, parsed, preset.name);
  }

  if (!DICE_REGEX.test(content)) {
    const candidates = findCandidates(message.author.id, content);
    if (candidates.length === 1) {
      return message.reply(`Você quis dizer **${candidates[0].name}**? Digite exatamente assim, ou use \`!roll ${candidates[0].name}\`.`);
    }
    return;
  }

  const parsed = parseDice(content);
  if (!parsed) return;

  performRoll(message, parsed, content);
});

client.once('ready', () => {
  console.log(`✅ Dicekick online como ${client.user.tag}`);
});

client.login(config.token);
