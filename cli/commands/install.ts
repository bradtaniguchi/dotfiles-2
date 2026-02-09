import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import {
	type VerifyResult,
	verifyBashrc,
	verifyHelixConfig,
	verifyTmuxConfig,
} from "./verify.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface InstallResult {
	name: string;
	success: boolean;
	message?: string;
	skipped?: boolean;
}

function copyDirectory(src: string, dest: string, force = false): void {
	if (!existsSync(dest)) {
		mkdirSync(dest, { recursive: true });
	}

	const entries = readdirSync(src, { withFileTypes: true });

	for (const entry of entries) {
		if (entry.name === ".git") {
			continue;
		}

		const srcPath = join(src, entry.name);
		const destPath = join(dest, entry.name);

		if (entry.isDirectory()) {
			copyDirectory(srcPath, destPath, force);
		} else {
			if (!force && existsSync(destPath)) {
				continue;
			}
			copyFileSync(srcPath, destPath);
		}
	}
}

function displayVerifyResults(results: VerifyResult[]): void {
	for (const result of results) {
		const status = result.installed ? "✓" : "✗";
		let color = result.installed ? "\x1b[32m" : "\x1b[31m";

		if (result.warning) {
			color = "\x1b[33m";
		}

		const reset = "\x1b[0m";

		console.log(`${color}${status}${reset} ${result.name}`);
		if (result.message) {
			console.log(`  ${result.message}`);
		}
	}
	console.log();
}

function installHelix(dryrun = false, force = false): InstallResult {
	try {
		const repoRoot = join(__dirname, "../..");
		const source = join(repoRoot, "configs/helix");
		const dest = join(homedir(), ".config", "helix");

		if (!existsSync(source)) {
			return {
				name: "helix",
				success: false,
				message: "configs/helix not found in repo",
			};
		}

		if (!force && existsSync(dest)) {
			return {
				name: "helix",
				success: true,
				skipped: true,
				message: "~/.config/helix already exists (use --force to overwrite)",
			};
		}

		if (!dryrun) {
			copyDirectory(source, dest, force);
		}

		return {
			name: "helix",
			success: true,
			message: dryrun ? `Would install: ${source} → ${dest}` : undefined,
		};
	} catch (error) {
		return {
			name: "helix",
			success: false,
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

function installTmux(dryrun = false, force = false): InstallResult {
	try {
		const repoRoot = join(__dirname, "../..");
		const source = join(repoRoot, "configs/tmux/tmux.conf");
		const dest = join(homedir(), ".config", "tmux", "tmux.conf");

		if (!existsSync(source)) {
			return {
				name: "tmux",
				success: false,
				message: "configs/tmux/tmux.conf not found in repo",
			};
		}

		if (!force && existsSync(dest)) {
			return {
				name: "tmux",
				success: true,
				skipped: true,
				message:
					"~/.config/tmux/tmux.conf already exists (use --force to overwrite)",
			};
		}

		if (!dryrun) {
			const parentDir = dirname(dest);
			if (!existsSync(parentDir)) {
				mkdirSync(parentDir, { recursive: true });
			}
			copyFileSync(source, dest);
		}

		return {
			name: "tmux",
			success: true,
			message: dryrun ? `Would install: ${source} → ${dest}` : undefined,
		};
	} catch (error) {
		return {
			name: "tmux",
			success: false,
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

function installBashrc(dryrun = false, force = false): InstallResult {
	try {
		const repoRoot = join(__dirname, "../..");
		const source = join(repoRoot, "configs/bashrc");
		const dest = join(homedir(), ".bashrc");

		if (!existsSync(source)) {
			return {
				name: "bashrc",
				success: false,
				message: "configs/bashrc not found in repo",
			};
		}

		if (!force && existsSync(dest)) {
			return {
				name: "bashrc",
				success: true,
				skipped: true,
				message: "~/.bashrc already exists (use --force to overwrite)",
			};
		}

		if (!dryrun) {
			copyFileSync(source, dest);
		}

		return {
			name: "bashrc",
			success: true,
			message: dryrun ? `Would install: ${source} → ${dest}` : undefined,
		};
	} catch (error) {
		return {
			name: "bashrc",
			success: false,
			message: error instanceof Error ? error.message : String(error),
		};
	}
}

function installAll(dryrun = false, force = false): InstallResult[] {
	return [
		installHelix(dryrun, force),
		installTmux(dryrun, force),
		installBashrc(dryrun, force),
	];
}

function getVerifyResults(items: string[]): VerifyResult[] {
	const results: VerifyResult[] = [];

	for (const item of items) {
		switch (item) {
			case "helix":
				results.push(verifyHelixConfig());
				break;
			case "tmux":
				results.push(verifyTmuxConfig());
				break;
			case "bashrc":
				results.push(verifyBashrc());
				break;
		}
	}

	return results;
}

function displayResults(
	results: InstallResult[],
	dryrun = false,
	verify = true,
): void {
	// Run verification BEFORE installation if verify is enabled
	if (verify) {
		const itemsToVerify = results.map((r) => r.name);
		const verifyResults = getVerifyResults(itemsToVerify);

		console.log("Current installation status:\n");
		displayVerifyResults(verifyResults);
	}

	let allSucceeded = true;
	let hasSkipped = false;

	for (const result of results) {
		const status = result.success ? "✓" : "✗";
		let color = result.success ? "\x1b[32m" : "\x1b[31m";

		if (result.skipped) {
			color = "\x1b[33m"; // Yellow for skipped
			hasSkipped = true;
		}

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
	} else if (allSucceeded && !hasSkipped) {
		console.log("\x1b[32m✓ All configurations installed successfully!\x1b[0m");
	} else if (allSucceeded && hasSkipped) {
		console.log(
			"\x1b[33m✓ Installation complete (some files were skipped).\x1b[0m",
		);
	} else {
		console.log("\x1b[31m✗ Some configurations failed to install.\x1b[0m");
		process.exit(1);
	}
}

export const installCommand = new Command("install").description(
	"Install configuration files from repo to system",
);

// Default action when no subcommand is provided
installCommand
	.option(
		"-d, --dryrun",
		"Show what would be installed without actually installing",
	)
	.option("-f, --force", "Force overwrite existing files")
	.option("--no-verify", "Skip verification after installation")
	.action((options) => {
		const dryrun = options.dryrun || false;
		const force = options.force || false;
		const verify = options.verify !== false;
		console.log(
			`Installing all configurations from repo to system${dryrun ? " (dry run)" : ""}...\n`,
		);
		displayResults(installAll(dryrun, force), dryrun, verify);
	});

// Subcommand: install all
installCommand
	.command("all")
	.description("Install all configurations")
	.option(
		"-d, --dryrun",
		"Show what would be installed without actually installing",
	)
	.option("-f, --force", "Force overwrite existing files")
	.option("--no-verify", "Skip verification after installation")
	.action((...args) => {
		const cmd = args[args.length - 1];
		const options = cmd.opts();
		const parentOptions = cmd.parent?.opts() || {};
		const dryrun = options.dryrun || parentOptions.dryrun || false;
		const force = options.force || parentOptions.force || false;
		const verify = options.verify !== false && parentOptions.verify !== false;
		console.log(
			`Installing all configurations from repo to system${dryrun ? " (dry run)" : ""}...\n`,
		);
		displayResults(installAll(dryrun, force), dryrun, verify);
	});

// Subcommand: install helix
installCommand
	.command("helix")
	.alias("hx")
	.description("Install Helix configuration")
	.option(
		"-d, --dryrun",
		"Show what would be installed without actually installing",
	)
	.option("-f, --force", "Force overwrite existing files")
	.option("--no-verify", "Skip verification after installation")
	.action((...args) => {
		const cmd = args[args.length - 1];
		const options = cmd.opts();
		const parentOptions = cmd.parent?.opts() || {};
		const dryrun = options.dryrun || parentOptions.dryrun || false;
		const force = options.force || parentOptions.force || false;
		const verify = options.verify !== false && parentOptions.verify !== false;
		console.log(
			`Installing Helix configuration from repo to system${dryrun ? " (dry run)" : ""}...\n`,
		);
		displayResults([installHelix(dryrun, force)], dryrun, verify);
	});

// Subcommand: install tmux
installCommand
	.command("tmux")
	.description("Install tmux configuration")
	.option(
		"-d, --dryrun",
		"Show what would be installed without actually installing",
	)
	.option("-f, --force", "Force overwrite existing files")
	.option("--no-verify", "Skip verification after installation")
	.action((...args) => {
		const cmd = args[args.length - 1];
		const options = cmd.opts();
		const parentOptions = cmd.parent?.opts() || {};
		const dryrun = options.dryrun || parentOptions.dryrun || false;
		const force = options.force || parentOptions.force || false;
		const verify = options.verify !== false && parentOptions.verify !== false;
		console.log(
			`Installing tmux configuration from repo to system${dryrun ? " (dry run)" : ""}...\n`,
		);
		displayResults([installTmux(dryrun, force)], dryrun, verify);
	});

// Subcommand: install bashrc
installCommand
	.command("bashrc")
	.alias("bash")
	.description("Install bashrc configuration")
	.option(
		"-d, --dryrun",
		"Show what would be installed without actually installing",
	)
	.option("-f, --force", "Force overwrite existing files")
	.option("--no-verify", "Skip verification after installation")
	.action((...args) => {
		const cmd = args[args.length - 1];
		const options = cmd.opts();
		const parentOptions = cmd.parent?.opts() || {};
		const dryrun = options.dryrun || parentOptions.dryrun || false;
		const force = options.force || parentOptions.force || false;
		const verify = options.verify !== false && parentOptions.verify !== false;
		console.log(
			`Installing bashrc configuration from repo to system${dryrun ? " (dry run)" : ""}...\n`,
		);
		displayResults([installBashrc(dryrun, force)], dryrun, verify);
	});
