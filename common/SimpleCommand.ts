import {
	APIApplicationCommandOptionChoice,
	ApplicationCommandOptionWithChoicesAndAutocompleteMixin,
	CacheType,
	SharedSlashCommandOptions,
	SlashCommandBuilder,
} from 'discord.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../util/types';

type Value<T, Required extends boolean = boolean> = Required extends true
	? T
	: T | undefined;

type OptionValueMap<O extends Option<unknown>[]> = {
	[I in keyof O]: O[I] extends Option<infer T, infer Required>
		? Value<T, Required>
		: never;
};

interface SimpleCommandOptionData<T, Required extends boolean = boolean> {
	name: string;
	description: string;
	required: Required;
}

interface SimpleChoiceOptionData<T> {
	choices?: APIApplicationCommandOptionChoice<T>[];
	autocomplete?: boolean;
}

interface SimpleRangeOptionData {
	max_value?: number;
	min_value?: number;
}

interface SimpleIntegerOptionData<
	T extends number = number,
	Required extends boolean = boolean,
> extends SimpleCommandOptionData<T, Required>,
		SimpleRangeOptionData,
		SimpleChoiceOptionData<T> {}

interface SimpleStringOptionData<
	T extends string = string,
	Required extends boolean = boolean,
> extends SimpleCommandOptionData<T, Required>,
		SimpleChoiceOptionData<T> {
	max_length?: number;
	min_length?: number;
}

interface Option<T = unknown, Required extends boolean = boolean> {
	/** オプションの名前 */
	name: string;

	/** 必須のオプションか */
	required: Required;

	/**
	 * オプションの値を取得する。
	 * @param interaction コマンドのインタラクション
	 */
	get(interaction: ChatInputCommandInteraction): Value<T, Required>;
}

function setChoices<T extends string | number>(
	option: ApplicationCommandOptionWithChoicesAndAutocompleteMixin<T>,
	input: SimpleChoiceOptionData<T>,
) {
	const { choices, autocomplete } = input;
	if (choices != null) {
		option.addChoices(...choices);
	}
	if (autocomplete != null) {
		option.setAutocomplete(autocomplete);
	}
}

class IntegerOption<T extends number, Required extends boolean = boolean>
	implements Option<T, Required>
{
	name: string;

	required: Required;

	constructor(
		builder: SharedSlashCommandOptions,
		input: SimpleIntegerOptionData<T, Required>,
	) {
		const { name, required } = input;
		this.name = name;
		this.required = required;
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

	get(interaction: ChatInputCommandInteraction) {
		return this.required
			? (interaction.options.getInteger(this.name, true) as Value<T, Required>)
			: ((interaction.options.getInteger(this.name, false) ?? void 0) as Value<
					T,
					Required
				>);
	}
}

class StringOption<
	T extends string = string,
	Required extends boolean = boolean,
> implements Option<T, Required>
{
	name: string;

	required: Required;

	constructor(
		builder: SharedSlashCommandOptions,
		input: SimpleStringOptionData<T, Required>,
	) {
		this.name = input.name;
		this.required = input.required;
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

	get(interaction: ChatInputCommandInteraction) {
		return this.required
			? (interaction.options.getString(this.name, true) as Value<T, Required>)
			: (interaction.options.getString(this.name) as Value<T, Required>);
	}
}

/**
 * シンプルな SlashCommandBuilder(?)
 */
export class SimpleSlashCommandBuilder<
	Options extends Option<unknown, boolean>[] = [],
> {
	#name: string;

	#description: string;

	handle: SlashCommandBuilder;

	options: Options;

	constructor(
		name: string,
		description: string,
		handle: SlashCommandBuilder,
		options: Options,
	) {
		handle.setName(name);
		handle.setDescription(description);
		this.#name = name;
		this.#description = description;
		this.handle = handle;
		this.options = options;
	}

	/**
	 * @param name コマンドの名前
	 * @param description コマンドの説明文
	 */
	static create(
		name: string,
		description: string,
	): SimpleSlashCommandBuilder<[]> {
		return new SimpleSlashCommandBuilder(
			name,
			description,
			new SlashCommandBuilder(),
			[],
		);
	}

	addOption<T, Required extends boolean = false>(option: Option<T, Required>) {
		/** @type {[...Options, Option<T, Required>]} */
		const options: [...Options, Option<T, Required>] = [
			...this.options,
			option,
		];
		return new SimpleSlashCommandBuilder(
			this.#name,
			this.#description,
			this.handle,
			options,
		);
	}

	addIntegerOption<T extends number, Required extends boolean = boolean>(
		input: SimpleIntegerOptionData<T, Required>,
	) {
		return this.addOption(new IntegerOption(this.handle, input));
	}

	addStringOption<T extends string, Required extends boolean = boolean>(
		input: SimpleStringOptionData<T, Required>,
	) {
		return this.addOption(new StringOption(this.handle, input));
	}

	build(
		action: (
			interaction: ChatInputCommandInteraction,
			...options: OptionValueMap<Options>
		) => Promise<void>,
	) {
		return new SimpleCommand(this, action);
	}
}

export class SimpleCommand<Options extends Option<unknown, boolean>[]>
	implements Command
{
	action: (
		interaction: ChatInputCommandInteraction<CacheType>,
		...options: OptionValueMap<Options>
	) => Promise<void>;

	builder: SimpleSlashCommandBuilder<Options>;

	data: any;

	constructor(
		builder: SimpleSlashCommandBuilder<Options>,
		action: (
			interaction: ChatInputCommandInteraction,
			...options: OptionValueMap<Options>
		) => Promise<void>,
	) {
		this.builder = builder;
		this.data = builder.handle;
		this.action = action;
	}

	/**
	 * @param {ChatInputCommandInteraction} interaction コマンドのインタラクション
	 */
	async execute(interaction: ChatInputCommandInteraction) {
		const optionValues = this.builder.options.map((option) =>
			option.get(interaction),
		) as OptionValueMap<Options>;
		await this.action(interaction, ...optionValues);
	}
}
