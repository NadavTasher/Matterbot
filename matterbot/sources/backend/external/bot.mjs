// Import mattermost bot client
import Client from "mattermost-client";

// Bot wrapper
export class Bot {

	// Mattermost client instance
	#client = null;

	/**
	 * Initializes the bot instance
	 * @param teamname Team name
	 * @param credentials Credentials for Bot authentication
	 */
	constructor(teamname, credentials = {}) {
		// Make sure credentials exist
		if (!credentials.hasOwnProperty("hostname"))
			throw new Error("Missing hostname property");
		if (!credentials.hasOwnProperty("username"))
			throw new Error("Missing username property");
		if (!credentials.hasOwnProperty("password"))
			throw new Error("Missing password property");

		// Initialize client
		this.#client = new Client(credentials.hostname, teamname, {});

		// Login with client
		this.#client.login(credentials.username, credentials.password, null);
	}

	/**
	 * Sends messages to targets
	 * @param message Message to send
	 * @param targets Targets to message
	 * @param exceptions Throw exceptions or continue quietly
	 */
	send(message, targets = [], exceptions = true) {
		// Check message length
		if (message.length === 0)
			throw new Error("Message is empty");

		// Find channel IDs
		for (let target of targets) {
			// Make sure type exists
			if (!target.hasOwnProperty("type"))
				throw new Error("Missing type property in target");
			if (!target.hasOwnProperty("name"))
				throw new Error("Missing name property in target");

			// Check target type
			if (target.type === "user") {
				// Find user
				let user = this.#client.getUserByEmail(target.name);

				// Make sure user exists
				if (user === null)
					if (exceptions)
						throw new Error("User does not exist");
					else
						continue;

				// Create direct channel
				this.#client.createDirectChannel(user.id, (channel) => {
					// Send message
					this.#client.postMessage(message, channel.id);
				});
			} else if (target.type === "channel") {
				// Find channel
				let channel = this.#client.findChannelByName(target.name);

				// Make sure channel exists
				if (channel === null)
					if (exceptions)
						throw new Error("Channel does not exist");
					else
						continue;

				// Send message
				this.#client.postMessage(message, channel.id);
			}
		}
	}
};