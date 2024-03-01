/**
 * 値が負の場合、エラーを送出する。
 * @param {any} num 値
 * @param {string} name 値の名前
 */
function requireNonNegative(num, name) {
	if (typeof num != "number") throw new TypeError(`${name} must be a number`);
	if (num < 0) throw new RangeError(`${name} must not be negative`);
	return num;
}

/**
 * 数値の上位をゼロ埋めした文字列を返す。
 * @param {number} num 数値
 * @param {number} digits 整数部分の桁数
 * @returns 整数部分が指定された桁数になるようにゼロ埋めされた文字列
 */
function zeroPadding(num, digits = 2) {
	const integerPart = Math.floor(num);
	const integerPartString = integerPart.toString();
	const originalString =
		integerPart == num ? integerPartString : num.toString();
	return "0".repeat(digits - integerPartString.length) + originalString;
}

/**
 * @typedef {Object} Values 時間の各単位の量を表すオブジェクト
 * @property {number=} days 日
 * @property {number=} hours 時間
 * @property {number=} minutes 分
 * @property {number=} seconds 秒
 * @property {number=} millis ミリ秒
 */

/**
 * 時間のミリ秒単位での値を求める。
 * @param {Values} values 各単位の量からなるオブジェクト
 * @returns ミリ秒単位での値
 */
function valuesToMillis(values) {
	const days = values.days ?? 0;
	const hours = days * 24 + (values.hours ?? 0);
	const minutes = hours * 60 + (values.minutes ?? 0);
	const seconds = minutes * 60 + (values.seconds ?? 0);
	const millis = seconds * 1000 + (values.millis ?? 0);
	return requireNonNegative(millis, "values");
}

/**
 * 時間（2つの時点の間の長さ）を表すクラス
 */
class Timespan {
	#millis;

	/**
	 * 時間を表すオブジェクトを作成する。
	 * @param {Values=} values 各単位の量からなるオブジェクト
	 */
	constructor(values = {}) {
		this.#millis = valuesToMillis(values);
	}

	/**
	 * @returns ミリ秒単位での時間
	 */
	asMillis() {
		return this.#millis;
	}

	/**
	 * 時間の加算を行う。
	 * @param {Timespan} val 加える値
	 * @returns 和
	 */
	add(val) {
		return new Timespan(this.asMillis() + val.asMillis());
	}

	/**
	 * 時間の減算を行う。
	 * @param {Timespan} val 減じる値
	 * @returns 差
	 */
	sub(val) {
		return new Timespan(this.asMillis() - val.asMillis());
	}

	/**
	 * 時間の乗算を行う。
	 * @param {number} multiplier 乗じる値
	 * @returns 積
	 */
	mul(multiplier) {
		return new Timespan(this.asMillis() * multiplier);
	}

	/**
	 * 時間の除算を行う。
	 * @param {number} divisor 除する値
	 * @returns 積
	 */
	div(divisor) {
		return new Timespan(this.asMillis() / divisor);
	}

	/**
	 * 時間を比較する。
	 * @param {Timespan} val 比較対象の値
	 * @returns この時間の方が小さい場合は -1、等しい場合は 0、大きい場合は 1
	 */
	compareTo(val) {
		const thisMillis = val.#millis;
		const valMillis = val.#millis;
		if (thisMillis < valMillis) return -1;
		else if (thisMillis == valMillis) return 0;
		else return 1;
	}

	/**
	 * @param {Values=} values 各単位の量からなるオブジェクト
	 * @returns 時間の文字列表現
	 */
	static toString(values) {
		const millis = valuesToMillis(values);
		requireNonNegative(millis, "millis");

		const seconds = Math.floor(millis / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);

		const minutePart = minutes % 60;
		const secondPart = seconds % 60;
		const milliPart = millis % 1000;

		const belowMinuteString =
			zeroPadding(secondPart) +
			(milliPart != 0 ? "." + zeroPadding(milliPart, 3) : "");

		if (hours == 0) return minutePart + ":" + belowMinuteString;

		const days = Math.floor(hours / 24);
		const hourPart = hours % 24;
		const belowHourString = `${zeroPadding(minutePart)}:${belowMinuteString}`;

		if (days == 0) return hourPart + ":" + belowHourString;

		return days + ":" + zeroPadding(hourPart) + ":" + belowHourString;
	}

	toString() {
		return Timespan.toString({ millis: this.asMillis() });
	}
}

module.exports = Timespan;
