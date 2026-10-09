const { getHistory } = require('./history');
const { getPresets, getPreset, findCandidates, setPreset, removePreset } = require('./presets');
const { parseDice } = require('./dice');
const { EmbedBuilder } = require('discord.js');

function handleHelp(message) {
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('🎲 Dicekick — Comandos')
    .addFields(
      {
        name: 'Rolando dados',
        value: 'Basta digitar a notação do dado no chat.\nEx: `1d20` `2d6+3` `1d20 2d8`\nOu digite o nome de um dado salvo, ex: `bola de fogo`',
      },
      {
        name: 'Dados salvos',
        value: '`!add bola de fogo 3d6` cria o atalho\nDigitar `bola de fogo` no chat rola `3d6`\n`!rm bola de fogo` remove\n`!list` mostra todos os seus',
      },
      {
        name: 'Modificadores',
        value: 'Use `+` ou `-`: `1d20+5`, `3d8-2`\nUse `*` ou `/`: `2d6*3`, `4d6/2`\nDá pra combinar: `2d6+3*2` (precedência normal)',
      },
      {
        name: 'Expressões',
        value: 'Parênteses e precedência: `(2d6+1d8)*3-1d4/2`\nEspaços à vontade no operador: `1d20 + 3`\nSoma implícita de grupos: `1d20 2d8`',
      },
      {
        name: '!help',
        value: 'Mostra esta mensagem',
      },
      {
        name: '!history',
        value: 'Mostra suas últimas 10 rolagens',
      },
    );
  message.reply({ embeds: [embed] });
}

function handleHistory(message) {
  const history = getHistory(message.author.id, 10);
  if (history.length === 0) {
    return message.reply('Nenhuma rolagem encontrada no seu histórico.');
  }
  const lines = history.map((entry, i) => {
    const date = new Date(entry.timestamp).toLocaleString('pt-BR');
    return `**${i + 1}.** ${entry.notation} → **${entry.total}** (${date})`;
  });
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`📜 Últimas rolagens — ${message.author.username}`)
    .setDescription(lines.join('\n'))
    .setFooter({ text: `Total: ${history.length} rolagens` });
  message.reply({ embeds: [embed] });
}

function handleAdd(message, args) {
  const parts = args.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return message.reply('Uso: `!add <nome> <notação>` — ex: `!add bola de fogo 3d6`');
  }

  let name = null;
  let notation = null;
  for (let i = 0; i <= parts.length - 2; i++) {
    const candidate = parts.slice(i + 1).join(' ');
    if (parseDice(candidate)) {
      name = parts.slice(0, i + 1).join(' ');
      notation = candidate;
      break;
    }
  }

  if (!notation) {
    return message.reply(`Não achei uma notação válida em \`${args.trim()}\`. Use algo como \`!add bola de fogo 3d6\` ou \`!add dano 2d6 + 1d8\`.`);
  }

  const result = setPreset(message.author.id, name, notation);
  if (!result.ok) {
    return message.reply('Não consegui salvar esse dado.');
  }
  message.reply(
    result.replaced
      ? `🔄 Atualizado: **${result.entry.name}** agora rola \`${result.entry.notation}\``
      : `✅ Dado salvo: **${result.entry.name}** → \`${result.entry.notation}\`\nAgora é só digitar \`${result.entry.name}\` no chat.`
  );
}

function handleRemove(message, args) {
  if (!args.trim()) {
    return message.reply('Uso: `!rm <nome>` — ex: `!rm bola de fogo`');
  }
  const result = removePreset(message.author.id, args);
  if (!result.ok) {
    return message.reply(`Não achei um dado chamado "${args.trim()}". Use \`!list\` pra ver os seus.`);
  }
  message.reply(`🗑️ Removido: **${result.name}**`);
}

function handleList(message) {
  const presets = getPresets(message.author.id);
  if (presets.length === 0) {
    return message.reply('Você ainda não salvou nenhum dado.\nCrie com `!add bola de fogo 3d6`');
  }
  const lines = presets
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(p => `🎲 **${p.name}** → \`${p.notation}\``);
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`📦 Seus dados — ${message.author.username}`)
    .setDescription(lines.join('\n'))
    .setFooter({ text: `${presets.length} de 50 slots` });
  message.reply({ embeds: [embed] });
}

function handleRoll(message, args) {
  if (!args.trim()) {
    return message.reply('Uso: `!roll <nome>` — ex: `!roll bola de fogo`');
  }
  const preset = getPreset(message.author.id, args);
  if (!preset) {
    const candidates = findCandidates(message.author.id, args);
    if (candidates.length === 1) {
      return message.reply(`Você quis dizer **${candidates[0].name}**? Use \`!roll ${candidates[0].name}\`.`);
    }
    return message.reply(`Não achei um dado chamado "${args.trim()}". Use \`!list\` pra ver os seus.`);
  }
  return { preset };
}

const HELP_LINES = {
  add: 'Cria um atalho: `!add bola de fogo 3d6`',
  criar: 'Cria um atalho: `!criar bola de fogo 3d6`',
  rm: 'Remove um atalho: `!rm bola de fogo`',
  apagar: 'Remove um atalho: `!apagar bola de fogo`',
  list: 'Lista seus dados salvos',
  lista: 'Lista seus dados salvos',
  roll: 'Rola um dado salvo: `!roll bola de fogo`',
  rolar: 'Rola um dado salvo: `!rolar bola de fogo`',
};

module.exports = { handleHelp, handleHistory, handleAdd, handleRemove, handleList, handleRoll, HELP_LINES };
