const Timespan = require('./timespan');

const zero = new Timespan();
const millisecond = new Timespan({ millis: 1 });
const second = new Timespan({ seconds: 1 });
const minute = new Timespan({ minutes: 1 });
const hour = new Timespan({ hours: 1 });
const days = new Timespan({ days: 1 });
const big1 = new Timespan({
	days: 12,
	hours: 3,
	minutes: 45,
	seconds: 6,
	millis: 789,
});
const big2 = new Timespan({
	days: 89,
	hours: 7,
	minutes: 56,
	seconds: 34,
	millis: 12,
});

test('toString', () => {
	expect(zero.toString()).toBe('0:00');
	expect(millisecond.toString()).toBe('0:00.001');
	expect(second.toString()).toBe('0:01');
	expect(minute.toString()).toBe('1:00');
	expect(hour.toString()).toBe('1:00:00');
	expect(days.toString()).toBe('1:00:00:00');
	expect(big1.toString()).toBe('12:03:45:06.789');
	expect(big2.toString()).toBe('89:07:56:34.012');
});
