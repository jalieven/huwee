'use strict';

import co from 'co';
import { CronJob } from 'cron';
import first from 'lodash/first';
import map from 'lodash/map';
import mapValues from 'lodash/mapValues';
import values from 'lodash/values';
import uniq from 'lodash/uniq';
import forEach from 'lodash/forEach';

import Light from './light';
import { PRESETS } from './const';
import { mapGradient } from './util';

class Huwee {

	constructor(settings = {}) {
		this.settings = settings;
		this.light = new Light();
	}

	* bootstrapJobs() {
		const lightNames = uniq(values(mapValues(this.settings.jobs, 'light')));
		const lightIds = yield this.light.getLightIds(lightNames);
		return map(this.settings.jobs, (setting, name) => {
			return new CronJob({
				cronTime: setting.cron,
				start: setting.enabled,
				onTick: () => {
					co.wrap(function* (that) {
						console.log(`'${name}' TICK START`);
						const lightId = lightIds[setting.light];
						const transitionTime = setting['transition-ms'] || 2000;
						switch(setting.type) {
							case 'preset': {
								yield that.light.toColorBHS(lightId, transitionTime, ...PRESETS[setting.preset]);
								break;
							}
							case 'color-loop': {
								yield that.light.colorloop(lightId, setting.count);
								break;
							}
							case 'on': {
								yield that.light.on(lightId, transitionTime);
								break;
							}
							case 'off': {
								yield that.light.off(lightId, transitionTime);
								break;
							}
							case 'gradient': {
								const start = setting.gradient.start;
								const end = setting.gradient.end;
								const gradientColor = mapGradient(start, end);
								if (gradientColor) {
									yield that.light.toColorBHS(2, transitionTime, ...gradientColor);
								}
								break;
							}
						}
					})(this)
					.then(() => {
						console.log(`'${name}' TICK DONE`);
					})
					.catch((err) => {
						console.error(err);
					});
				},
			});
		});
	}

	run() {
		co.wrap(function* (that) {
			yield that.light.init(that.settings['app-token']);
			const jobs = yield that.bootstrapJobs();
		})(this)
		.then(() => {
			console.log('JOBS STARTED');
		})
		.catch((err) => {
			console.error(err);
		});
	}

}

export default Huwee;