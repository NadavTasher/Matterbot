// Import manager
import { Manager } from "./manager.mjs";
import { Validator, Password, Authority } from "../internal/utilities.mjs";

// Create token authority
const Token = new Authority(process.env.SECRET);

// Dispatcher helper function
const Dispatch = (parameters, exceptions = true) => {
	// Validate token
	Token.validate(parameters.token);

	// Validate recipients
	for (let team in parameters.recipients)
		if (!Validator.isObject(parameters.recipients[team]))
			throw new Error("Team subtree is not an object");

	// Send message
	Manager.deliver(parameters.message, parameters.recipients, exceptions);

	// Return success
	return "Sending messages";
};

// Bot dispatcher
export default {
	// Dispatcher API
	dispatcher: {
		// Message dispatching endpoints
		dispatch: {
			handler: (parameters) => {
				Dispatch(parameters, false);
			},
			parameters: {
				message: "string",
				recipients: "object",
				token: "string"
			}
		},
		sensitive: {
			handler: (parameters) => {
				Dispatch(parameters, true);
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
				// Issue new token with given validity
				return Token.issue(parameters.application, parameters.validity);
			},
			parameters: {
				"application": "string",
				"validity": "number",
				"password": (password) => Password.validate(password, process.env.PASSWORD)
			}
		},
		// Dispatcher validator
		validate: {
			handler: (parameters) => {
				// Validate token
				return Token.validate(parameters.token);
			},
			parameters: {
				"token": "string"
			}
		}
	}
};