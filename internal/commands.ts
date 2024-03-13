import { strFormat, LANG } from '../util/languages';
import { ChatInputCommandInteraction, Client } from 'discord.js';
import { Command } from '../util/types';

export class CommandManager {
	static readonly default = new CommandManager();

	#client: Client<true> | null = null;

	#commands: Map<string, Command> = new Map();

	/**
	 * クライアントにコマンドを登録する。
	 * @param client ログイン済みのクライアント
	 */
	async setClient(client: Client<true>) {
		this.#client = client;
		const commands = [];
		for (const command of this.#commands.values()) {
			commands.push(command.data.toJSON());
		}
		await client.application.commands.set(commands);
		client.on('interactionCreate', (interaction) => {
			if (interaction.isChatInputCommand()) {
				this.#handleInteraction(interaction, client);
			}
		});
	}

	/**
	 * コマンドを追加する。
	 * @param commands 追加するコマンド
	 */
	addCommands(commands: Command | Command[]) {
		if (Array.isArray(commands)) {
			for (const command of commands) {
				this.#commands.set(command.data.name, command);
			}
		} else {
			this.#commands.set(commands.data.name, commands);
		}
	}

	get size() {
		return this.#commands.size;
	}

	/**
	 * コマンドの処理を行う。
	 */
	async #handleInteraction(
		interaction: ChatInputCommandInteraction,
		client: Client<true>,
	) {
		const command = this.#commands.get(interaction.commandName);
		if (!command) {
			console.error(
				strFormat(LANG.discordbot.interactionCreate.unsupportedCommandError, [
					interaction.commandName,
				]),
			);
			return;
		}
		try {
			await command.execute(interaction, client);
		} catch (error) {
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					content: LANG.discordbot.interactionCreate.commandError,
					ephemeral: true,
				});
			} else {
				await interaction.reply({
					content: LANG.discordbot.interactionCreate.commandError,
					ephemeral: true,
				});
			}
			throw error;
		}
	}
}
