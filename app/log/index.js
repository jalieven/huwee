'use strict';

import bunyan from 'bunyan';

let level = (process.env.NODE_ENV === 'production') ? 'info' : 'debug';
if (process.env.DISABLE_LOG) level = bunyan.FATAL + 1;

export default bunyan.createLogger({
	src: process.env.NODE_ENV !== 'production',
	level: level,
	name: 'huwee',
	streams: [{
		path: '/tmp/huwee.log',
	}],
});
