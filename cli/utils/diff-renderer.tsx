import React from "react";
import { render } from "ink";
import type { FileDiff } from "./diff.ts";
import { DiffSummary } from "./diff-display.tsx";

/**
 * Display diff results using ink
 */
export function displayDiff(diffs: FileDiff[]): void {
	const { unmount } = render(<DiffSummary diffs={diffs} />);

	// Give ink time to render before unmounting
	setTimeout(() => {
		unmount();
	}, 100);
}
