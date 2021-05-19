// Import webhook
import { Hook } from "./hook.mjs";

// Initialize client
let hook = new Hook(process.env.MM_HOOK);

// Routes
export const Routes = {
	bot: {
		send: {
			handler: async (parameters) => {
				// Send message
				await hook.send(parameters.message);

				// Return true
				return true;
			},
			parameters: {
				message: "string"
			}
		}
	}
};