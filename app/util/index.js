'use strict';

import moment from 'moment';
import has from 'lodash/has';
import includes from 'lodash/includes';
import isBoolean from 'lodash/isBoolean';
import isEmpty from 'lodash/isEmpty';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import keys from 'lodash/keys';
import LysisChain from 'lysis/chain';
import { not, or } from 'lysis/util';

import { COLORS, PRESETS, JOB_TYPES } from '../const';

export const delay = (ms) => new Promise(resolve => setTimeout(() => resolve(true), ms));

export const mapRange = (from, to, point) => {
	return to[0] + (point - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
}

export const mapGradient = (timeZone, start, end) => {
    const now = moment().tz(timeZone);
    const startPreset = PRESETS[start.preset];
    const endPreset = PRESETS[end.preset];
    const startTime = moment().tz(timeZone).hour(start.time.hour).minute(start.time.minute).second(start.time.second);
    const endTime = moment().tz(timeZone).hour(end.time.hour).minute(end.time.minute).second(end.time.second);
    const secondsSinceStart = moment().tz(timeZone).diff(startTime, 'seconds');
    const startSeconds = 0;
    const stopSeconds = endTime.diff(startTime, 'seconds');
    if (secondsSinceStart > startSeconds && secondsSinceStart < stopSeconds) {
        const ct = mapRange([startSeconds, stopSeconds], [startPreset[0], endPreset[0]], secondsSinceStart);
        const b = mapRange([startSeconds, stopSeconds], [startPreset[1], endPreset[1]], secondsSinceStart);
        const h = mapRange([startSeconds, stopSeconds], [startPreset[2], endPreset[2]], secondsSinceStart);
        const s = mapRange([startSeconds, stopSeconds], [startPreset[3], endPreset[3]], secondsSinceStart);
        const x = mapRange([startSeconds, stopSeconds], [startPreset[4], endPreset[4]], secondsSinceStart);
        const y = mapRange([startSeconds, stopSeconds], [startPreset[5], endPreset[5]], secondsSinceStart);
        return [ct, b, h, s, x, y];
    }
    return undefined;
}

export const validateSettings = settings => {
    const mandatorySelectors = [
        'app-token',
        'time-zone',
        'jobs',
        'jobs.*.enabled',
        'jobs.*.type',
        'jobs.*.cron'
    ];
    const validateJobTypes = type => includes(keys(JOB_TYPES), type);
    const validateJobPresets = preset => includes(keys(PRESETS), preset);
    const validateJobColor = color => includes(keys(COLORS), color);
    const validateJobLight = job => has(job, 'light');
    const validateJobGroup = job => has(job, 'group');
    return new LysisChain(settings)
        .mandatory(mandatorySelectors)
        .validate('app-token', isString, `App-token must be a string.`)
        .validate('time-zone', isString, `Time-zone must be a string.`)
        .validate('transition-ms', isNumber, `Default transition-ms must be a number.`)
        .validate('jobs.*', or(validateJobLight, validateJobGroup), `Job must have property 'light' or 'group'.`)
        .validate('jobs.*.enabled', isBoolean, `Job enabled must be a boolean.`)
        .validate('jobs.*.type', validateJobTypes, `Invalid job type. Valid types are: ${keys(JOB_TYPES).join(', ')}`)
        .validate('jobs.*.light', isString, `Job light must be a string.`)
        .validate('jobs.*.light', not(isEmpty), `Job light can't be empty.`)
        .validate('jobs.*.cron', isString, `Job cron must be a string.`)
        .validate('jobs.*.cron', not(isEmpty), `Job cron can't be empty.`)
        .validate('jobs.*.transition-ms', isNumber, `Job transition-ms must be a number.`)
        .validate('jobs.*.preset', validateJobPresets, `Invalid job preset. Valid presets are: ${keys(PRESETS).join(', ')}`)
        .validate('jobs.*.pulse.pulse-duration-ms', isNumber, `Pulse duration must be a number.`)
        .validate('jobs.*.pulse.count', isNumber, `Pulse count must be a number.`)
        .validate('jobs.*.pulse.from', validateJobColor, `Invalid job color. Valid colors are: ${keys(COLORS).join(', ')}`)
        .validate('jobs.*.pulse.to', validateJobColor, `Invalid job color. Valid colors are: ${keys(COLORS).join(', ')}`)
        .errors();
}

