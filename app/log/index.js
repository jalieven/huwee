'use strict';

import bunyan from 'bunyan';
import settings from '../../settings';

let level = (process.env.NODE_ENV === 'production') ? 'info' : 'debug';
if (process.env.DISABLE_LOG) level = bunyan.FATAL + 1;

let logOptions = {
    src: process.env.NODE_ENV !== 'production',
    level: level,
    name: 'huwee',
    stream: process.stdout,
};
if (settings['log-file']) {
    logOptions = {
        src: process.env.NODE_ENV !== 'production',
        level: level,
        name: 'huwee',
        streams: [{
            path: settings['log-file'],
        }],
    }
}

export default bunyan.createLogger(logOptions);
