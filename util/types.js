// @ts-check

// 汎用的な型を定義するファイル

/**
 * @typedef {Object} Command スラッシュコマンドを表すオブジェクト
 * @property {import("discord.js").SlashCommandSubcommandsOnlyBuilder} data Discord の API に登録するデータ
 * @property {(interaction: import("discord.js").ChatInputCommandInteraction) => Promise<void>} execute コマンドの処理
 */

module.exports = {};
