import assert from "node:assert";
import {
	findJsonConflict,
	mergeJson,
	parseJsonc,
} from "../cli/utils/json-helper.ts";

describe("JSON/JSONC helper tests", () => {
	// Test parseJsonc
	assert.strictEqual(typeof parseJsonc, "function");

	const rawJsonc = `
	// Leading comment
	{
		/* nested block
		comment */
		"a": 1, // inline comment
		"b": "string with https://example.com/url and // chars",
		"c": {
			"d": [1, 2],
		}
	}
	`;
	const parsed = parseJsonc(rawJsonc);
	assert.strictEqual(parsed.a, 1, "parsed.a should be 1");
	assert.strictEqual(
		parsed.b,
		"string with https://example.com/url and // chars",
		"parsed.b should match string with slashes",
	);
	assert.deepStrictEqual(parsed.c.d, [1, 2], "parsed.c.d should be [1, 2]");

	// Test findJsonConflict & mergeJson (no conflict)
	const source1 = { a: 1, c: { d: 4 } };
	const dest1 = { b: 2, c: { e: 5 } };
	assert.strictEqual(
		findJsonConflict(source1, dest1),
		null,
		"should have no conflict",
	);
	const merged1 = mergeJson(source1, dest1);
	assert.deepStrictEqual(
		merged1,
		{ a: 1, b: 2, c: { d: 4, e: 5 } },
		"should merge successfully",
	);

	// Test findJsonConflict (with conflict)
	const source2 = { a: 1, c: { d: 4 } };
	const dest2 = { b: 2, c: { d: 5 } };
	assert.strictEqual(
		findJsonConflict(source2, dest2),
		"c.d",
		"conflict should be 'c.d'",
	);

	const source3 = { a: [1, 2] };
	const dest3 = { a: [1, 2, 3] };
	assert.strictEqual(
		findJsonConflict(source3, dest3),
		"a",
		"conflict should be 'a'",
	);

	const source4 = { a: { b: { c: { d: 1 } } } };
	const dest4 = { a: { b: { c: { d: 2 } } } };
	assert.strictEqual(
		findJsonConflict(source4, dest4),
		"a.b.c.d",
		"conflict should be 'a.b.c.d'",
	);

	console.log("✅ All JSON/JSONC helper tests passed!");
});

function describe(name: string, fn: () => void) {
	console.log(`\n=== Running suite: ${name} ===`);
	try {
		fn();
	} catch (error) {
		console.error(`❌ Suite "${name}" failed:`, error);
		process.exit(1);
	}
}
