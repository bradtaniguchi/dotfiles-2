import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface VerifyResult {
	name: string;
	installed: boolean;
	message?: string;
	warning?: boolean;
	optional?: boolean;
	installUrl?: string;
}

function checkCommand(command: string): boolean {
	try {
		execSync(`command -v ${command}`, { stdio: "pipe" });
		return true;
	} catch {
		return false;
	}
}

// Individual verification functions
function verifyHelix(): VerifyResult {
	return {
		name: "Helix IDE (hx)",
		installed: checkCommand("hx"),
		installUrl: "https://docs.helix-editor.com/install.html",
	};
}

function verifyTmux(): VerifyResult {
	return {
		name: "tmux",
		installed: checkCommand("tmux"),
		installUrl: "https://github.com/tmux/tmux/wiki/Installing",
	};
}

function verifyNvm(): VerifyResult {
	const nvmPath = join(homedir(), ".nvm");
	return {
		name: "nvm",
		installed: existsSync(nvmPath),
		message: existsSync(nvmPath) ? undefined : "~/.nvm not found",
		installUrl: "https://github.com/nvm-sh/nvm#installing-and-updating",
	};
}

function verifyFzf(): VerifyResult {
	return {
		name: "fzf",
		installed: checkCommand("fzf"),
		installUrl: "https://github.com/junegunn/fzf#installation",
	};
}

function verifyZoxide(): VerifyResult {
	const zoxidePath = join(homedir(), ".local", "bin", "zoxide");
	return {
		name: "zoxide",
		installed: existsSync(zoxidePath),
		message: existsSync(zoxidePath)
			? undefined
			: "~/.local/bin/zoxide not found",
		installUrl: "https://github.com/ajeetdsouza/zoxide#installation",
	};
}

function verifyStarship(): VerifyResult {
	return {
		name: "starship",
		installed: checkCommand("starship"),
		installUrl: "https://starship.rs/guide/#-installation",
	};
}

function verifyBashrc(): VerifyResult {
	const bashrcPath = join(homedir(), ".bashrc");
	const configBashrcPath = join(__dirname, "../../configs/bashrc");

	if (!existsSync(bashrcPath)) {
		return {
			name: "bashrc",
			installed: false,
			message: "~/.bashrc not found",
		};
	}

	// Check if contents match
	try {
		const installedContent = readFileSync(bashrcPath, "utf-8");
		const configContent = readFileSync(configBashrcPath, "utf-8");

		if (installedContent !== configContent) {
			return {
				name: "bashrc",
				installed: true,
				warning: true,
				message:
					"⚠️  ~/.bashrc exists but differs from configs/bashrc - may need sync",
			};
		}

		return {
			name: "bashrc",
			installed: true,
		};
	} catch (error) {
		return {
			name: "bashrc",
			installed: true,
			warning: true,
			message: `Error comparing bashrc: ${error instanceof Error ? error.message : String(error)}`,
		};
	}
}

function verifyHelixConfig(): VerifyResult {
	const helixConfigPath = join(homedir(), ".config", "helix");

	if (!existsSync(helixConfigPath)) {
		return {
			name: "helix",
			installed: false,
			message: "~/.config/helix not found",
		};
	}

	return {
		name: "helix",
		installed: true,
	};
}

function verifyTmuxConfig(): VerifyResult {
	const tmuxConfigPath = join(homedir(), ".config", "tmux", "tmux.conf");

	if (!existsSync(tmuxConfigPath)) {
		return {
			name: "tmux",
			installed: false,
			message: "~/.config/tmux/tmux.conf not found",
		};
	}

	return {
		name: "tmux",
		installed: true,
	};
}

// Optional/recommended tools
function verifyGh(): VerifyResult {
	const installed = checkCommand("gh");
	return {
		name: "gh (GitHub CLI)",
		installed,
		optional: true,
		message: installed
			? undefined
			: "💡 Recommended: Install for GitHub Copilot integration",
		installUrl: "https://cli.github.com/manual/installation",
	};
}

function verifyGitHubCopilotCli(): VerifyResult {
	const installed = checkCommand("copilot");
	return {
		name: "copilot (GitHub Copilot CLI)",
		installed,
		optional: true,
		message: installed
			? undefined
			: "💡 Recommended: Install for AI-powered CLI assistance",
		installUrl:
			"https://docs.github.com/en/copilot/how-tos/copilot-cli/install-copilot-cli",
	};
}

function verifyHtop(): VerifyResult {
	const installed = checkCommand("htop");
	return {
		name: "htop",
		installed,
		optional: true,
		message: installed
			? undefined
			: "💡 Recommended: Install for better system monitoring",
		installUrl: "https://github.com/htop-dev/htop",
	};
}

function verifyAll(): VerifyResult[] {
	return [
		verifyHelix(),
		verifyTmux(),
		verifyNvm(),
		verifyFzf(),
		verifyZoxide(),
		verifyStarship(),
		verifyBashrc(),
		verifyGh(),
		verifyGitHubCopilotCli(),
		verifyHtop(),
	];
}

function displayResults(results: VerifyResult[]): void {
	let allInstalled = true;
	let hasWarnings = false;

	for (const result of results) {
		// Optional tools don't affect overall status
		if (result.optional && !result.installed) {
			const color = "\x1b[36m"; // Cyan for optional
			const reset = "\x1b[0m";
			console.log(`${color}○${reset} ${result.name}`);
			if (result.message) {
				console.log(`  ${result.message}`);
			}
			if (result.installUrl) {
				console.log(`  📦 Install: ${result.installUrl}`);
			}
			continue;
		}

		const status = result.installed ? "✓" : "✗";
		let color = result.installed ? "\x1b[32m" : "\x1b[31m";

		// Use yellow for warnings
		if (result.warning) {
			color = "\x1b[33m";
			hasWarnings = true;
		}

		const reset = "\x1b[0m";

		console.log(`${color}${status}${reset} ${result.name}`);
		if (result.message) {
			console.log(`  ${result.message}`);
		}

		// Show install URL if not installed (and not a warning-only case)
		if (!result.installed && result.installUrl) {
			console.log(`  📦 Install: ${result.installUrl}`);
		}

		if (!result.installed && !result.optional) {
			allInstalled = false;
		}
	}

	console.log();
	if (allInstalled && !hasWarnings) {
		console.log("\x1b[32m✓ All configurations verified successfully!\x1b[0m");
	} else if (allInstalled && hasWarnings) {
		console.log(
			"\x1b[33m⚠ All configurations installed but some have warnings.\x1b[0m",
		);
	} else {
		console.log(
			"\x1b[33m⚠ Some configurations are missing or not properly installed.\x1b[0m",
		);
		process.exit(1);
	}
}

export const verifyCommand = new Command("verify")
	.description("Verify configuration files are correctly installed")
	.action(() => {
		console.log("Verifying configurations...\n");
		displayResults(verifyAll());
	});

// Subcommand: verify all
verifyCommand
	.command("all")
	.description("Verify all configurations")
	.action(() => {
		console.log("Verifying all configurations...\n");
		displayResults(verifyAll());
	});

// Subcommand: verify helix
verifyCommand
	.command("helix")
	.alias("hx")
	.description("Verify Helix IDE installation")
	.action(() => {
		console.log("Verifying Helix IDE...\n");
		displayResults([verifyHelix()]);
	});

// Subcommand: verify tmux
verifyCommand
	.command("tmux")
	.description("Verify tmux installation")
	.action(() => {
		console.log("Verifying tmux...\n");
		displayResults([verifyTmux()]);
	});

// Subcommand: verify nvm
verifyCommand
	.command("nvm")
	.description("Verify nvm installation")
	.action(() => {
		console.log("Verifying nvm...\n");
		displayResults([verifyNvm()]);
	});

// Subcommand: verify fzf
verifyCommand
	.command("fzf")
	.description("Verify fzf installation")
	.action(() => {
		console.log("Verifying fzf...\n");
		displayResults([verifyFzf()]);
	});

// Subcommand: verify zoxide
verifyCommand
	.command("zoxide")
	.description("Verify zoxide installation")
	.action(() => {
		console.log("Verifying zoxide...\n");
		displayResults([verifyZoxide()]);
	});

// Subcommand: verify starship
verifyCommand
	.command("starship")
	.description("Verify starship installation")
	.action(() => {
		console.log("Verifying starship...\n");
		displayResults([verifyStarship()]);
	});

// Subcommand: verify bashrc
verifyCommand
	.command("bashrc")
	.description("Verify bashrc installation and content")
	.action(() => {
		console.log("Verifying bashrc...\n");
		displayResults([verifyBashrc()]);
	});

// Subcommand: verify gh
verifyCommand
	.command("gh")
	.description("Verify GitHub CLI installation (optional)")
	.action(() => {
		console.log("Verifying GitHub CLI...\n");
		displayResults([verifyGh()]);
	});

// Subcommand: verify copilot
verifyCommand
	.command("copilot")
	.description("Verify GitHub Copilot CLI installation (optional)")
	.action(() => {
		console.log("Verifying GitHub Copilot CLI...\n");
		displayResults([verifyGitHubCopilotCli()]);
	});

// Subcommand: verify htop
verifyCommand
	.command("htop")
	.description("Verify htop installation (optional)")
	.action(() => {
		console.log("Verifying htop...\n");
		displayResults([verifyHtop()]);
	});

// Export verification functions for use in other commands
export { verifyHelixConfig, verifyTmuxConfig, verifyBashrc };
