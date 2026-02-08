#!/usr/bin/env -S node --experimental-strip-types

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { backupCommand } from "./commands/backup.ts";
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
program.addCommand(backupCommand);

program.parse();
