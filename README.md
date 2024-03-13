# Sekai.explode - Simple Discord Bot w/discord.js@v14

![Alt](https://repobeats.axiom.co/api/embed/b7fc33791d3233660e7c02524ace22c31b66e890.svg "Repobeats analytics image")


## What's this?
discord.js@v14を使用した、多機能botです。

機能の追加/削除も簡単に行え、初心者でも使いやすい設計になっています。

## このBotを試すことはできますか?
はい。公開ボットとして24時間稼働しておりますので、手軽に試す事ができます。

[こちら](https://discord.com/api/oauth2/authorize?client_id=1144600133762293800&permissions=8&scope=bot)から追加できます。

## 動作環境
* Node.js (v18以上を推奨)
* npm、またはyarnを利用できる環境
* gitを利用できる環境
* (推奨) pm2を利用できる環境
> PM2が利用できない場合、`/update`コマンドが動作しません。

## インストール & 実行

> ⚠ 動作環境を確認してから行ってください。

1. このリポジトリをクローン
2. `npm install`で依存関係をインストール
3. `config.json.example`を`config.json`としてコピーする
4. `config.json`を編集
6. `npm start`、または`pm2 start npm -- start`で起動!


## コマンドを登録する

### `misc` パッケージに追加する方法
`packages/misc/commands`ディレクトリにファイルを作成するだけで、起動時に自動で読み込まれます。

#### 例:
```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('Hello World!'),
    execute: async function (interaction) {
        await interaction.reply('Hello World!') //処理を記述
    }
};
```

### パッケージを追加する方法
`packages` ディレクトリ以下に workspace を作成します。
このパッケージは自動的に読み込まれます。
```sh
npm init -w packages/example
```

エントリーポイントのファイル (`index.js` など) でコマンドを追加し、feature をエクスポートします。

#### 例:
```js
const { CommandManager } = require('../../internal/commands');
const upload = require('./upload');

class ExampleFeature {
	onLoad() {
		CommandManager.default.addCommands({
            data: new SlashCommandBuilder()
                .setName('hello')
                .setDescription('Hello World!'),
            execute: async function (interaction) {
                await interaction.reply('Hello World!') //処理を記述
            }
        });
	}
}

module.exports = { feature: new ExampleFeature() };
```
