// Import bot
import { Client } from "./client.mjs";
import { Validator } from "../internal/utilities.mjs";

// Bot manager class
export class Bot {

	/**
	 * Sends messages
	 * @param message Message to send
	 * @param recipients Recipients to send the message
	 * @param exceptions Throw exceptions or continue quietly
	 */
	static async deliver(message, recipients, exceptions = true) {
		if (message.length === 0)
			throw new Error("Message is empty");

		// Loop over clients
		if (Validator.valid(recipients, {
			users: "array"
		})) {
			for (let user of recipients.users) {
				if (exceptions) {
					await Client.send(message, user);
				} else {
					Client.send(message, user).then().catch();
				}
			}
		}

		// Loop over channels
		if (Validator.valid(recipients, {
			channels: "object"
		})) {
			for (let team in recipients.channels) {
				for (let channel of recipients.channels[team]) {
					if (exceptions) {
						await Client.dispatch(message, team, channel);
					} else {
						Client.dispatch(message, team, channel).then().catch();
					}
				}
			}
		}
	}
};