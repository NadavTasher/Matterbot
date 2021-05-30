// Import node-fetch
import fetch from "node-fetch";

/**
 * Mattermost client class
 */
export class Client {

	// Initial team object
	static #tree = {};
	static #users = {};

	// User input parameters
	static #hostname = null;
	static #username = null;
	static #password = null;

	// Derrived parameters
	static #userID = null;
	static #userToken = null;

	/**
	 * Logs in and fetches a token
	 * @param hostname Mattermost hostname
	 * @param username Mattermost username
	 * @param password Mattermost password
	 */
	static async login(hostname, username, password) {
		// Set parameters
		Client.#hostname = hostname;
		Client.#username = username;
		Client.#password = password;

		// Delete token
		Client.#userToken = null;

		// Login with API call
		let userInformation = await Client.#call("users/login", {}, {
			login_id: Client.#username,
			password: Client.#password,
		});

		// Parse user information
		Client.#userID = userInformation.id;

		// Get teams and create member tree
		Client.#teams();
	}

	/**
	 * Sends a message to a specific user
	 * @param message Message
	 * @param email User email
	 */
	static async send(message, email) {
		// Make sure user exists
		if (!Client.#users.hasOwnProperty(email))
			// Return failure
			throw new Error("User does not exist");

		// Create channel
		const channel = await Client.#call(`channels/direct`, {}, [
			Client.#userID,
			Client.#users[email]
		]);

		// Send request
		await Client.#call(`posts`, {}, {
			channel_id: channel.id,
			message: message
		});
	}

	/**
	 * Dispatches a message to a specific channel of a team
	 * @param message Message
	 * @param team Team name
	 * @param channel Channel name
	 */
	static async dispatch(message, team, channel) {
		// Make sure team exists
		if (!Client.#tree.hasOwnProperty(team))
			// Return failure
			throw new Error("Team does not exist");

		// Make sure channel exists
		if (!Client.#tree[team].channels.hasOwnProperty(channel))
			// Return failure
			throw new Error("Channel does not exist");

		// Send request
		await Client.#call(`posts`, {}, {
			channel_id: Client.#tree[team].channels[channel],
			message: message
		});
	}

	/**
	 * Indexes a specific team
	 * @param teamID Team ID
	 * @param teamName Team Name
	 */
	static async #team(teamID, teamName) {
		// Load team channels
		const channels = await Client.#call(`users/${Client.#userID}/teams/${teamID}/channels`);

		// Loop over channels and add to tree
		for (let channel of channels) {
			// Make sure channel is of this team
			if (channel.team_id === teamID)
				// Add to tree
				Client.#tree[teamName].channels[channel.name] = channel.id;
		}

		// Load team users
		let pageIndex = 0, lastCount = 0;

		// Load all users
		do {
			// Get users
			const users = await Client.#call(`teams/${teamID}/members`, {
				page: pageIndex,
				per_page: 100
			});

			// Loop over users and add to tree
			for (let user of users) {
				// Get user information
				let information = await Client.#call(`users/${user.user_id}`);

				// Add to tree
				Client.#tree[teamName].users[information.email] = user.user_id;

				// Add to users
				Client.#users[information.email] = user.user_id;
			}

			// Increment page index
			++pageIndex;

			// Update last count
			lastCount = users.length;
		} while (lastCount > 0);
	}

	/**
	 * Finds and indexes teams
	 */
	static async #teams() {
		// Get list of teams
		const listTeams = await Client.#call(`users/${Client.#userID}/teams`);

		// Loop for each team and add to list
		for (let team of listTeams) {
			// Update in tree
			Client.#tree[team.name] = {
				id: team.id,
				users: [],
				channels: []
			};

			// Update team with new information
			Client.#team(team.id, team.name);
		}
	}

	/**
	 * Executes API calls
	 * @param endpoint API endpoint
	 * @param parameters Query parameters
	 * @param data Request data
	 */
	static async #call(endpoint, parameters = {}, data = undefined) {
		// Create URL
		const url = `https://${Client.#hostname}/api/v4/${endpoint}?${new URLSearchParams(parameters).toString()}`;

		// Create options
		const options = {
			method: data ? "POST" : "GET",
			body: data ? JSON.stringify(data) : undefined,
			headers: {
				"Content-Type": "application/json",
				"Authorization": Client.#userToken ? `Bearer ${Client.#userToken}` : undefined
			}
		};

		// Logging
		console.log("API: " + url);

		// Execute API call
		const response = await fetch(url, options);

		// Get response token
		if (response.headers.has("Token"))
			Client.#userToken = response.headers.get("Token");

		// Parse response as JSON
		const json = await response.json();

		// Return the parsed JSON
		return json;
	}
};