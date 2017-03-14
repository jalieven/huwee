'use strict';

// format here is [r, g, b]
export const COLORS = {
    RED: [226, 27, 27],
    GREEN: [27, 226, 27],
    BLUE: [27, 27, 226],
    YELLOW: [255, 234, 0],
};

// format here is [ct, b, h, s, x, y] (TODO check if x and y aren't superfluous)
export const PRESETS = {
    ENERGIZE: [156, 254, 41432, 75, 0.3146, 0.3304],
    CONCENTRATE: [233, 254, 39391, 14, 0.3682, 0.3715],
    READ: [346, 254, 8595, 121, 0.4452, 0.4068],
    RELAX: [447, 144, 7688, 199, 0.5014, 0.4153],
    NIGHTLIGHT: [153, 18, 2917, 218, 0.5964, 0.3563],
};
