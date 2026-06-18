# 🎲 Dicekick

Bot do Discord para rolagem de dados. Basta digitar a notação no chat que ele rola automaticamente — sem comandos, sem prefixo.

## Funcionalidades

- **Rolagem automática** — digite `1d20`, `2d6+3`, `100d100` direto no chat
- **Múltiplos dados** — `1d20 2d8 3d6`
- **Modificadores** — `2d10+5`, `1d8-2`
- **Histórico** — salva as últimas 20 rolagens por usuário (JSON)
- **Rate limit** — 2 segundos entre rolagens pra evitar spam
- **Comandos** — `!help` e `!history`

## Como usar

| Mensagem | Resultado |
|---|---|
| `1d20` | Rola 1 dado de 20 faces |
| `2d6+3` | Rola 2d6 e soma +3 |
| `1d20 2d8` | Rola 1d20 e 2d8 em sequência |
| `rola 1d20 ai` | Ignorado (texto extra) |
| `!help` | Mostra ajuda |
| `!history` | Mostra suas últimas 10 rolagens |

## Instalação

```bash
git clone <seu-repo>
cd dicekick
npm install
```

Edite o `config.json` com o token do seu bot:

```json
{
  "token": "SEU_TOKEN_AQUI",
  "prefix": "!"
}
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) 16.9+
- Um bot no [Discord Developer Portal](https://discord.com/developers/applications) com as seguintes intents habilitadas:
  - `MESSAGE CONTENT INTENT`
  - `SERVER MEMBERS INTENT` (opcional)

## Rodar

```bash
npm start
```

## Licença

MIT
