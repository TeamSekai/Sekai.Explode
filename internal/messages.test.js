// @ts-check

const { ReplyPattern } = require('./messages');

test('ReplyPattern.match', () => {
	const pattern1 = new ReplyPattern('それはそう', 'https://soreha.so/');
	const pattern2 = new ReplyPattern('それはそう', 'https://soreha.so/', true);

	expect(pattern1.apply('それはそう')).toBe('https://soreha.so/');
	expect(pattern1.apply('それ')).toBe(null);
	expect(pattern1.apply('それはそう。')).toBe('https://soreha.so/');
	expect(pattern2.apply('それはそう')).toBe('https://soreha.so/');
	expect(pattern2.apply('それ')).toBe(null);
	expect(pattern2.apply('それはそう。')).toBe(null);
});
