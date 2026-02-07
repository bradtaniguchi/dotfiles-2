import { Command } from "commander";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

interface VerifyResult {
	name: string;
	installed: boolean;
	message?: string;
}

function checkCommand(command: string): boolean {
	try {
		execSync(`command -v ${command}`, { stdio: "pipe" });
		return true;
	} catch {
		return false;
	}
}

function checkAlias(alias: string, expectedCommand: string): boolean {
	try {
		const result = execSync(`bash -i -c "alias ${alias}"`, {
			stdio: "pipe",
			encoding: "utf-8",
		});
		return result.includes(expectedCommand);
	} catch {
		return false;
	}
}

function verifyInstallations(): VerifyResult[] {
	const results: VerifyResult[] = [];

	// Check Helix IDE
	results.push({
		name: "Helix IDE (hx)",
		installed: checkCommand("hx"),
	});

	// Check tmux
	results.push({
		name: "tmux",
		installed: checkCommand("tmux"),
	});

	// Check nvm (.nvm folder in home)
	const nvmPath = join(homedir(), ".nvm");
	results.push({
		name: "nvm",
		installed: existsSync(nvmPath),
		message: existsSync(nvmPath) ? `Found at ${nvmPath}` : "~/.nvm not found",
	});

	// Check fzf
	results.push({
		name: "fzf",
		installed: checkCommand("fzf"),
	});

	// Check zoxide in ~/.local/bin
	const zoxidePath = join(homedir(), ".local", "bin", "zoxide");
	results.push({
		name: "zoxide",
		installed: existsSync(zoxidePath),
		message: existsSync(zoxidePath) ? `Found at ${zoxidePath}` : "~/.local/bin/zoxide not found",
	});

	// Check starship
	results.push({
		name: "starship",
		installed: checkCommand("starship"),
	});

	return results;
}

export const verifyCommand = new Command("verify")
	.description("Verify configuration files are correctly installed")
	.action(() => {
		console.log("Verifying configurations...\n");

		const results = verifyInstallations();
		let allInstalled = true;

		for (const result of results) {
			const status = result.installed ? "✓" : "✗";
			const color = result.installed ? "\x1b[32m" : "\x1b[31m";
			const reset = "\x1b[0m";

			console.log(`${color}${status}${reset} ${result.name}`);
			if (result.message) {
				console.log(`  ${result.message}`);
			}

			if (!result.installed) {
				allInstalled = false;
			}
		}

		console.log();
		if (allInstalled) {
			console.log("\x1b[32m✓ All configurations verified successfully!\x1b[0m");
		} else {
			console.log(
				"\x1b[33m⚠ Some configurations are missing or not properly installed.\x1b[0m",
			);
			process.exit(1);
		}
	});
