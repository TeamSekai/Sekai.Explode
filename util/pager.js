const {
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} = require('discord.js');
const { strFormat, LANG } = require('./languages');

/**
 * @typedef {Object} OptionSet Pager のコンストラクタに渡すことができるオプション
 * @property {number} pageLength 1ページに含まれる最大のアイテム数
 * @property {string | null | ((pager: Pager) => string | null)} title 埋め込みのタイトルまたはそれを得る関数
 * @property {import('discord.js').ColorResolvable | null | ((pager: Pager) => import("discord.js").ColorResolvable | null)} color 埋め込みの色またはそれを得る関数
 * @property {string | ((pager: Pager) => string)} fieldName フィールドの名前
 * @property {string} emptyMessage リストが空の場合に表示する説明文
 * @property {string} delimiter リストの区切り文字
 * @property {import('discord.js').EmbedFooterOptions | null | ((pager: Pager) => import("discord.js").EmbedFooterOptions | null)} footer 埋め込みのフッターまたはそれを得る関数
 * @property {ButtonBuilder} prevButton 前のページへ移動するボタン
 * @property {ButtonBuilder} nextButton 次のページへ移動するボタン
 * @property {number} idleTime ボタンを無効化するまでの時間
 */

/**
 * オブジェクトが関数である場合、引数を渡して結果を返し、そうでなければオブジェクトをそのまま返す。
 * @template T 引数の型
 * @template R 結果の型
 * @param {R | T => R} obj 関数かもしれないオブジェクト
 * @param  {T} args 関数の場合に渡す引数
 * @returns {R} 結果の値
 */
function callIfFunciton(obj, ...args) {
	if (obj instanceof Function) {
		return obj.apply(null, args);
	}
	return obj;
}

/**
 * リストをページに分けてを扱うクラス。
 */
class Pager {
	/**
	 * @type {string[]}
	 */
	#items;

	/**
	 * @type {number}
	 */
	#pageCount;

	/**
	 * @type {OptionSet}
	 */
	#options = {
		pageLength: 10,
		title(pager) {
			return strFormat(LANG.util.pager.defaults.title, [pager.items.length]);
		},
		color: null,
		fieldName: null,
		emptyMessage: LANG.util.pager.defaults.emptyMessage,
		delimiter: '\n',
		footer(pager) {
			if (pager.isEmpty()) {
				return null;
			}
			return {
				text: strFormat(LANG.util.pager.defaults.footer, {
					page: pager.page + 1,
					pageCount: pager.pageCount,
					length: pager.items.length,
					start: pager.start,
					end: pager.end,
				}),
			};
		},
		prevButton: new ButtonBuilder()
			.setCustomId('prev')
			.setLabel(LANG.util.pager.defaults.prevButton)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji('⬅️'),
		nextButton: new ButtonBuilder()
			.setCustomId('next')
			.setLabel(LANG.util.pager.defaults.nextButton)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji('➡️'),
		idleTime: 60000,
	};

	/**
	 * @type {number}
	 */
	#currentPage;

	/**
	 * @type {string[]}
	 */
	#currentPageItems;

	#embedBuilder = new EmbedBuilder();

	/**
	 * @type {{ embeds: EmbedBuilder[], components: ActionRowBuilder<import("discord.js").AnyComponentBuilder> }}
	 */
	#reply;

	/**
	 * 新しく Pager を生成する。
	 * @param {string[]} items アイテムの配列
	 * @param {Partial<OptionSet>=} options オプション
	 */
	constructor(items, options = {}) {
		Object.assign(this.#options, options);
		this.#items = Object.freeze([...items]); // 変更されないように配列をコピーしてfreeze
		this.#pageCount = Math.ceil(this.#items.length / this.#options.pageLength);
		this.page = 0;
		this.#reply = {
			embeds: [this.#embedBuilder],
		};
		if (this.pageCount > 1) {
			this.#reply.components = [
				new ActionRowBuilder().addComponents(
					this.#options.prevButton,
					this.#options.nextButton,
				),
			];
		}
	}

	/**
	 * リストのアイテムからなる配列。
	 */
	get items() {
		return this.#items;
	}

	/**
	 * 1ページに含まれる最大のアイテム数。
	 */
	get pageLength() {
		return this.#options.pageLength;
	}

	/**
	 * 全体のページ数。
	 */
	get pageCount() {
		return this.#pageCount;
	}

	/**
	 * 現在のページ番号 (0 始まり)。
	 * @type {number}
	 */
	get page() {
		return this.#currentPage;
	}

	set page(value) {
		const pageOffset = value % this.#pageCount;
		this.#currentPage =
			pageOffset >= 0 ? pageOffset : this.#pageCount + pageOffset;
		this.#currentPageItems = Object.freeze(
			this.#items.slice(this.start, this.end),
		);
		const embedBuilder = this.#embedBuilder;
		const fieldName = this.getFieldName();
		const description = this.getDescription();
		embedBuilder.setTitle(this.getTitle());
		embedBuilder.setColor(this.getColor());
		if (fieldName == null) {
			embedBuilder.setDescription(description);
		} else {
			embedBuilder.setFields([
				{
					name: fieldName,
					value: description,
				},
			]);
		}
		embedBuilder.setFooter(this.getFooter());
	}

	/**
	 * 作成された EmbedBuilder。
	 */
	get embedBuilder() {
		return this.#embedBuilder;
	}

	/**
	 * ページの最初のアイテムの添字
	 */
	get start() {
		return this.#currentPage * this.#options.pageLength;
	}

	/**
	 * ページの最後のアイテムの添字 + 1
	 */
	get end() {
		return Math.min(
			(this.#currentPage + 1) * this.#options.pageLength,
			this.#items.length,
		);
	}

	/**
	 * @returns 現在のページのアイテムのリスト
	 */
	get pageItems() {
		return this.#currentPageItems;
	}

	isEmpty() {
		return this.#items.length == 0;
	}

	/**
	 * 埋め込みのタイトルを取得する。
	 * @returns タイトル
	 */
	getTitle() {
		return callIfFunciton(this.#options.title, this);
	}

	/**
	 * 埋め込みの色を取得する。
	 * @returns 色
	 */
	getColor() {
		return callIfFunciton(this.#options.color, this);
	}

	/**
	 * 埋め込みのフィールドの名前を取得する。
	 * @returns フィールドの名前
	 */
	getFieldName() {
		return callIfFunciton(this.#options.fieldName, this);
	}

	/**
	 * 埋め込みの説明文を取得する。
	 * @returns 説明文
	 */
	getDescription() {
		if (this.isEmpty()) {
			return this.#options.emptyMessage;
		}
		return this.#currentPageItems.join(this.#options.delimiter);
	}

	/**
	 * 埋め込みのフッターを取得する。
	 * @returns {import("discord.js").EmbedFooterOptions} フッター
	 */
	getFooter() {
		return callIfFunciton(this.#options.footer, this);
	}

	/**
	 * この Pager をリプライとして表示する。
	 * @param {import("discord.js").RepliableInteraction} interaction 対話オブジェクト
	 */
	async replyTo(interaction) {
		if (!interaction.isRepliable()) {
			throw new TypeError(`Cannot reply to interaction: ${interaction}`);
		}
		if (interaction.deferred || interaction.replied) {
			await interaction.editReply(this.#reply);
		} else {
			await interaction.reply(this.#reply);
		}
		const message = await interaction.fetchReply();

		const collector = message.createMessageComponentCollector({
			idle: this.#options.idleTime,
		});

		collector.on('collect', (interaction) => {
			interaction.deferUpdate();
			if (interaction.customId == this.#options.prevButton.data.custom_id) {
				this.page--;
			} else if (
				interaction.customId == this.#options.nextButton.data.custom_id
			) {
				this.page++;
			}
			message.edit(this.#reply);
		});

		collector.on('end', () => {
			interaction.editReply({
				components: [],
			});
		});
	}
}

module.exports = Pager;
