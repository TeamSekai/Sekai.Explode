const { formatTable } = require("./strings");

test("formatTable", () => {
	expect(
		formatTable(
			[
				["abc", "12"],
				["de", "345"],
			],
			{ align: ["left", "right"] },
		),
	).toBe("abc  12\n" + "de  345");
	expect(
		formatTable([
			["abcd", "def"],
			["gh", "ij"],
		]),
	).toBe("abcd def\n" + "gh   ij");
	expect(
		formatTable([
			["abcde", "12"],
			["abc", "123", "AB"],
			["abcd", "1", "A"],
		]),
	).toBe("abcde 12\n" + "abc   123 AB\n" + "abcd  1   A");
});
