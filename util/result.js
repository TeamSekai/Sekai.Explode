// @ts-check

/**
 * @template T
 * 正常な処理結果。
 */
class Ok {
	/**
	 * @readonly
	 */
	status = "ok";

	/**
	 * @readonly
	 * @type {T}
	 */
	value;

	/**
	 * @param {T} value
	 */
	constructor(value) {
		this.value = value;
	}
}

/**
 * @template E
 * 処理中のエラー。
 */
class Err {
	/**
	 * @readonly
	 */
	status = "err";

	/**
	 * @readonly
	 * @type {E}
	 */
	value;

	/**
	 * @param {E} value
	 */
	constructor(value) {
		this.value = value;
	}
}

/**
 * @template T
 * @template [E=any]
 * @typedef {Ok<T> | Err<E>} Result 処理の結果を表す型
 */

module.exports = { Ok, Err };
