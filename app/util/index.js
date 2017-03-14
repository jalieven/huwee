'use strict';

import moment from 'moment';
import { PRESETS } from '../const';

export const mapRange = (from, to, point) => {
	return to[0] + (point - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
}

export const mapGradient = (start, end) => {
    const now = moment();
    const startPreset = PRESETS[start.preset];
    const endPreset = PRESETS[end.preset];
    const startTime = moment().hour(start.time.hour).minute(start.time.minute).second(start.time.second);
    const endTime = moment().hour(end.time.hour).minute(end.time.minute).second(end.time.second);
    const secondsSinceStart = moment().diff(startTime, 'seconds');
    console.log("secondsSinceStart", secondsSinceStart);
    const startSeconds = 0;
    const stopSeconds = endTime.diff(startTime, 'seconds');
    console.log('stopSeconds', stopSeconds);
    if (secondsSinceStart > startSeconds && secondsSinceStart < stopSeconds) {
        console.log('startPreset ct', startPreset[0]);
        const ct = mapRange([startSeconds, stopSeconds], [startPreset[0], endPreset[0]], secondsSinceStart);
        const b = mapRange([startSeconds, stopSeconds], [startPreset[1], endPreset[1]], secondsSinceStart);
        const h = mapRange([startSeconds, stopSeconds], [startPreset[2], endPreset[2]], secondsSinceStart);
        const s = mapRange([startSeconds, stopSeconds], [startPreset[3], endPreset[3]], secondsSinceStart);
        const x = mapRange([startSeconds, stopSeconds], [startPreset[4], endPreset[4]], secondsSinceStart);
        const y = mapRange([startSeconds, stopSeconds], [startPreset[5], endPreset[5]], secondsSinceStart);
        console.log('Gradient color', [ct, b, h, s, x, y]);
        return [ct, b, h, s, x, y];
    }
    return undefined;
}

// deprecated
export const minutesSinceHour = (hour, minute) => {
	const now = moment();
	const hourOfTheDay = now.clone().hour(hour).minute(minute).second(0);
	return now.diff(hourOfTheDay, 'minutes');
}