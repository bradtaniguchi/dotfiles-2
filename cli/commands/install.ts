import { Command } from "commander";

export const installCommand = new Command("install")
	.description("Install configuration files")
	.option("-f, --force", "Force overwrite existing files")
	.action((options) => {
		console.log("Installing configurations...", options);
		// TODO: Implement install logic
	});
