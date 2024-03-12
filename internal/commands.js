// @ts-check

const { strFormat, LANG } = require('../util/languages');

/**
 * @template {boolean} [Ready = boolean]
 * @typedef {import('discord.js').Client<Ready>} Client
 */

/**
 * @typedef {import('../util/types').Command} Command
 */

class CommandManager {
	/**
	 * @readonly
	 */
	static default = new CommandManager();

	/** @type {import('discord.js').Client<true> | null} */
	#client = null;

	/** @type {Map<string, Command>} */
	#commands = new Map();

	/**
	 * クライアントにコマンドを登録する。
	 * @param {Client<true>} client ログイン済みのクライアント
	 */
	async setClient(client) {
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
	 * @param {Command | Command[]} commands 追加するコマンド
	 */
	addCommands(commands) {
		if (Array.isArray(commands)) {
			for (const command of commands) {
				this.#commands.set(command.data.name, command);
			}
		} else {
			this.#commands.set(commands.data.name, commands);
		}
	}

	get client() {
		return this.client;
	}

	get size() {
		return this.#commands.size;
	}

	/**
	 * コマンドの処理を行う。
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {Client<true>} client
	 */
	async #handleInteraction(interaction, client) {
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

module.exports = { CommandManager };
