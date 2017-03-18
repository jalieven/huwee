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
import log from './log';
import { PRESETS, JOB_TYPES } from './const';
import { mapGradient, validateSettings } from './util';

class Huwee {

	constructor(settings = {}) {
		const validationErrors = validateSettings(settings);
		if (validationErrors) {
			console.log(validationErrors);
			log.error(validationErrors);
			const err = new Error(validationErrors);
			throw err;
		} else {
			this.settings = settings;
			this.light = new Light();
		}
	}

	* bootstrapJobs() {
		const lightNames = uniq(values(mapValues(this.settings.jobs, 'light')));
		const lightIds = yield this.light.getLightIds(lightNames);
		return map(this.settings.jobs, (setting, name) => {
			log.info({ message: `Bootstrapping job '${name}'`});
			return new CronJob({
				cronTime: setting.cron,
				start: setting.enabled,
				timeZone: this.settings['time-zone'],
				onTick: () => {
					co.wrap(function* (that) {
						log.info({ message: `Start job '${name}'...`});
						const lightId = lightIds[setting.light];
						const transitionTime = setting['transition-ms'] || 2000;
						switch(setting.type) {
							case JOB_TYPES.PRESET: {
								log.info({ message: `Light '${setting.light}' with id '${lightId}' to preset '${setting.preset}'`});
								yield that.light.toColorBHS(lightId, transitionTime, ...PRESETS[setting.preset]);
								break;
							}
							case JOB_TYPES.COLORLOOP: {
								log.info({ message: `Light '${setting.light}' with id '${lightId}' colorlooping ${setting.count} times`});
								yield that.light.colorloop(lightId, setting.count);
								break;
							}
							case JOB_TYPES.ON: {
								log.info({ message: `Light '${setting.light}' with id '${lightId}' on`});
								yield that.light.on(lightId, transitionTime);
								break;
							}
							case JOB_TYPES.OFF: {
								log.info({ message: `Light '${setting.light}' with id '${lightId}' off`});
								yield that.light.off(lightId, transitionTime);
								break;
							}
							case JOB_TYPES.GRADIENT: {
								const start = setting.gradient.start;
								const end = setting.gradient.end;
								const gradientColor = mapGradient(start, end);
								if (gradientColor) {
									log.info({ message: `Light '${setting.light}' with id '${lightId}' sliding on the gradient (${gradientColor})`});
									yield that.light.toColorBHS(lightId, transitionTime, ...gradientColor);
								}
								break;
							}
						}
					})(this)
					.then(() => {
						log.info({ message: `Ended job '${name}'`});
					})
					.catch((err) => {
						log.error(err);
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
			log.info('Jobs bootstrapped');
		})
		.catch((err) => {
			log.error(err);
		});
	}

}

export default Huwee;