'use strict';

// format here is [r, g, b]
export const COLORS = {
    RED: [153, 254, 65084, 254, 0.6783, 0.3019],
    GREEN: [153, 254, 24187, 254, 0.1988, 0.6784],
    BLUE: [153, 254, 46014, 254, 0.154, 0.0806],
    YELLOW: [375, 254, 11160, 254, 0.4641, 0.4791],
    ORANGE: [153, 254, 5281, 254, 0.5839, 0.3891],
    PINK: [500, 254, 60734, 254, 0.5513, 0.2404],
    PURPLE: [153, 254, 52355, 228, 0.3141, 0.1479],
    TURQUOISE: [153, 254, 39542, 250, 0.1626, 0.2786],
};

// format here is [ct, b, h, s, x, y] (TODO check if x and y aren't superfluous)
export const PRESETS = {
    STANDARD: [366, 254, 8418, 140, 0.4573, 0.41],
    ENERGIZE: [156, 254, 41432, 75, 0.3146, 0.3304],
    CONCENTRATE: [233, 254, 39391, 14, 0.3682, 0.3715],
    READ: [346, 254, 8595, 121, 0.4452, 0.4068],
    RELAX: [447, 144, 7688, 199, 0.5014, 0.4153],
    NIGHTLIGHT: [153, 18, 2917, 218, 0.5964, 0.3563],
};

export const JOB_TYPES = {
    ON: 'ON',
    OFF: 'OFF',
    PRESET: 'PRESET',
    GRADIENT: 'GRADIENT',
    COLORLOOP: 'COLORLOOP',
    PULSE: 'PULSE',
    ALERT: 'ALERT',
};

export const ALERT_TYPES = {
    SHORT: 'SHORT',
    LONG: 'LONG'
};
