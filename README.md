# 🎲 Dicekick

Bot de Discord que rola dados. Digita a notação no chat e ele responde — sem
comando, sem prefixo.

## Funcionalidades

- **Rolagem automática** — `1d20`, `2d6+3`, `100d100` direto no chat
- **Múltiplos dados** — `1d20 2d8 3d6`
- **Modificadores** — `+`, `-`, `*` e `/`, inclusive combinados
- **Dados salvos** — dá um nome a uma notação e rola digitando o nome
- **Histórico** — as últimas 20 rolagens de cada usuário
- **Rate limit** — 2 segundos entre rolagens

## Uso rápido

| Você digita | O que acontece |
|---|---|
| `1d20` | Rola 1 dado de 20 faces |
| `2d6+3` | Rola 2d6 e soma 3 no total |
| `1d20 2d8` | Rola 1d20 e 2d8, tudo na mesma mensagem |
| `2d6*3` | Multiplica cada dado e o total por 3 |
| `4d6/2` | Divide cada dado e o total por 2 |
| `bola de fogo` | Rola o dado salvo com esse nome |
| `rola 1d20 ai` | Ignorado — texto extra invalida a mensagem |
| `2d6/0` | Ignorado — divisão por zero |

## Modificadores

| Notação | Resultado |
|---|---|
| `2d6+3` | total + 3 |
| `2d6-2` | total − 2 |
| `2d6*3` | cada dado e o total × 3 |
| `4d6/2` | cada dado e o total ÷ 2 |
| `2d6+3*2` | com os dados dando 4 e 5: `9 + 6 = 15` |
| `3d6+2*4-5` | com os dados dando 1, 2 e 3: `6 + 8 − 5 = 9` |

Combinações usam a precedência de matemática normal: `*` e `/` antes de `+` e `-`.

`*` e `/` são aplicados em cada dado **e** no total, e os dois aparecem na
resposta. `+` e `-` entram só no total — somar em cada dado individualmente faria
um `d6` virar algo maior que 6.

Divisão não arredonda: `7/2` dá `3.5`.

## Dados salvos

Para não digitar a mesma notação o tempo todo, dá um nome a ela:

```
!add bola de fogo 3d6
```

Depois é só digitar `bola de fogo` no chat. Não precisa do `!`, aceita nome com
palavras e não diferencia maiúsculas.

Se você digitar algo próximo (por exemplo `bola`) e houver um único atalho que
combina, o bot pergunta se foi esse em vez de ficar calado.

### Comandos

| Comando | Alias | O que faz |
|---|---|---|
| `!add <nome> <notação>` | `!criar` | Cria um atalho |
| `!rm <nome>` | `!apagar` | Remove um atalho |
| `!list` | `!lista` | Lista seus atalhos |
| `!roll <nome>` | `!rolar` | Rola um atalho explicitamente |
| `!help` | — | Mostra a ajuda no chat |
| `!history` | — | Suas últimas 10 rolagens |

Os atalhos são por usuário, ficam em `presets.json` e o limite é 50 por pessoa.
`!add` num nome que já existe sobrescreve a notação.

## Instalação

```bash
git clone https://github.com/SSratedcoder/dicekick.git
cd dicekick
npm install
```

O `config.json` já vem no repositório com o token em branco. Abra e cole o token
do seu bot:

```json
{
  "token": "SEU_TOKEN_AQUI",
  "prefix": "!"
}
```

`prefix` define a letra que inicia os comandos e é opcional (`!` por padrão).

> **Cuidado:** o `config.json` está versionado, então o `.gitignore` não se aplica
> a ele. Se você colar o token e rodar `git add .`, ele vai para o repositório
> público. Se for mexer no código, tire o token do arquivo antes de commitar, ou
> apague a linha e mantenha só o placeholder.

## Rodar

```bash
npm start
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) 16.9+
- Um bot no [Discord Developer Portal](https://discord.com/developers/applications)

### Intents

Habilite **uma** intent em Bot → Privileged Gateway Intents:

| Intent | Precisa? |
|---|---|
| **MESSAGE CONTENT INTENT** | sim — sem ela o bot não vê o texto |
| SERVER MEMBERS INTENT | não — o código nunca busca membros |
| PRESENCE INTENT | não |
| DIRECT MESSAGES INTENT | não — só funciona em servidores |

### Permissões no servidor

O bot só precisa de **VER CANAL**, **ENVIAR MENSAGENS** e **HISTÓRICO DE
MENSAGENS**, que já vêm liberados por padrão. Não precisa de Administrador,
Gerenciar Mensagens nem Mencionar @everyone.

Se estiver adicionando o bot pelo navegador, use esta URL com o botão de invite,
o `permissions=68608` já é o trio mínimo:

```
https://discord.com/api/oauth2/authorize?client_id=SEU_CLIENT_ID&permissions=68608&scope=bot
```

## Licença

MIT
