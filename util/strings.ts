export interface FormatTableOption {
	/** 列を同じ幅にするために余白を埋める文字 */
	fillString?: string;

	/** 列の間のスペース文字 */
	margin?: string;

	/** 各列について文字をどちら側に寄せるか */
	align?: ('left' | 'right')[];
}

/**
 * 二次元配列を表形式の文字列に変換する。
 * @param table 二次元配列
 * @param options オプション
 */
export function formatTable(
	table: unknown[][],
	options: FormatTableOption = {},
) {
	const stringTable = table.map((row) => row.map((cell) => String(cell)));
	const /** @type {number[]} */ maxWidths: number[] = [];
	for (const row of stringTable) {
		const length = row.length;
		for (let j = 0; j < length; j++) {
			const maxWidth = maxWidths[j];
			const width = row[j].length;
			if (!maxWidth || width > maxWidth) {
				maxWidths[j] = width;
			}
		}
	}
	const padding = options.fillString ?? ' ';
	const margin = options.margin ?? ' ';
	const align = options.align ?? [];
	return stringTable
		.map((value) => {
			const last = value.length - 1;
			return value
				.map((e, i) => {
					switch (align[i]) {
						default:
						case 'left':
							if (i == last) {
								return e;
							}
							return e.padEnd(maxWidths[i], padding);
						case 'right':
							return e.padStart(maxWidths[i], padding);
					}
				})
				.join(margin);
		})
		.join('\n');
}
