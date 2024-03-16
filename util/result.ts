/**
 * 正常な処理結果。
 */
export class Ok<T> {
	readonly status = 'ok';

	readonly value: T;

	constructor(value: T) {
		this.value = value;
	}
}

/**
 * 処理中のエラー。
 */
export class Err<E> {
	readonly status = 'err';

	readonly value: E;

	constructor(value: E) {
		this.value = value;
	}
}

export type Result<T, E = any> = Ok<T> | Err<E>;
