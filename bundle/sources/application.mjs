/**
 * Copyright (c) 2020 Nadav Tasher
 * https://github.com/NadavTasher/Template/
 **/

// Import internal parts
import { Server } from "./internal/server.mjs";

// Create the server
let mServer = new Server(8000);

// Import client
import { Client } from "./external/client.mjs";

// Log in to client
Client.login(process.env.MM_HOSTNAME, process.env.MM_USERNAME, process.env.MM_PASSWORD);

// Import the routes
import routes from "./external/dispatcher.mjs";

// Enable the routes
mServer.insertAll(routes);

// Listen for requests
mServer.listen();