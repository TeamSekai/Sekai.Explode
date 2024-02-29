// @ts-check

// 汎用的な型を定義するファイル

const { ChatInputCommandInteraction } = require("discord.js");

/**
 * @typedef {Object} Command スラッシュコマンドを表すオブジェクト
 * @property {import("discord.js").SlashCommandSubcommandsOnlyBuilder} data Discord の API に登録するデータ
 * @property {(interaction: ChatInputCommandInteraction) => Promise<void>} execute コマンドの処理
 */
