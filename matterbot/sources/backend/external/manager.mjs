// Import bot
import { Bot } from "./bot.mjs";

// Bot manager class
export class Manager {

	// Bot instance object
	static #bots = {};

	// Credentials object
	static #credentials = null;

	/**
	 * Initializes the bot manager
	 * @param credentials Authentication credentials (hostname, username [email], password)
	 */
	static initialize(credentials = {}) {
		// Initializes the credentials object
		Manager.#credentials = credentials;
	}

	/**
	 * Create a bot for a given team
	 * @param teamname Team name
	 */
	static create(teamname) {
		// Make sure bot does not exist
		if (Manager.#bots.hasOwnProperty(teamname))
			throw new Error("Bot already exists");

		// Create bot
		Manager.#bots[teamname] = new Bot(teamname, Manager.#credentials);
	}

	/**
	 * Sends messages to tree
	 * @param message Message to send
	 * @param tree Tree of teams, clients and channels to send the message to
	 * @param exceptions Throw exceptions or continue quietly
	 */
	static deliver(message, tree, exceptions = true) {
		if (message.length === 0)
			throw new Error("Message is empty");

		// Loop over tree
		for (let teamname in tree) {
			// Make sure a bot for this team exists
			if (!Manager.#bots.hasOwnProperty(teamname))
				if (exceptions)
					throw new Error("Team does not exist");
				else
					continue;

			// Convert to target list
			let targets = [];

			// Check whether there are clients
			if (tree[teamname].hasOwnProperty("clients")) {
				for (let client in tree[teamname].clients) {
					targets.push({
						type: "client",
						name: client
					});
				}
			}
			// Check whether there are channels
			if (tree[teamname].hasOwnProperty("channels")) {
				for (let channel in tree[teamname].channels) {
					targets.push({
						type: "channel",
						name: channel
					});
				}
			}

			// Try sending messages
			Manager.#bots[teamname].send(message, targets, exceptions);
		}
	}
};