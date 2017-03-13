'use strict';

import co from 'co';
import { CronJob } from 'cron';
import moment from 'moment';
import Alert from './alert';

const appKey = '<your_app_key>';

const hourRange = {
  start: 6,
  stop: 21
};
const minuteCron = '*/1';
const transitionMs = 50000;

const WHITES = {
    ENERGIZE: [156, 254, 41432, 75, 0.3146, 0.3304],
    CONCENTRATE: [233, 254, 39391, 14, 0.3682, 0.3715],
    READ: [346, 254, 8595, 121, 0.4452, 0.4068],
    RELAX: [447, 144, 7688, 199, 0.5014, 0.4153],
};

const mapRange = (from, to, point) => {
  return to[0] + (point - from[0]) * (to[1] - to[0]) / (from[1] - from[0]);
}

const minutesSinceHour = (hour) => {
  const now = moment();
  const hourOfTheDay = now.clone().hour(hour).minute(0).second(0);
  return now.diff(hourOfTheDay, 'minutes');
}

const run = (color) => {
  const alert = new Alert();
  co(function* () {
      yield alert.init(appKey);
      const state = yield alert.state();
      const kitchenLight = state.lights['2'];
      console.log(JSON.stringify(kitchenLight, null, '\t'));
      yield alert.toColorBHS(2, transitionMs, ...color);
      // yield alert.reset(2, 2000);
  }).then(() => {
      console.log('DONE');
  });
}

// 360 is six in the morning
// 1080 midnight

const job = new CronJob({
  cronTime: `00 ${minuteCron} * * * *`,
  onTick: () => {
    const minute = minutesSinceHour(hourRange.start);
    const startMinutes = 0;
    const stopMinutes = (hourRange.stop * 60) - startMinutes;
    console.log('day minute', minute, startMinutes, stopMinutes);
    if (minute < 0) {
      console.log('RELAX');
      run(WHITES.RELAX);
    } else if (minute >= 0 && minute < stopMinutes) {
      const ct = mapRange([startMinutes, stopMinutes], [156, 447], minute);
      const b = mapRange([startMinutes, stopMinutes], [254, 144], minute);
      const h = mapRange([startMinutes, stopMinutes], [41432, 7688], minute);
      const s = mapRange([startMinutes, stopMinutes], [75, 199], minute);
      const x = mapRange([startMinutes, stopMinutes], [0.3146, 0.5014], minute);
      const y = mapRange([startMinutes, stopMinutes], [0.3146, 0.4153], minute);
      const color = [ct, b, h, s, x, y];
      console.log('COLOR', color);
      run(color);
    } else if (minute >= stopMinutes) {
      console.log('RELAX');
      run(WHITES.RELAX);
    }
  },
  start: true
});
job.start();
