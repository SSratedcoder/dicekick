const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');
const { parseDice, rollDice, formatResult, DICE_REGEX } = require('./dice');
const { addEntry } = require('./history');
const { handleHelp, handleHistory } = require('./commands');

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

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const content = message.content.trim();
  const prefix = config.prefix || '!';

  if (content.startsWith(prefix)) {
    const cmd = content.slice(prefix.length).split(/\s+/)[0].toLowerCase();
    if (cmd === 'help') return handleHelp(message);
    if (cmd === 'history') return handleHistory(message);
    return;
  }

  if (!DICE_REGEX.test(content)) return;

  if (!checkRateLimit(message.author.id)) {
    return message.reply('Calma aí, vai com calma! Aguarde 2 segundos entre rolagens.');
  }

  const parsed = parseDice(content);
  if (!parsed || parsed.length === 0) return;

  const results = rollDice(parsed);

  const notation = results.map(r => {
    if (r.modifier !== 0) {
      return `${r.count}d${r.sides}${r.modifier > 0 ? '+' : ''}${r.modifier}`;
    }
    return `${r.count}d${r.sides}`;
  }).join(' ');

  const total = results.reduce((sum, r) => sum + r.total, 0);
  const resultStr = formatResult(results);

  addEntry(message.author.id, message.author.username, notation, resultStr, total);
  message.reply(resultStr);
});

client.once('ready', () => {
  console.log(`✅ Dicekick online como ${client.user.tag}`);
});

client.login(config.token);
