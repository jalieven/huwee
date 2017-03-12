'use strict';

import _ from 'lodash';
import co from 'co';

import Alert from './alert';

const appKey = '<your_app_key>';

const COLORS = {
    RED: [226, 27, 27],
    GREEN: [27, 226, 27],
    BLUE: [27, 27, 226],
    YELLOW: [255, 234, 0],
};

const WHITES = {
    ENERGIZE: [156, 254, 41432, 75, 0.3146, 0.3304],
    CONCENTRATE: [233, 254, 39391, 14, 0.3682, 0.3715],
    READ: [346, 254, 8595, 121, 0.4452, 0.4068],
};

const alert = new Alert();
co(function* () {
    yield alert.init(appKey);
    // yield alert.short(2, ...COLORS.BLUE);
    const state = yield alert.state();
    const kitchenLight = state.lights['2'];
    console.log(JSON.stringify(kitchenLight, null, '\t'));
    yield alert.toColorBHS(2, 60000, ...WHITES.ENERGIZE);
    const afterState = yield alert.state();
    const kitchenLightAfter = afterState.lights['2'];
    console.log(JSON.stringify(kitchenLightAfter, null, '\t'));
    // yield alert.toColorRGB(2, 20000, 500, ...COLORS.GREEN);
    yield alert.reset(2, 2000);
    // yield alert.pulse(2, 100, 30, ...COLORS.RED);
    // yield alert.colorloop(2, 1);
    // yield alert.longAlert(2, ...COLORS.YELLOW);
    // yield alert.colorloop(3, 1000);
    // yield alert.longAlert(2, ...COLORS.GREEN);
    // yield alert.colorloop(2, 1);
    // yield alert.shortAlert(2, ...COLORS.RED);
}).then(() => {
    console.log('DONE');
});

