#!/usr/bin/env node --experimental-strip-types

import { Command } from "commander";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(
	readFileSync(join(__dirname, "../package.json"), "utf-8"),
);

const program = new Command();

program
	.name("dotfiles")
	.description("CLI to manage dotfiles and system configurations")
	.version(packageJson.version);

// Example command structure - expand based on your needs
program
	.command("install")
	.description("Install configuration files")
	.option("-f, --force", "Force overwrite existing files")
	.action((options) => {
		console.log("Installing configurations...", options);
		// TODO: Implement install logic
	});

program
	.command("sync")
	.description("Sync configuration files")
	.action(() => {
		console.log("Syncing configurations...");
		// TODO: Implement sync logic
	});

program
	.command("backup")
	.description("Backup current configuration files")
	.action(() => {
		console.log("Backing up configurations...");
		// TODO: Implement backup logic
	});

program.parse();
