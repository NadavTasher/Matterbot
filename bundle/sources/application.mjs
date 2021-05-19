/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Template/
 **/

// Import internal parts
import { Server } from "./internal/server.mjs";

// Create the server
let mServer = new Server(8000);

// Import the routes
import { Manager } from "./external/manager.mjs";
import routes from "./external/dispatcher.mjs";

// Enable the routes
mServer.insertAll(routes);

// Initialize manager and add teams
Manager.initialize({
	hostname: process.env.MM_HOSTNAME,
	username: process.env.MM_USERNAME,
	password: process.env.MM_PASSWORD
});

// TODO: Add teams

// Listen for requests
mServer.listen();