// @ts-check

import {
	ChatInputCommandInteraction,
	Client,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';

// 汎用的な型を定義するファイル

/**
 * スラッシュコマンドを表すオブジェクト
 */
export interface Command {
	/**
	 * Discord の API に登録するデータ
	 */
	data: {
		name: string;
		toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody;
	};

	/**
	 * コマンドの処理
	 */
	execute(
		interaction: ChatInputCommandInteraction,
		client: Client<true>,
	): Promise<void>;
}

/**
 * 文字列を区切ってできる文字列からなるユニオン型
 * @template {string} S 元の文字列
 * @template {string} D 区切り文字
 */
export type Split<
	S extends string,
	D extends string,
> = S extends `${infer T}${D}${infer U}` ? T | Split<U, D> : S;

/**
 * 機能の1単位を表すオブジェクト
 */
export interface Feature {
	/**
	 * 読み込まれた時の処理
	 */
	onLoad?(client: Client<boolean>): PromiseLike<void> | void;

	/**
	 * クライアントにログインしたときの処理
	 */
	onClientReady?(client: Client<true>): PromiseLike<void> | void;

	/**
	 * 終了したときの処理
	 */
	onUnload?(): PromiseLike<void> | void;
}
