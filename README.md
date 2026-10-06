# 🎲 Dicekick

Bot do Discord para rolagem de dados. Basta digitar a notação no chat que ele rola automaticamente — sem comandos, sem prefixo.

## Funcionalidades

- **Rolagem automática** — digite `1d20`, `2d6+3`, `100d100` direto no chat
- **Múltiplos dados** — `1d20 2d8 3d6`
- **Modificadores** — `2d10+5`, `1d8-2`, `2d6*3`, `4d6/2`
- **Dados salvos** — defina um nome pra uma notação e rola digitando o nome
- **Histórico** — salva as últimas 20 rolagens por usuário (JSON)
- **Rate limit** — 2 segundos entre rolagens pra evitar spam

## Como usar

| Mensagem | Resultado |
|---|---|
| `1d20` | Rola 1 dado de 20 faces |
| `2d6+3` | Rola 2d6 e soma +3 |
| `1d20 2d8` | Rola 1d20 e 2d8 em sequência |
| `2d6*3` | Cada dado e o total multiplicados por 3 |
| `4d6/2` | Cada dado e o total divididos por 2 |
| `2d6+3*2` | Combina operadores, com precedência normal |
| `rola 1d20 ai` | Ignorado (texto extra) |
| `2d6/0` | Ignorado (divisão por zero) |
| `bola de fogo` | Rola o dado salvo com esse nome |
| `!help` | Mostra ajuda |
| `!history` | Mostra suas últimas 10 rolagens |

## Modificadores

| Notação | O que faz |
|---|---|
| `2d6+3` | Soma 3 no total |
| `2d6-2` | Subtrai 2 do total |
| `2d6*3` | Multiplica cada dado e o total por 3 |
| `4d6/2` | Divide cada dado e o total por 2 |
| `2d6+3*2` | Avaliado com precedência normal: `9 + 6 = 15` |

`*` e `/` aparecem aplicados em cada dado individualmente e no total, porque
depende do que você quer ver: o valor de cada dado já escalado, o total, ou os
dois.

Divisão não arredonda — `7/2` dá `3.5`. `+` e `-` são aplicados só no total,
nunca em cada dado, senão um `d6` viraria algo maior que 6.

## Dados salvos

Crie um atalho pra notação que você usa sempre e rola pelo nome, sem digitar
`3d6` toda vez:

```
!add bola de fogo 3d6
```

A partir daí, digitar `bola de fogo` no chat rola `3d6`. Funciona com nome
composto, com ou sem maiúsculas, e não precisa do prefixo `!`.

Nomes aproximados ganham sugestão em vez de silêncio: se você digitar `bola` e
o único atalho que combina for `bola de fogo`, o bot pergunta se foi esse.

### Comandos

| Comando | O que faz |
|---|---|
| `!add <nome> <notação>` | Cria um atalho (alias: `!criar`) |
| `!rm <nome>` | Remove um atalho (alias: `!apagar`) |
| `!list` | Lista seus atalhos (alias: `!lista`) |
| `!roll <nome>` | Rola um atalho explicitamente (alias: `!rolar`) |
| `!help` | Mostra a ajuda |
| `!history` | Suas últimas 10 rolagens |

Os atalhos são por usuário e ficam em `presets.json`, com limite de 50 por
pessoa. Passar `!add` num nome que já existe sobrescreve a notação.

## Instalação

```bash
git clone https://github.com/SSratedcoder/dicekick.git
cd dicekick
npm install
```

O `config.json` já vem no repositório com o token em branco. Edite e cole o token
do seu bot:

```json
{
  "token": "SEU_TOKEN_AQUI",
  "prefix": "!"
}
```

Atenção: como o `config.json` está versionado, o `.gitignore` não se aplica a ele.
Se você preencher o token localmente, **não commite** esse arquivo — ele ficaria
público. Para um setup local, prefira manter o token fora do git.

O `prefixo` é opcional e define a letra que inicia os comandos (`!` por padrão).

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
