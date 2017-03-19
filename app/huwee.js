'use strict';

import co from 'co';
import { CronJob } from 'cron';
import first from 'lodash/first';
import map from 'lodash/map';
import mapValues from 'lodash/mapValues';
import values from 'lodash/values';
import uniq from 'lodash/uniq';
import forEach from 'lodash/forEach';

import Lights from './lights';
import Groups from './groups';
import log from './log';
import { PRESETS, JOB_TYPES, ALERT_TYPES } from './const';
import { mapGradient, validateSettings } from './util';

class Huwee {

	constructor(settings = {}) {
		const validationErrors = validateSettings(settings);
		if (validationErrors) {
			log.error({ errors: validationErrors }, 'Invalid settings.json!');
		} else {
			this.settings = settings;
		}
	}

	* bootstrapJobs() {
		const lightNames = uniq(values(mapValues(this.settings.jobs, 'light')));
		const groupNames = uniq(values(mapValues(this.settings.jobs, 'group')));
		const lightIds = yield this.lights.getLightIds(lightNames);
		const groupIds = yield this.groups.getGroupIds(groupNames);
		return map(this.settings.jobs, (setting, name) => {
			log.info({ message: `Bootstrapping job '${name}' [${setting.enabled ? 'ENABLED' : 'DISABLED'}]`});
			return new CronJob({
				cronTime: setting.cron,
				start: setting.enabled,
				timeZone: this.settings['time-zone'],
				onTick: () => {
					co.wrap(function* (that) {
						log.info({ message: `Start job '${name}'...`});
						const lightId = lightIds[setting.light];
						const groupId = groupIds[setting.group];
						const transitionTime = setting['transition-ms'] || that.settings['transition-ms'];
						switch(setting.type) {
							case JOB_TYPES.PRESET: {
								if (lightId) {
									log.info({ message: `Light '${setting.light}' with id '${lightId}' to preset '${setting.preset}'`});
									yield that.lights.toColorBHS(lightId, transitionTime, ...PRESETS[setting.preset]);
								}
								if (groupId) {
									log.info({ message: `Group '${setting.group}' with id '${groupId}' to preset '${setting.preset}'`});
									yield that.groups.toColorBHS(groupId, transitionTime, ...PRESETS[setting.preset]);
								}
								break;
							}
							case JOB_TYPES.COLORLOOP: {
								if (lightId) {
									log.info({ message: `Light '${setting.light}' with id '${lightId}' colorlooping ${setting.count} times`});
									yield that.lights.colorloop(lightId, setting.count);
								}
								if (groupId) {
									log.info({ message: `Group '${setting.group}' with id '${groupId}' colorlooping ${setting.count} times`});
									yield that.groups.colorloop(groupId, setting.count);
								}
								break;
							}
							case JOB_TYPES.ON: {
								if (lightId) {
									log.info({ message: `Light '${setting.light}' with id '${lightId}' on`});
									yield that.lights.on(lightId, transitionTime);
								}
								if (groupId) {
									log.info({ message: `Group '${setting.group}' with id '${groupId}' on`});
									yield that.groups.on(groupId, transitionTime);
								}
								break;
							}
							case JOB_TYPES.OFF: {
								if (lightId) {
									log.info({ message: `Light '${setting.light}' with id '${lightId}' off`});
									yield that.lights.off(lightId, transitionTime);
								}
								if (groupId) {
									log.info({ message: `Group '${setting.group}' with id '${groupId}' off`});
									yield that.groups.off(groupId, transitionTime);
								}
								break;
							}
							case JOB_TYPES.GRADIENT: {
								const start = setting.gradient.start;
								const end = setting.gradient.end;
								const gradientColor = mapGradient(that.settings['time-zone'], start, end);
								if (gradientColor) {
									if (lightId) {
										log.info({ message: `Light '${setting.light}' with id '${lightId}' sliding on the gradient (${gradientColor})`});
										yield that.lights.toColorBHS(lightId, transitionTime, ...gradientColor);
									}
									if (groupId) {
										log.info({ message: `Group '${setting.group}' with id '${groupId}' sliding on the gradient (${gradientColor})`});
										yield that.groups.toColorBHS(groupId, transitionTime, ...gradientColor);
									}
								} else {
									log.warn({ message: `Gradient start and end setting for light ${setting.light} is inefficient, compare with cron setting plz...`});
								}
								break;
							}
							case JOB_TYPES.PULSE: {
								const pulseTime = setting.pulse['pulse-duration-ms'];
								const pulseCount = setting.pulse['count'];
								const fromPreset = setting.pulse['from'];
								const toPreset = setting.pulse['to'];
								if (lightId) {
									log.info({ message: `Light '${setting.light}' with id '${lightId}' pulses ${pulseCount} times from preset '${fromPreset}' to preset '${toPreset}'`});
									yield that.lights.pulse(lightId, pulseTime, pulseCount, ...PRESETS[fromPreset], ...PRESETS[toPreset]);
								}
								if (groupId) {
									log.info({ message: `Group '${setting.group}' with id '${groupId}' pulses ${pulseCount} times from preset '${fromPreset}' to preset '${toPreset}'`});
									yield that.groups.pulse(groupId, pulseTime, pulseCount, ...PRESETS[fromPreset], ...PRESETS[toPreset]);
								}
							}
							case JOB_TYPES.ALERT: {
								const alertType = setting.alert.type;
								const preset = setting.alert.preset;
								if (lightId) {
									log.info({ message: `Light '${setting.light}' with id '${lightId}' alerts of type '${alertType}' with preset '${preset}'`});
									if (alertType === 'SHORT') {
										console.log(PRESETS[preset]);
										yield that.lights.shortAlert(lightId, ...PRESETS[preset]);
									} else if (alertType === 'LONG') {
										yield that.lights.longAlert(lightId, ...PRESETS[preset]);
									}
								}
								if (groupId) {
									log.info({ message: `Group '${setting.group}' with id '${groupId}' alerts of type '${alertType}' with preset '${preset}'`});
									if (alertType === 'SHORT') {
										yield that.groups.shortAlert(groupId, ...PRESETS[preset]);
									} else if (alertType === 'LONG') {
										yield that.groups.longAlert(groupId, ...PRESETS[preset]);
									}
								}
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
			if (that.settings) {
				that.lights = new Lights();
				yield that.lights.init(that.settings['app-token']);
				that.groups = new Groups();
				yield that.groups.init(that.settings['app-token']);
				const jobs = yield that.bootstrapJobs();
			} else {
				log.error('Failed to bootstrap jobs!');
			}
		})(this)
		.then(() => {
			log.info('Done bootstrapping jobs.');
		})
		.catch((err) => {
			log.error(err);
		});
	}

}

export default Huwee;