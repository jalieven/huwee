'use strict';

import Huwee from '../app/huwee';

describe('Huwee', () => {

	it.skip('tests constructJobs', () => {
		const settings = {
			TestOne: {
				light: 'Kitchen',
				type: 'point',
				cron: '* * * * * *',
			},
		};
		const huwee = new Huwee(settings);
		const jobs = huwee.bootstrapJobs();
		console.log('-------jobs-------->', jobs);
	});

});