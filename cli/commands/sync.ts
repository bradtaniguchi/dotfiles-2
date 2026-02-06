import { Command } from "commander";

export const syncCommand = new Command("sync")
	.description("Sync configuration files")
	.action(() => {
		console.log("Syncing configurations...");
		// TODO: Implement sync logic
	});
