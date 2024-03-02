// @ts-check

// 汎用的な型を定義するファイル

/**
 * @typedef {Object} Command スラッシュコマンドを表すオブジェクト
 * @property {import("discord.js").SlashCommandSubcommandsOnlyBuilder} data Discord の API に登録するデータ
 * @property {(interaction: import("discord.js").ChatInputCommandInteraction) => Promise<void>} execute コマンドの処理
 */

/**
 * @template {string} S 元の文字列
 * @template {string} D 区切り文字
 * @typedef {(
 *     S extends `${infer T}${D}${infer U}`
 *         ? T | Split<U, D>
 *         : S
 * )} Split 文字列を区切ってできる文字列からなるユニオン型
 */

module.exports = {};
