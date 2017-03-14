'use strict';

import moment from 'moment';
import { mapRange, minutesSinceHour } from '../app/util';

describe('Util', () => {

	it('tests mapRange', () => {
		expect(mapRange([0, 10], [0, 1], 5)).to.eql(.5);
		expect(mapRange([-1, 0], [0, 1], -.1)).to.eql(.9);
		expect(mapRange([0, 2], [0, 100], 1.5)).to.eql(75);
	});

	it('tests minutesSinceHour (positive)', () => {
		const now = moment();
		const thisHour = now.hour();
		const minutes = now.minute();
		const minutesSince = minutesSinceHour(thisHour);
		expect(minutesSince).to.equal(minutes);
	});

	it('tests minutesSinceHour (negative)', () => {
		const now = moment();
		const thisHour = now.hour();
		const minutes = now.minute();
		const minutesSince = minutesSinceHour(thisHour + 1);
		expect(minutesSince).to.equal((1 + minutes) - 60);
	});

});