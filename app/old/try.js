'use strict';

import _ from 'lodash';
import co from 'co';

import Light from './light';

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

const light = new Light();
co(function* () {
    yield light.init(appKey);
    // yield light.short(2, ...COLORS.BLUE);
    const kitchenLight = yield light.state({ path: 'name', value: 'Kitchen' });
    console.log(JSON.stringify(kitchenLight, null, '\t'));
    yield light.toColorBHS(2, 60000, ...WHITES.ENERGIZE);
    const afterState = yield light.state({ path: 'name', value: 'Kitchen' });
    console.log(JSON.stringify(afterState, null, '\t'));
    // yield light.toColorRGB(2, 20000, 500, ...COLORS.GREEN);
    yield light.reset(2, 2000);
    // yield light.pulse(2, 100, 30, ...COLORS.RED);
    // yield light.colorloop(2, 1);
    // yield light.longAlert(2, ...COLORS.YELLOW);
    // yield light.colorloop(3, 1000);
    // yield light.longAlert(2, ...COLORS.GREEN);
    // yield light.colorloop(2, 1);
    // yield light.shortAlert(2, ...COLORS.RED);
}).then(() => {
    console.log('DONE');
});

