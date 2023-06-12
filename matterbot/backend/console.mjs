/**
 * Copyright (c) 2021 Nadav Tasher
 * https://github.com/NadavTasher/Template/
 **/

// Import readline
import REPL from "repl";

// Import utilities
import {
    File,
    Hash,
    Type,
    Token,
    Charset,
    Password,
    Validator,
    Authority
} from "./internal/utilities.mjs";
import { Bot } from "./external/bot.mjs";
import { Client } from "./external/client.mjs";

// Initialize REPL
let mREPL = REPL.start();

// Update context
mREPL.context.File = File;
mREPL.context.Hash = Hash;
mREPL.context.Type = Type;
mREPL.context.Token = Token;
mREPL.context.Charset = Charset;
mREPL.context.Password = Password;
mREPL.context.Validator = Validator;
mREPL.context.Authority = Authority;

mREPL.context.Bot = Bot;
mREPL.context.Client = Client;