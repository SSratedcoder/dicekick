const { getHistory } = require('./history');
const { EmbedBuilder } = require('discord.js');

function handleHelp(message) {
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('🎲 Dicekick — Comandos')
    .addFields(
      {
        name: 'Rolando dados',
        value: 'Basta digitar a notação do dado no chat.\nEx: `1d20` `2d6+3` `1d20 2d8`',
      },
      {
        name: 'Modificadores',
        value: 'Use `+` ou `-` no final: `1d20+5`, `3d8-2`',
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

module.exports = { handleHelp, handleHistory };
