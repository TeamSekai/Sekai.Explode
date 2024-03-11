// @ts-check

// 汎用的な型を定義するファイル

/**
 * @typedef {Object} Command スラッシュコマンドを表すオブジェクト
 * @property {{
 *     name: string,
 *     toJSON(): import('discord.js').RESTPostAPIChatInputApplicationCommandsJSONBody
 * }} data Discord の API に登録するデータ
 * @property {(
 *     interaction: import('discord.js').ChatInputCommandInteraction,
 *     client: import('discord.js').Client<true>,
 * ) => Promise<void>} execute コマンドの処理
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

/**
 * @typedef {Object} Feature 機能の1単位を表すオブジェクト
 * @property {Feature_onLoad=} onLoad 読み込まれた時の処理
 */

/**
 * @callback Feature_onLoad
 * @param {import('../internal/commands').CommandManager} commands
 * @returns {void}
 */

module.exports = {};
