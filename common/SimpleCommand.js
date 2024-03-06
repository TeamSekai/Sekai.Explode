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
 * @template {unknown} T
 * @template {boolean} [Required = boolean]
 * @typedef {Required extends true ? T : T | undefined} Value
 */

/**
 * @template {Option<unknown>[]} O
 * @typedef {({
 *     [I in keyof O]: O[I] extends Option<infer T, infer Required> ? Value<T, Required> : never
 * })} OptionValueMap
 */

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
 * @template {string} [T = string]
 * @template {boolean} [Required = boolean]
 * @typedef {(
 *     SimpleCommandOptionData<T, Required> &
 *     SimpleChoiceOptionData<T> &
 *     {
 *         max_length?: number;
 *         min_length?: number;
 *     }
 * )} SimpleStringOptionData
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
 * @template {string | number} T
 * @param {import('discord.js').ApplicationCommandOptionWithChoicesAndAutocompleteMixin<T>} option
 * @param {SimpleChoiceOptionData<T>} input
 */
function setChoices(option, input) {
	const { choices, autocomplete } = input;
	if (choices != null) {
		option.addChoices(...choices);
	}
	if (autocomplete != null) {
		option.setAutocomplete(autocomplete);
	}
}

/**
 * @template {number} T
 * @template {boolean} [Required = boolean]
 * @extends {Option<T, Required>}
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
			const { max_value, min_value } = input;
			setChoices(option, input);
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
 * @template {string} [T = string]
 * @template {boolean} [Required = boolean]
 * @extends {Option<T, Required>}
 */
class StringOption extends Option {
	/**
	 * @param {import('discord.js').SharedSlashCommandOptions} builder
	 * @param {SimpleStringOptionData<T, Required>} input
	 */
	constructor(builder, input) {
		super(input.name, input.required);
		builder.addStringOption((option) => {
			option
				.setName(input.name)
				.setDescription(input.description)
				.setRequired(input.required);
			setChoices(option, input);
			const { max_length, min_length } = input;
			if (max_length != null) {
				option.setMaxLength(max_length);
			}
			if (min_length != null) {
				option.setMinLength(min_length);
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
					interaction.options.getString(this.name, true)
				)
			: /** @type {Value<T, Required>} */ (
					interaction.options.getString(this.name)
				);
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
	 * @template {unknown} T
	 * @template {boolean} [Required = false]
	 * @param {Option<T, Required>} option
	 */
	addOption(option) {
		/** @type {[...Options, Option<T, Required>]} */
		const options = [...this.options, option];
		return new SimpleSlashCommandBuilder(
			this.#name,
			this.#description,
			this.handle,
			options,
		);
	}

	/**
	 * @template {number} T
	 * @template {boolean} [Required = boolean]
	 * @param {SimpleIntegerOptionData<T, Required>} input
	 */
	addIntegerOption(input) {
		return this.addOption(new IntegerOption(this.handle, input));
	}

	/**
	 * @template {string} T
	 * @template {boolean} [Required = boolean]
	 * @param {SimpleStringOptionData<T, Required>} input
	 * @returns
	 */
	addStringOption(input) {
		return this.addOption(new StringOption(this.handle, input));
	}

	/**
	 * @param {(
	 *     interaction: ChatInputCommandInteraction,
	 *     ...options: OptionValueMap<Options>
	 * ) => Promise<void>} action
	 */
	build(action) {
		return new SimpleCommand(this, action);
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
	 *     ...options: OptionValueMap<Options>
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
		const optionValues = /** @type {OptionValueMap<Options>} */ (
			this.builder.options.map((option) => option.get(interaction))
		);
		await this.action(interaction, ...optionValues);
	}
}

module.exports = {
	SimpleSlashCommandBuilder,
	SimpleCommand,
};
