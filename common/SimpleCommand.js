// @ts-check

const { SlashCommandBuilder } = require('discord.js');

/**
 * @typedef {import('../util/types').Command} Command
 */

/**
 * @typedef {import('discord.js').ChatInputCommandInteraction} ChatInputCommandInteraction
 */

/**
 * @template {Function} F
 * @typedef {F extends (arg: infer T) => unknown ? T : never} FirstParameter
 */

/**
 * @template {Option<unknown, boolean>[]} Options
 * @typedef {unknown[] & {
 *     [I in number]: Options[I] extends Option<infer T, infer Required>
 *         ? Required extends true ? T : T | null
 *         : never
 * }} OptionValues
 */

/**
 * @template {unknown} [T = unknown]
 * @template {boolean} [Required = false]
 */
class Option {
	name;

	#required;

	/**
	 * @param {import('discord.js').SharedSlashCommandOptions} builder オプションの Builder
	 * @param {(builder: import('discord.js').SharedSlashCommandOptions) => void} addOption Builder にオプションを追加する関数
	 */
	constructor(builder, addOption) {
		const index = builder.options.length;
		addOption(builder);
		const json = builder.options[index].toJSON();
		this.name = json.name;
		this.#required = /** @type {Required} */ (json.required);
	}

	/**
	 * オプションの値を取得する。
	 * @param {ChatInputCommandInteraction} _interaction コマンドのインタラクション
	 * @returns {Required extends true ? T : T | null}
	 */
	get(_interaction) {
		throw new Error('Not implemented');
	}

	/**
	 * 必須のオプションか
	 * @returns {this is Option<T, true>}
	 */
	isRequired() {
		return this.#required;
	}
}

/**
 * @typedef {FirstParameter<typeof import('discord.js').SharedSlashCommandOptions.prototype.addBooleanOption>} BooleanOptionInput
 */

/**
 * @template {boolean} [Required = false]
 * @extends {Option<boolean, Required>}
 */
class BooleanOption extends Option {
	/**
	 * @param {import('discord.js').SharedSlashCommandOptions} builder
	 * @param {BooleanOptionInput} input
	 */
	constructor(builder, input) {
		super(builder, (builder) => builder.addBooleanOption(input));
	}

	/**
	 * @param {ChatInputCommandInteraction} interaction
	 */
	get(interaction) {
		if (this.isRequired()) {
			return interaction.options.getBoolean(this.name, true);
		} else {
			return interaction.options.getBoolean(this.name);
		}
	}
}

/**
 * シンプルな SlashCommandBuilder(?)
 * @template {Option<unknown, boolean>[]} [Options = []]
 */
class SimpleSlashCommandBuilder {
	#name;

	#description;

	handle;

	/**
	 * @type {Options}
	 */
	options;

	/**
	 * @param {string} name
	 * @param {string} description
	 * @param {Options} options
	 */
	constructor(name, description, options) {
		const handle = new SlashCommandBuilder();
		handle.setName(name);
		handle.setDescription(description);
		this.#name = name;
		this.#description = description;
		this.handle = handle;
		this.options = options;
	}

	/**
	 * @param {string} name コマンドの名前
	 * @param {string} description コマンドの説明文
	 */
	static create(name, description) {
		return new SimpleSlashCommandBuilder(name, description, []);
	}

	/**
	 * @template {boolean} [Required = false]
	 * @param {BooleanOptionInput} input
	 * @returns
	 */
	addBooleanOption(input) {
		/** @type {[...Options, BooleanOption<Required>]} */
		const options = [...this.options, new BooleanOption(this.handle, input)];
		return new SimpleSlashCommandBuilder(
			this.#name,
			this.#description,
			options,
		);
	}
}

/**
 * @template {Option<unknown, boolean>[]} [Options = []]
 * @implements {Command}
 */
class SimpleCommand {
	action;

	builder;

	/**
	 *
	 * @param {SimpleSlashCommandBuilder<Options>} builder
	 * @param {(
	 *     interaction: ChatInputCommandInteraction,
	 *     ...options: OptionValues<Options>
	 * ) => Promise<void>} action
	 */
	constructor(builder, action) {
		this.builder = builder;
		this.data = builder.handle;
		this.action = action;
	}

	/**
	 * @param {ChatInputCommandInteraction} interaction コマンドのインタラクション
	 */
	async execute(interaction) {
		const optionValues = /** @type {OptionValues<Options>} */ (
			this.builder.options.map((option) => option.get(interaction))
		);
		await this.action(interaction, ...optionValues);
	}
}

module.exports = {
	SimpleSlashCommandBuilder,
	SimpleCommand,
};
