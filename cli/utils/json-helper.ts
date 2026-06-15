/**
 * Strips comments (block and single line) and trailing commas from a JSONC string
 * and parses it into a JS object.
 */
// biome-ignore lint/suspicious/noExplicitAny: JSON parsing returns any
export function parseJsonc(content: string): any {
	// Strip block comments /* ... */ (only when not inside strings)
	let cleaned = "";
	let inString = false;
	let escaped = false;

	for (let i = 0; i < content.length; i++) {
		const char = content[i];
		const next = content[i + 1];

		if (escaped) {
			escaped = false;
			cleaned += char;
			continue;
		}
		if (char === "\\") {
			escaped = true;
			cleaned += char;
			continue;
		}
		if (char === '"') {
			inString = !inString;
			cleaned += char;
			continue;
		}
		if (!inString && char === "/" && next === "*") {
			i += 2;
			while (
				i < content.length - 1 &&
				!(content[i] === "*" && content[i + 1] === "/")
			) {
				i++;
			}
			i++; // skip the '/' in closing '*/'
			continue;
		}

		cleaned += char;
	}
	// Strip single line comments // ... (but avoid stripping URLs like https://...)
	const lines = cleaned.split("\n");
	const processedLines = lines.map((line) => {
		let inString = false;
		let escaped = false;
		for (let i = 0; i < line.length; i++) {
			const char = line[i];
			if (escaped) {
				escaped = false;
				continue;
			}
			if (char === "\\") {
				escaped = true;
				continue;
			}
			if (char === '"') {
				inString = !inString;
				continue;
			}
			if (!inString && char === "/" && line[i + 1] === "/") {
				return line.slice(0, i);
			}
		}
		return line;
	});
	cleaned = processedLines.join("\n");

	// Strip trailing commas before closing braces/brackets
	cleaned = cleaned.replace(/,(\s*[}\]])/g, "$1");

	return JSON.parse(cleaned);
}

/**
 * Checks if there is a conflict/overwrite between two JSON values.
 * Returns the path of conflict (e.g. "editor.tab_size") or null if they can be merged.
 */
export function findJsonConflict(
	// biome-ignore lint/suspicious/noExplicitAny: JSON structure can be any shape
	source: any,
	// biome-ignore lint/suspicious/noExplicitAny: JSON structure can be any shape
	dest: any,
	path = "",
): string | null {
	if (
		typeof source === "object" &&
		source !== null &&
		!Array.isArray(source) &&
		typeof dest === "object" &&
		dest !== null &&
		!Array.isArray(dest)
	) {
		for (const key of Object.keys(source)) {
			if (key in dest) {
				const currentPath = path ? `${path}.${key}` : key;
				const conflict = findJsonConflict(source[key], dest[key], currentPath);
				if (conflict) {
					return conflict;
				}
			}
		}
		return null;
	}
	if (JSON.stringify(source) !== JSON.stringify(dest)) {
		return path || "root";
	}
	return null;
}

/**
 * Merges source JSON object into dest JSON object recursively.
 * Assumes findJsonConflict has returned null.
 */
export function mergeJson(
	// biome-ignore lint/suspicious/noExplicitAny: JSON structure can be any shape
	source: any,
	// biome-ignore lint/suspicious/noExplicitAny: JSON structure can be any shape
	dest: any,
	// biome-ignore lint/suspicious/noExplicitAny: JSON structure can be any shape
): any {
	if (
		typeof source === "object" &&
		source !== null &&
		!Array.isArray(source) &&
		typeof dest === "object" &&
		dest !== null &&
		!Array.isArray(dest)
	) {
		const result = { ...dest };
		for (const key of Object.keys(source)) {
			if (key in dest) {
				result[key] = mergeJson(source[key], dest[key]);
			} else {
				result[key] = source[key];
			}
		}
		return result;
	}
	return dest;
}
