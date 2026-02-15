import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { diffLines, type Change } from "diff";

export interface FileDiff {
	path: string;
	repoPath: string;
	installedPath: string;
	changes: Change[];
	onlyInRepo: boolean;
	onlyInSystem: boolean;
}

/**
 * Compare two files and return the diff
 */
export function compareFiles(
	repoPath: string,
	installedPath: string,
): FileDiff | null {
	const onlyInRepo = existsSync(repoPath) && !existsSync(installedPath);
	const onlyInSystem = !existsSync(repoPath) && existsSync(installedPath);

	if (!existsSync(repoPath) && !existsSync(installedPath)) {
		return null;
	}

	if (onlyInRepo || onlyInSystem) {
		return {
			path: repoPath,
			repoPath,
			installedPath,
			changes: [],
			onlyInRepo,
			onlyInSystem,
		};
	}

	const repoContent = readFileSync(repoPath, "utf-8");
	const installedContent = readFileSync(installedPath, "utf-8");

	const changes = diffLines(repoContent, installedContent);

	return {
		path: repoPath,
		repoPath,
		installedPath,
		changes,
		onlyInRepo: false,
		onlyInSystem: false,
	};
}

/**
 * Compare two directories recursively
 */
export function compareDirectories(
	repoDir: string,
	installedDir: string,
): FileDiff[] {
	const diffs: FileDiff[] = [];

	if (!existsSync(repoDir) && !existsSync(installedDir)) {
		return diffs;
	}

	// Handle case where only one directory exists
	if (!existsSync(repoDir)) {
		const installedFiles = getAllFiles(installedDir);
		for (const file of installedFiles) {
			diffs.push({
				path: file,
				repoPath: file.replace(installedDir, repoDir),
				installedPath: file,
				changes: [],
				onlyInRepo: false,
				onlyInSystem: true,
			});
		}
		return diffs;
	}

	if (!existsSync(installedDir)) {
		const repoFiles = getAllFiles(repoDir);
		for (const file of repoFiles) {
			diffs.push({
				path: file,
				repoPath: file,
				installedPath: file.replace(repoDir, installedDir),
				changes: [],
				onlyInRepo: true,
				onlyInSystem: false,
			});
		}
		return diffs;
	}

	// Both directories exist - compare files
	const repoFiles = getAllFiles(repoDir);
	const installedFiles = getAllFiles(installedDir);

	// Get all unique relative paths
	const allRelativePaths = new Set<string>();

	for (const file of repoFiles) {
		const relativePath = file.replace(repoDir, "");
		allRelativePaths.add(relativePath);
	}

	for (const file of installedFiles) {
		const relativePath = file.replace(installedDir, "");
		allRelativePaths.add(relativePath);
	}

	for (const relativePath of allRelativePaths) {
		const repoPath = join(repoDir, relativePath);
		const installedPath = join(installedDir, relativePath);
		const diff = compareFiles(repoPath, installedPath);

		if (diff) {
			diffs.push(diff);
		}
	}

	return diffs;
}

/**
 * Get all files in a directory recursively
 */
function getAllFiles(dir: string): string[] {
	const files: string[] = [];

	if (!existsSync(dir)) {
		return files;
	}

	const entries = readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		// Skip .git directories
		if (entry.name === ".git") {
			continue;
		}

		const fullPath = join(dir, entry.name);

		if (entry.isDirectory()) {
			files.push(...getAllFiles(fullPath));
		} else {
			files.push(fullPath);
		}
	}

	return files;
}

/**
 * Check if there are any differences
 */
export function hasDifferences(diff: FileDiff): boolean {
	if (diff.onlyInRepo || diff.onlyInSystem) {
		return true;
	}

	return diff.changes.some((change) => change.added || change.removed);
}
