'use strict';

import Huwee from '../app/huwee';

describe('Huwee', () => {

	it('tests constructJobs', () => {
		const settings = {
			TestOne: {
				light: 'Kitchen',
				type: 'point',
				cron: '* * * * * *',
			},
		};
		const huwee = new Huwee(settings);
		const jobs = huwee.constructJobs();
		console.log('-------jobs-------->', jobs);
	});

});