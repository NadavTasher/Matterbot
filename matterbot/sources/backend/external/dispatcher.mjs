// Import manager
import { Bot } from "./bot.mjs";
import { Password, Token, Authority, Validator } from "../internal/utilities.mjs";

// Create token authority
const authority = new Authority(process.env.SECRET);

// Bot dispatcher
export default {
	// Dispatcher API
	mattermost: {
		dispatch: {
			handler: async (parameters) => {
				// Validate token with mattermost permission
				const token = authority.validate(parameters.token, [`mattermost`]);

				// Check channels and users
				const users = token.has(`mattermost:users`);

				// Check if users are needed
				if (Validator.valid(parameters.recipients, { users: "array" }) && parameters.recipients.users.length > 0 && !users)
					throw new Error(`Direct messaging is not allowed to this token`);

				// Individual channel check
				for (const team in parameters.recipients.channels) {
					// Check whether the token has the team global permission
					const teamAllowed = token.has(`mattermost:channels:${team}`);

					// Loop over all channels
					for (const channel of parameters.recipients.channels[team]) {
						if (["Town Square", "town-square", "Off-Topic", "off-topic"].includes(channel)) {
							if (!token.has(`mattermost:channels:${team}:${channel}`))
								throw new Error(`Exception channel messaging to channel ${channel} in team ${team} is not allowed to this token`)
						} else {
							if (!teamAllowed)
								if (!token.has(`mattermost:channels:${team}:${channel}`))
									throw new Error(`Channel messaging to channel ${channel} in team ${team} is not allowed to this token`);
						}
					}
				}

				// Dispatch messages
				if (parameters.important)
					await Bot.deliver(token.contents().prefix + parameters.message, parameters.recipients, true);
				else
					Bot.deliver(token.contents().prefix + parameters.message, parameters.recipients, false);

				// Return message
				return parameters.important ? `Message was sent` : `Sending quietly`;
			},
			parameters: {
				token: "string",
				message: "string",
				recipients: "object",
				important: "boolean",
			}
		}
	},
	// Authority API
	authority: {
		// Dispatcher issuer
		issue: {
			handler: (parameters) => {
				// Signing mode
				let useToken = false;
				// Check for password validation
				if (!Password.check(parameters.token, process.env.PASSWORD)) {
					// Validate token
					token.validate(parameters.token);
					// Change mode
					useToken = true;
				}

				// Make sure the prefix is not empty
				if (useToken && parameters.prefix.length === 0)
					throw new Error(`Empty prefix is not allowed for child tokens`);

				// Create token parameters
				let permissions = [`mattermost`];

				// Check if issuer
				if (parameters.issuer)
					permissions.push(`issue`);
				// Check if users
				if (parameters.users)
					permissions.push(`mattermost:users`);

				// Add exception channels
				for (const channel of parameters.channels)
					permissions.push(`mattermost:channels:${channel}`);

				// Create token
				return authority.issue(parameters.name, {
					prefix: parameters.prefix
				}, permissions, parameters.validity, useToken ? parameters.token : null);
			},
			parameters: {
				token: "string", // Token or password
				// Application parameters
				name: "string", // Application name or personal name
				prefix: "string", // Message prefix
				// Token validity
				issuer: "boolean", // Is the token allowed to issue more children
				validity: "number", // Validity date
				// Messaging scope
				users: "boolean", // Allowed to message users
				channels: "array", // Channels which are allowed
			}
		}
	}
};