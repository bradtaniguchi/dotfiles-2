import type { FileDiff } from "./diff.ts";

/**
 * Display diff results in terminal using colors
 */
export function displayDiff(diffs: FileDiff[]): void {
	const diffsWithChanges = diffs.filter(
		(diff) =>
			diff.onlyInRepo ||
			diff.onlyInSystem ||
			diff.changes.some((c) => c.added || c.removed),
	);

	if (diffsWithChanges.length === 0) {
		console.log("\x1b[32m✓ No differences found\x1b[0m");
		return;
	}

	console.log(`\nFound ${diffsWithChanges.length} file(s) with differences:\n`);

	for (const diff of diffsWithChanges) {
		displayFileDiff(diff);
	}
}

function displayFileDiff(diff: FileDiff): void {
	if (diff.onlyInRepo) {
		console.log(`\x1b[32m+ ${diff.installedPath}\x1b[0m (only in repo)`);
		console.log();
		return;
	}

	if (diff.onlyInSystem) {
		console.log(`\x1b[31m- ${diff.installedPath}\x1b[0m (only in system)`);
		console.log();
		return;
	}

	const hasChanges = diff.changes.some(
		(change) => change.added || change.removed,
	);

	if (!hasChanges) {
		return;
	}

	// Display file path
	console.log(`\x1b[1m\x1b[4m${diff.installedPath}\x1b[0m`);

	// Display changes
	for (const change of diff.changes) {
		if (change.added) {
			const lines = change.value.split("\n").filter((l) => l);
			for (const line of lines) {
				console.log(`\x1b[32m+ ${line}\x1b[0m`);
			}
		} else if (change.removed) {
			const lines = change.value.split("\n").filter((l) => l);
			for (const line of lines) {
				console.log(`\x1b[31m- ${line}\x1b[0m`);
			}
		} else {
			// Only show a few lines of context
			const lines = change.value.split("\n").filter((l) => l.trim());
			if (lines.length > 3) {
				console.log(`\x1b[2m  ... (${lines.length} unchanged lines)\x1b[0m`);
			} else {
				for (const line of lines) {
					console.log(`\x1b[2m  ${line}\x1b[0m`);
				}
			}
		}
	}

	console.log();
}
