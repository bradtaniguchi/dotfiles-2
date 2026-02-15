import React from "react";
import { Box, Text } from "ink";
import type { FileDiff } from "./diff.ts";

interface DiffDisplayProps {
	diff: FileDiff;
}

export const DiffDisplay: React.FC<DiffDisplayProps> = ({ diff }) => {
	if (diff.onlyInRepo) {
		return (
			<Box flexDirection="column" marginBottom={1}>
				<Text color="green" bold>
					+ {diff.installedPath} (only in repo)
				</Text>
			</Box>
		);
	}

	if (diff.onlyInSystem) {
		return (
			<Box flexDirection="column" marginBottom={1}>
				<Text color="red" bold>
					- {diff.installedPath} (only in system)
				</Text>
			</Box>
		);
	}

	const hasChanges = diff.changes.some(
		(change) => change.added || change.removed,
	);

	if (!hasChanges) {
		return null;
	}

	return (
		<Box flexDirection="column" marginBottom={1}>
			<Text bold underline>
				{diff.installedPath}
			</Text>
			{diff.changes.map((change, index) => {
				if (change.added) {
					return (
						<Text key={index} color="green">
							+ {change.value.trimEnd()}
						</Text>
					);
				}
				if (change.removed) {
					return (
						<Text key={index} color="red">
							- {change.value.trimEnd()}
						</Text>
					);
				}
				// Only show a few lines of context
				const lines = change.value.split("\n").filter((l) => l.trim());
				if (lines.length > 3) {
					return (
						<Text key={index} dimColor>
							  ... ({lines.length} unchanged lines)
						</Text>
					);
				}
				return lines.map((line, i) => (
					<Text key={`${index}-${i}`} dimColor>
						  {line}
					</Text>
				));
			})}
		</Box>
	);
};

interface DiffSummaryProps {
	diffs: FileDiff[];
}

export const DiffSummary: React.FC<DiffSummaryProps> = ({ diffs }) => {
	const diffsWithChanges = diffs.filter(
		(diff) =>
			diff.onlyInRepo ||
			diff.onlyInSystem ||
			diff.changes.some((c) => c.added || c.removed),
	);

	if (diffsWithChanges.length === 0) {
		return (
			<Box>
				<Text color="green">✓ No differences found</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column">
			<Text bold>
				Found {diffsWithChanges.length} file(s) with differences:
			</Text>
			<Box flexDirection="column" marginTop={1}>
				{diffsWithChanges.map((diff, index) => (
					<DiffDisplay key={index} diff={diff} />
				))}
			</Box>
		</Box>
	);
};
