import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface SyncResult {
	name: string;
	success: boolean;
	message?: string;
}

function copyDirectory(src: string, dest: string): void {
	if (!existsSync(dest)) {
		mkdirSync(dest, { recursive: true });
	}

	const entries = readdirSync(src, { withFileTypes: true });

	for (const entry of entries) {
		// Skip .git directories
		if (entry.name === ".git") {
			continue;
		}

		const srcPath = join(src, entry.name);
		const destPath = join(dest, entry.name);

		if (entry.isDirectory()) {
			copyDirectory(srcPath, destPath);
		} else {
			copyFileSync(srcPath, destPath);
		}
	}
}

function syncHelix(dryrun = false): SyncResult {
	try {
		const repoRoot = join(__dirname, "../..");
		const source = join(homedir(), ".config", "helix");
		const dest = join(repoRoot, "configs/helix");

		if (!existsSync(source)) {
			return {
				name: "helix",
				success: false,
				message: "~/.config/helix not found",
			};
		}

		if (!dryrun) {
			copyDirectory(source, dest);
		}

		return {
			name: "helix",
			success: true,
			message: dryrun ? `Would sync: ${source} → ${dest}` : undefined,
		};
	} catch (error) {
		return {
			name: "helix",
			success: false,
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

function syncTmux(dryrun = false): SyncResult {
	try {
		const repoRoot = join(__dirname, "../..");
		const source = join(homedir(), ".config", "tmux", "tmux.conf");
		const dest = join(repoRoot, "configs/tmux/tmux.conf");

		if (!existsSync(source)) {
			return {
				name: "tmux",
				success: false,
				message: "~/.config/tmux/tmux.conf not found",
			};
		}

		if (!dryrun) {
			// Ensure parent directory exists
			const parentDir = dirname(dest);
			if (!existsSync(parentDir)) {
				mkdirSync(parentDir, { recursive: true });
			}
			copyFileSync(source, dest);
		}

		return {
			name: "tmux",
			success: true,
			message: dryrun ? `Would sync: ${source} → ${dest}` : undefined,
		};
	} catch (error) {
		return {
			name: "tmux",
			success: false,
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

function syncBashrc(dryrun = false): SyncResult {
	try {
		const repoRoot = join(__dirname, "../..");
		const source = join(homedir(), ".bashrc");
		const dest = join(repoRoot, "configs/bashrc");

		if (!existsSync(source)) {
			return {
				name: "bashrc",
				success: false,
				message: "~/.bashrc not found",
			};
		}

		if (!dryrun) {
			// Ensure parent directory exists
			const parentDir = dirname(dest);
			if (!existsSync(parentDir)) {
				mkdirSync(parentDir, { recursive: true });
			}
			copyFileSync(source, dest);
		}

		return {
			name: "bashrc",
			success: true,
			message: dryrun ? `Would sync: ${source} → ${dest}` : undefined,
		};
	} catch (error) {
		return {
			name: "bashrc",
			success: false,
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

function syncAll(dryrun = false): SyncResult[] {
	return [syncHelix(dryrun), syncTmux(dryrun), syncBashrc(dryrun)];
}

function displayResults(results: SyncResult[], dryrun = false): void {
	let allSucceeded = true;

	for (const result of results) {
		const status = result.success ? "✓" : "✗";
		const color = result.success ? "\x1b[32m" : "\x1b[31m";
		const reset = "\x1b[0m";

		console.log(`${color}${status}${reset} ${result.name}`);
		if (result.message) {
			console.log(`  ${result.message}`);
		}

		if (!result.success) {
			allSucceeded = false;
		}
	}

	console.log();
	if (dryrun) {
		console.log("\x1b[36m[DRY RUN] No files were modified.\x1b[0m");
	} else if (allSucceeded) {
		console.log("\x1b[32m✓ All configurations synced successfully!\x1b[0m");
	} else {
		console.log("\x1b[31m✗ Some configurations failed to sync.\x1b[0m");
		process.exit(1);
	}
}

export const syncCommand = new Command("sync").description(
	"Sync configuration files from system to repo",
);

// Default action when no subcommand is provided
syncCommand.action(() => {
	// When no subcommand, show help or run all
	console.log("Syncing all configurations from system to repo...\n");
	displayResults(syncAll(false), false);
});

// Subcommand: sync all
syncCommand
	.command("all")
	.description("Sync all configurations")
	.option("-d, --dryrun", "Show what would be synced without actually syncing")
	.action((_, cmd) => {
		const options = cmd.opts();
		const dryrun = options.dryrun || false;
		console.log(
			`Syncing all configurations from system to repo${dryrun ? " (dry run)" : ""}...\n`,
		);
		displayResults(syncAll(dryrun), dryrun);
	});

// Subcommand: sync helix
syncCommand
	.command("helix")
	.alias("hx")
	.description("Sync Helix configuration")
	.option("-d, --dryrun", "Show what would be synced without actually syncing")
	.action((_, cmd) => {
		const options = cmd.opts();
		const dryrun = options.dryrun || false;
		console.log(
			`Syncing Helix configuration from system to repo${dryrun ? " (dry run)" : ""}...\n`,
		);
		displayResults([syncHelix(dryrun)], dryrun);
	});

// Subcommand: sync tmux
syncCommand
	.command("tmux")
	.description("Sync tmux configuration")
	.option("-d, --dryrun", "Show what would be synced without actually syncing")
	.action((_, cmd) => {
		const options = cmd.opts();
		const dryrun = options.dryrun || false;
		console.log(
			`Syncing tmux configuration from system to repo${dryrun ? " (dry run)" : ""}...\n`,
		);
		displayResults([syncTmux(dryrun)], dryrun);
	});

// Subcommand: sync bashrc
syncCommand
	.command("bashrc")
	.alias("bash")
	.description("Sync bashrc configuration")
	.option("-d, --dryrun", "Show what would be synced without actually syncing")
	.action((_, cmd) => {
		const options = cmd.opts();
		const dryrun = options.dryrun || false;
		console.log(
			`Syncing bashrc configuration from system to repo${dryrun ? " (dry run)" : ""}...\n`,
		);
		displayResults([syncBashrc(dryrun)], dryrun);
	});
