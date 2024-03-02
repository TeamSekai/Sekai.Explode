/**
 * @typedef {Object} FormatTableOption
 * @property {string=} fillString 列を同じ幅にするために余白を埋める文字
 * @property {string=} margin 列の間のスペース文字
 * @property {('left' | 'right')[]=} align 各列について文字をどちら側に寄せるか
 */

/**
 * 二次元配列を表形式の文字列に変換する。
 * @param {string[][]} table 二次元配列
 * @param {FormatTableOption} options オプション
 */
function formatTable(table, options = {}) {
	table = table.map((row) => row.map((cell) => String(cell)));
	const /** @type {number[]} */ maxWidths = [];
	for (const row of table) {
		const length = row.length;
		for (let j = 0; j < length; j++) {
			const maxWidth = maxWidths[j];
			const width = row[j].length;
			if (!maxWidth || width > maxWidth) {
				maxWidths[j] = width;
			}
		}
	}
	const padding = options.fillString ?? " ";
	const margin = options.margin ?? " ";
	const align = options.align ?? [];
	return table
		.map((value) => {
			const last = value.length - 1;
			return value
				.map((e, i) => {
					switch (align[i]) {
						default:
						case "left":
							if (i == last) {
								return e;
							}
							return e.padEnd(maxWidths[i], padding);
						case "right":
							return e.padStart(maxWidths[i], padding);
					}
				})
				.join(margin);
		})
		.join("\n");
}

module.exports = { formatTable };
