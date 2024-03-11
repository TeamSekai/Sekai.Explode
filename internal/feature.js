// @ts-check

class Feature {
	/**
	 * @readonly
	 */
	#commands;

	/**
	 * @param {import('../util/types').Command[]} commands
	 */
	constructor(commands) {
		this.#commands = commands;
	}

	/**
	 * @returns {import('../util/types').Command[]}
	 */
	get commands() {
		return this.#commands;
	}
}

module.exports = { Feature };
