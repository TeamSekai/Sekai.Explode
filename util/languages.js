// @ts-check

const path = require('path');
const config = require('../config.json');
const LANG = require('../language/default.json');

/**
 * @type {typeof import('../language/default.json')}
 */
const configLANG = require(
	path.join(
		__dirname,
		'..',
		'language',
		(config.language ?? 'default') + '.json',
	),
);

function assignDeep(target, source) {
	for (const [key, value] of Object.entries(source)) {
		if (target[key] instanceof Object) assignDeep(target[key], value);
		else if (value instanceof Object) target[key] = assignDeep({}, value);
		else target[key] = value;
	}
	return target;
}

assignDeep(LANG, configLANG);

class FormatSyntaxError extends SyntaxError {
	/**
	 * @param {string} message
	 */
	constructor(message) {
		super(message);
	}
}

/** @enum {number} format 関数で用いる有限オートマトンの状態。 */
const State = {
	PLAIN: 0,
	ESCAPED: 1,
	AFTER_DOLLAR: 2,
	IN_PLACEHOLDER: 3,
};

/**
 * 文字列中のプレースホルダを指定された値で置き換える。
 *
 * `str` は `"${"` と `"}"` に囲まれたプレースホルダを含むことができる。
 * 文字列 `placeholder` について、
 * values の要素数が 1 であり、その要素が Object であるとき、
 * `str` 中の `"${" + placeholder + "}"` は
 * `values[0]?.[placeholder.trim()]` に置き換えられる。
 * values の要素が複数個であるか、Object でない要素が含まれるとき、
 * `values?.[placeholder.trim()]` に置き換えられる。
 * ただし、`placeholder.trim()` は `placeholder` の先頭と末尾の空白文字を除いた文字列である。
 * プレースホルダ外において、`"\\\\""`, `"\\$", `"\\{" はそれぞれ `"\\"`, `"$"`, `"{"` に置き換えられる。
 *
 * 例:
 * ```
 * strFormat("text ${a} abc", { a: 123 });    // == "text 123 abc"
 * strFormat("text ${ a } abc", { a: 123 });  // == "text 123 abc"
 * strFormat("text \\${a} abc", { a: 123 });  // == "text ${a} abc"
 * strFormat("text $\\{a} abc", { a: 123 });  // == "text ${a} abc"
 * strFormat("text ${0} abc", [123]);         // == "text 123 abc"
 * strFormat("text ${0} abc", 123);           // == "text 123 abc"
 * ```
 *
 * @param {string} str 文字列のフォーマット
 * @param {unknown[]} values プレースホルダを置き換える値
 */
function strFormat(str, ...values) {
	const map = toMap(values);
	let result = '';
	let placeholder = '';

	// 入力を str, 状態を PLAIN, ESCAPED, AFTER_DOLLAR, IN_PLACEHOLDER とした有限オートマトンを構成
	// 入力は常に1文字ずつ読み進められる。
	let state = State.PLAIN;
	for (const c of str) {
		switch (state) {
			case State.PLAIN:
				if (c == '\\') state = State.ESCAPED;
				else if (c == '$') state = State.AFTER_DOLLAR;
				else result += c;
				break;
			case State.ESCAPED:
				if (c == '\\' || c == '$' || c == '{') result += c;
				else result += '\\' + c;
				state = State.PLAIN;
				break;
			case State.AFTER_DOLLAR:
				if (c == '\\') {
					result += '$';
					state = State.ESCAPED;
				} else if (c == '{') {
					state = State.IN_PLACEHOLDER;
				} else {
					result += '$' + 'c';
					state = State.PLAIN;
				}
				break;
			case State.IN_PLACEHOLDER:
				if (c == '}') {
					result += map?.[placeholder.trim()];
					placeholder = '';
					state = State.PLAIN;
				} else {
					placeholder += c;
				}
				break;
		}
	}

	if (state == State.ESCAPED) result += '\\';
	if (state == State.IN_PLACEHOLDER)
		throw new FormatSyntaxError("Unexpected end of input; '}' expected");

	return result;
}

/**
 * @param  {unknown[]} values
 */
function toMap(values) {
	if (values.length == 0) {
		return null;
	}
	if (values.length == 1 && values[0] instanceof Object) {
		return values[0];
	}
	return values;
}

module.exports = { LANG, FormatSyntaxError, strFormat, assignDeep };
