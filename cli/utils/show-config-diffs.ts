import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compareFiles, compareDirectories } from "./diff.ts";
import { displayDiff } from "./diff-renderer.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Show diffs for all configuration files
 */
export function showConfigDiffs(): void {
	const allDiffs = [];

	// Compare bashrc
	const bashrcDiff = compareFiles(
		join(__dirname, "../../configs/bashrc"),
		join(homedir(), ".bashrc"),
	);
	if (bashrcDiff) {
		allDiffs.push(bashrcDiff);
	}

	// Compare helix config
	const helixDiffs = compareDirectories(
		join(__dirname, "../../configs/helix"),
		join(homedir(), ".config", "helix"),
	);
	allDiffs.push(...helixDiffs);

	// Compare tmux config
	const tmuxDiff = compareFiles(
		join(__dirname, "../../configs/tmux/tmux.conf"),
		join(homedir(), ".config", "tmux", "tmux.conf"),
	);
	if (tmuxDiff) {
		allDiffs.push(tmuxDiff);
	}

	displayDiff(allDiffs);
}
