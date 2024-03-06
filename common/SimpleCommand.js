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
 * @template {Option<unknown, boolean>} O
 * @typedef {(
 *     O extends IntegerOption<infer Required> ? (Required extends true ? number : number | undefined) :
 *     never
 * )} OptionValue
 */

/**
 * @template {Option<unknown, boolean>[]} Options
 * @typedef {{
 *     [I in keyof Options]: Options[I] extends Option<unknown, boolean> ? OptionValue<Options[I]> : never
 * }} OptionValues
 */

/**
 * @template {unknown} T
 * @template {boolean} [Required = boolean]
 * @typedef {Required extends true ? T : T | undefined} Value
 */

/**
 * @template {unknown} [T = unknown]
 * @template {boolean} [Required = boolean]
 */
class Option {
	name;

	required;

	/**
	 * @param {string} name オプションの名前
	 * @param {Required} required 必須のオプションか
	 */
	constructor(name, required) {
		this.name = name;
		this.required = required;
	}

	/**
	 * オプションの値を取得する。
	 * @abstract
	 * @param {ChatInputCommandInteraction} _interaction コマンドのインタラクション
	 * @returns {Value<T, Required>}
	 */
	get(_interaction) {
		throw new Error('Not implemented');
	}
}

/**
 * @typedef {FirstParameter<typeof import('discord.js').SharedSlashCommandOptions.prototype.addIntegerOption>} IntegerOptionInput
 */

/**
 * @template {number} T
 * @template {boolean} [Required = boolean]
 * @extends {Option<number, Required>}
 */
class IntegerOption extends Option {
	/**
	 * @param {import('discord.js').SharedSlashCommandOptions} builder
	 * @param {SimpleIntegerOptionData<T, Required>} input
	 */
	constructor(builder, input) {
		const { name, required } = input;
		super(name, required);
		builder.addIntegerOption((option) => {
			option
				.setName(name)
				.setDescription(input.description)
				.setRequired(required);
			const { choices, autocomplete, max_value, min_value } = input;
			if (choices != null) {
				option.setChoices(...choices);
			}
			if (autocomplete != null) {
				option.setAutocomplete(autocomplete);
			}
			if (max_value != null) {
				option.setMaxValue(max_value);
			}
			if (min_value != null) {
				option.setMinValue(min_value);
			}
			return option;
		});
	}

	/**
	 * @override
	 * @param {ChatInputCommandInteraction} interaction
	 */
	get(interaction) {
		return this.required
			? /** @type {Value<T, Required>} */ (
					interaction.options.getInteger(this.name, true)
				)
			: /** @type {Value<T, Required>} */ (
					interaction.options.getInteger(this.name, false) ?? void 0
				);
	}
}

/**
 * @template {unknown} T
 * @template {boolean} [Required = boolean]
 * @typedef {Object} SimpleCommandOptionData
 * @property {string} name
 * @property {string} description
 * @property {Required} required
 */

/**
 * @template {unknown} T
 * @typedef {Object} SimpleChoiceOptionData
 * @property {import('discord.js').APIApplicationCommandOptionChoice<T>[]=} choices
 * @property {boolean=} autocomplete
 */

/**
 * @typedef {Object} SimpleRangeOptionData
 * @property {number=} max_value
 * @property {number=} min_value
 */

/**
 * @template {number} [T = number]
 * @template {boolean} [Required = boolean]
 * @typedef {(
 *     SimpleCommandOptionData<T, Required> &
 *     SimpleRangeOptionData &
 *     SimpleChoiceOptionData<T>
 * )} SimpleIntegerOptionData
 */

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
	 * @param {SlashCommandBuilder} handle
	 * @param {Options} options
	 */
	constructor(name, description, handle, options) {
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
	 * @returns {SimpleSlashCommandBuilder<[]>}
	 */
	static create(name, description) {
		return new SimpleSlashCommandBuilder(
			name,
			description,
			new SlashCommandBuilder(),
			[],
		);
	}

	/**
	 * @template {number} T
	 * @template {boolean} [Required = false]
	 * @param {SimpleIntegerOptionData<T, Required>} input
	 * @returns
	 */
	addIntegerOption(input) {
		/** @type {[...Options, IntegerOption<T, Required>]} */
		const options = [...this.options, new IntegerOption(this.handle, input)];
		return new SimpleSlashCommandBuilder(
			this.#name,
			this.#description,
			this.handle,
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
