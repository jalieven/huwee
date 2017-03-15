'use strict';

import moment from 'moment';
import { mapRange, validateSettings } from '../app/util';

describe('Util', () => {

	it('tests mapRange', () => {
		expect(mapRange([0, 10], [0, 1], 5)).to.eql(.5);
		expect(mapRange([-1, 0], [0, 1], -.1)).to.eql(.9);
		expect(mapRange([0, 2], [0, 100], 1.5)).to.eql(75);
	});

	it('tests the validation (mandatory stuff)', () => {
		const errors = validateSettings({});
		const expected = [
			{
				selector: 'app-token',
				tip: 'app-token is mandatory.',
			},
			{
				selector: 'jobs',
				tip: 'jobs is mandatory.',
			},
			{
				selector: 'jobs.*.enabled',
				tip: 'jobs.*.enabled is mandatory.',
			},
			{
				selector: 'jobs.*.light',
				tip: 'jobs.*.light is mandatory.',
			},
			{
				selector: 'jobs.*.type',
				tip: 'jobs.*.type is mandatory.',
			},
			{
				selector: 'jobs.*.cron',
				tip: 'jobs.*.cron is mandatory.',
			},
		];
		expect(errors).to.eql(expected);
	});

	it('tests the validation (typed stuff)', () => {
		const errors = validateSettings({
			'app-token': '<your-app-token>',
			jobs: {
				'simple-preset-job': {
					enabled: 'on',
					type: 'unknown',
					cron: '*/5 * * * * *',
					preset: true,
					'transition-ms': 'long'
				}
			}
		});
		const expected = [
			{
				selector: 'jobs.*.light',
				tip: 'jobs.*.light is mandatory.',
			},
			{
				path: [
					'jobs',
					'simple-preset-job',
					'enabled',
				],
				tip: 'Job enabled must be a boolean.',
			},
			{
				path: [
					'jobs',
					'simple-preset-job',
					'type',
				],
				tip: `Invalid job type. Valid types are: ON, OFF, PRESET, GRADIENT, COLORLOOP`,
			},
			{
				path: [
					'jobs',
					'simple-preset-job',
					'transition-ms',
				],
				tip: 'Job transition-ms must be a number.',
			},
			{
				path: [
					'jobs',
					'simple-preset-job',
					'preset',
				],
				tip: 'Invalid job preset. Valid presets are: STANDARD, ENERGIZE, CONCENTRATE, READ, RELAX, NIGHTLIGHT',
			},
		];
		expect(errors).to.eql(expected);
	});

});