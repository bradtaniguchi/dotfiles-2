import { Command } from "commander";
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface BackupItem {
	source: string;
	destination: string;
	type: "file" | "directory";
	name: string;
}

interface BackupResult {
	name: string;
	success: boolean;
	message?: string;
}

function getHelixBackupItem(backupDir: string): BackupItem {
	return {
		source: join(homedir(), ".config", "helix"),
		destination: join(backupDir, "helix"),
		type: "directory",
		name: "helix",
	};
}

function getTmuxBackupItem(backupDir: string): BackupItem {
	return {
		source: join(homedir(), ".config", "tmux", "tmux.conf"),
		destination: join(backupDir, "tmux", "tmux.conf"),
		type: "file",
		name: "tmux",
	};
}

function getBashrcBackupItem(backupDir: string): BackupItem {
	return {
		source: join(homedir(), ".bashrc"),
		destination: join(backupDir, "bashrc"),
		type: "file",
		name: "bashrc",
	};
}

function getBackupItems(backupDir: string): BackupItem[] {
	return [
		getHelixBackupItem(backupDir),
		getTmuxBackupItem(backupDir),
		getBashrcBackupItem(backupDir),
	];
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

function performBackup(items: BackupItem[]): BackupResult[] {
	const results: BackupResult[] = [];

	for (const item of items) {
		try {
			if (!existsSync(item.source)) {
				results.push({
					name: item.name,
					success: false,
					message: "not found, skipped",
				});
				continue;
			}

			if (item.type === "file") {
				// Create parent directory if needed
				const parentDir = dirname(item.destination);
				if (!existsSync(parentDir)) {
					mkdirSync(parentDir, { recursive: true });
				}
				copyFileSync(item.source, item.destination);
			} else {
				copyDirectory(item.source, item.destination);
			}

			results.push({
				name: item.name,
				success: true,
			});
		} catch (error) {
			results.push({
				name: item.name,
				success: false,
				message: error instanceof Error ? error.message : String(error),
			});
		}
	}

	return results;
}

function displayBackupResults(results: BackupResult[], backupLocation: string): void {
	let backedUpCount = 0;
	let skippedCount = 0;

	for (const result of results) {
		if (result.success) {
			console.log(`\x1b[32m✓\x1b[0m ${result.name}`);
			backedUpCount++;
		} else {
			console.log(
				`\x1b[33m○\x1b[0m ${result.name}${result.message ? ` (${result.message})` : ""}`,
			);
			skippedCount++;
		}
	}

	console.log();
	console.log(
		`\x1b[32m✓ Backup complete!\x1b[0m ${backedUpCount} items backed up, ${skippedCount} skipped`,
	);
	console.log(`  Location: ${backupLocation}`);
}

export const backupCommand = new Command("backup")
	.description("Backup current configuration files to a dated folder")
	.action(() => {
		console.log("Creating backup...\n");

		// Create backup folder with current date (YYYY-MM-DD)
		const today = new Date();
		const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD format
		const repoRoot = join(__dirname, "../..");
		const backupDir = join(repoRoot, "backups", dateStr);

		if (existsSync(backupDir)) {
			console.log(
				`\x1b[33m⚠ Backup folder already exists: backups/${dateStr}\x1b[0m`,
			);
			console.log("Overwriting existing backup...\n");
		}

		// Create backup directory
		mkdirSync(backupDir, { recursive: true });

		const items = getBackupItems(backupDir);
		const results = performBackup(items);
		displayBackupResults(results, `backups/${dateStr}`);
	});

// Subcommand: backup all
backupCommand
	.command("all")
	.description("Backup all configurations")
	.action(() => {
		console.log("Creating backup...\n");

		const today = new Date();
		const dateStr = today.toISOString().split("T")[0];
		const repoRoot = join(__dirname, "../..");
		const backupDir = join(repoRoot, "backups", dateStr);

		if (existsSync(backupDir)) {
			console.log(
				`\x1b[33m⚠ Backup folder already exists: backups/${dateStr}\x1b[0m`,
			);
			console.log("Overwriting existing backup...\n");
		}

		mkdirSync(backupDir, { recursive: true });

		const items = getBackupItems(backupDir);
		const results = performBackup(items);
		displayBackupResults(results, `backups/${dateStr}`);
	});

// Subcommand: backup helix
backupCommand
	.command("helix")
	.alias("hx")
	.description("Backup Helix configuration")
	.action(() => {
		console.log("Creating Helix backup...\n");

		const today = new Date();
		const dateStr = today.toISOString().split("T")[0];
		const repoRoot = join(__dirname, "../..");
		const backupDir = join(repoRoot, "backups", dateStr);

		mkdirSync(backupDir, { recursive: true });

		const items = [getHelixBackupItem(backupDir)];
		const results = performBackup(items);
		displayBackupResults(results, `backups/${dateStr}`);
	});

// Subcommand: backup tmux
backupCommand
	.command("tmux")
	.description("Backup tmux configuration")
	.action(() => {
		console.log("Creating tmux backup...\n");

		const today = new Date();
		const dateStr = today.toISOString().split("T")[0];
		const repoRoot = join(__dirname, "../..");
		const backupDir = join(repoRoot, "backups", dateStr);

		mkdirSync(backupDir, { recursive: true });

		const items = [getTmuxBackupItem(backupDir)];
		const results = performBackup(items);
		displayBackupResults(results, `backups/${dateStr}`);
	});

// Subcommand: backup bashrc
backupCommand
	.command("bashrc")
	.description("Backup bashrc configuration")
	.action(() => {
		console.log("Creating bashrc backup...\n");

		const today = new Date();
		const dateStr = today.toISOString().split("T")[0];
		const repoRoot = join(__dirname, "../..");
		const backupDir = join(repoRoot, "backups", dateStr);

		mkdirSync(backupDir, { recursive: true });

		const items = [getBashrcBackupItem(backupDir)];
		const results = performBackup(items);
		displayBackupResults(results, `backups/${dateStr}`);
	});
