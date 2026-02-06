#!/usr/local/bin/node --experimental-strip-types

import { Command } from "commander";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { installCommand } from "./commands/install.ts";
import { syncCommand } from "./commands/sync.ts";
import { verifyCommand } from "./commands/verify.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
	readFileSync(join(__dirname, "../package.json"), "utf-8"),
);

const program = new Command();

program
	.name("dotfiles")
	.description("CLI to manage dotfiles and system configurations")
	.version(packageJson.version);

program.addCommand(installCommand);
program.addCommand(syncCommand);
program.addCommand(verifyCommand);

program.parse();
