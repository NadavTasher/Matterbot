/**
 * Copyright (c) 2021 Nadav Tasher
 * https://github.com/NadavTasher/Template/
 **/

// Import readline
import REPL from "repl";

// Import utilities
import { Utilities, Validator, Hash, Password, Authority, File, Database } from "./internal/utilities.mjs";
import { Bot } from "./external/bot.mjs";
import { Client } from "./external/client.mjs";

// Initialize REPL
let mREPL = REPL.start();

// Update context
mREPL.context.Utilities = Utilities;
mREPL.context.Validator = Validator;
mREPL.context.Hash = Hash;
mREPL.context.Password = Password;
mREPL.context.Authority = Authority;
mREPL.context.File = File;
mREPL.context.Database = Database;

mREPL.context.Bot = Bot;
mREPL.context.Client = Client;