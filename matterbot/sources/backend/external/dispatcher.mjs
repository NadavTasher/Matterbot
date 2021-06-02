// Import manager
import { Bot } from "./bot.mjs";
import { Password, Token } from "../internal/utilities.mjs";

// Create token authority
const token = new Token(process.env.SECRET);

// Dispatcher helper function
const Dispatch = (parameters, exceptions = true) => {
	// Assemble minimal permissions
	let permissions = [];
	// Check if users are needed
	if (parameters.recipients.hasOwnProperty("users") && parameters.recipients.users.length > 0)
		permissions.push(`mattermost:users`);
	// Append recipient channels
	for (let teamName in parameters.recipients.channels) {
		for (let channelName of parameters.recipients.channels[teamName]) {
			permissions.push(`mattermost:channels:${teamName}:${channelName}`);
		}
	}

	// Dispatch messages
	Bot.deliver(token.validate(parameters.token, permissions).content.prefix + parameters.message, parameters.recipients, exceptions);

	// Return message
	return exceptions ? `Message ${parameters.message} was sent.` : `Sending "${parameters.message}" quietly.`;
};

// Bot dispatcher
export default {
	// Dispatcher API
	dispatcher: {
		// Message dispatching endpoints
		dispatch: {
			handler: (parameters) => {
				return Dispatch(parameters, false);
			},
			parameters: {
				message: "string",
				recipients: "object",
				token: "string"
			}
		},
		sensitive: {
			handler: (parameters) => {
				return Dispatch(parameters, true);
			},
			parameters: {
				message: "string",
				recipients: "object",
				token: "string"
			}
		}
	},
	// Authority API
	authority: {
		// Dispatcher issuer
		issue: {
			handler: (parameters) => {
				// Signing mode
				let mode = false;
				// Check for password validation
				if (!Password.check(parameters.token, process.env.PASSWORD)) {
					// Validate token
					token.validate(parameters.token);
					// Change mode
					mode = true;
				}

				// Create token parameters
				let permissions = [];
				// Check if issuer
				if (parameters.issuer)
					permissions.push(`issue`);
				// Check if users
				if (parameters.users)
					permissions.push(`mattermost:users`);
				// Add channels
				for (let channel of parameters.channels)
					permissions.push(`mattermost:channels:${channel}`);

				// Create token
				return token.issue({
					name: parameters.name,
					content: {
						prefix: parameters.prefix
					},
					permissions: permissions
				}, parameters.validity, mode ? parameters.token : null);
			},
			parameters: {
				token: "string", // Token or password
				name: "string", // Application name or personal name
				prefix: "string", // Message prefix
				issuer: "boolean", // Is the token allowed to issue more children
				validity: "number", // Validity date
				users: "boolean", // Allowed to message users
				channels: "array" // Channels which are allowed
			}
		}
	}
};