// Import https library
import fetch from "node-fetch";

// Export hook class
export class Hook {

	// Initialize private class members
	#url = null;
	#name = null;
	#icon = null;

	/**
	 * Creates a new webhook instance.
	 * @param url URL
	 */
	constructor(url, name = "Matterbot", icon = null) {
		this.#url = url;
		this.#name = name;
		this.#icon = icon;
	}

	/**
	 * Sends a message
	 * @param message Message
	 */
	async send(message, channel = "town-square") {
		// Create payload
		let payload = {
			text: message,
			channel: channel
		};

		// Append more things to the payload
		if (this.#name !== null)
			payload.username = this.#name;
		if (this.#icon !== null)
			payload.icon_url = this.#icon;

		// Send request
		await fetch(this.#url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(payload)
		});
	}
};