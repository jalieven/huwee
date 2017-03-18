'use strict';

import filter from 'lodash/filter';
import includes from 'lodash/includes';
import get from 'lodash/get';
import assign from 'lodash/assign';
import reduce from 'lodash/reduce';
import first from 'lodash/first';
import range from 'lodash/range';

import hue from 'node-hue-api';

import { delay } from './util';

class Lights {

    * init(userToken) {
        this.userToken = userToken;
        this.bridges = yield hue.nupnpSearch();
        const hostname = first(this.bridges).ipaddress;
        this.api = new hue.HueApi(hostname, this.userToken);
    }

    * state(query) {
        const state = yield this.api.lights();
        // console.log('full', JSON.stringify(state, null, '\t'));
        if (query && query.path && query.value) {
            return filter(state.lights, light => get(light, query.path) === query.value);
        } else {
            return state.lights;
        }
    }

    * getLightState(lightId) {
        const light = yield this.state({ path: 'id', value: lightId });
        return (first(light) || {}).state;
    }

    * getLightIds(names) {
        const lightsState = yield this.state();
        return reduce(lightsState, (res, light) => {
            if (includes(names, light.name)) {
                return assign(res, { [light.name]: light.id });
            } else {
                return res;
            }
        }, {});
    }

    * longAlert(lightId, r, g, b) {
        const previousState = yield this.getLightState(lightId);
        const state = hue.lightState.create();
        yield this.api.setLightState(lightId, state.brightness(100).rgb(r, g, b));
        yield this.api.setLightState(lightId, state.longAlert());
        yield this.reset(2, 15000, previousState);
    }

    * shortAlert(lightId, r, g, b) {
        const previousState = yield this.getLightState(lightId);
        const state = hue.lightState.create();
        yield this.api.setLightState(lightId, state.ct(153).brightness(100).rgb(r, g, b));
        yield delay(500);
        yield this.api.setLightState(lightId, state.shortAlert());
        yield delay(500);
        yield this.reset(2, 500, previousState);
    }

    * colorloop(lightId, count) {
        const previousState = yield this.getLightState(lightId);
        const runs = range(0, count);
        for (let run of runs) {
            yield this.api.setLightState(lightId, { effect: 'colorloop' });
            yield delay(20000);
        }
        yield this.reset(lightId, 500, previousState);
    }

    * toColorRGB(lightId, transitionTime, temp, brightness, r, g, b) {
        const state = hue.lightState.create();
        const colorState = state.ct(temp).brightness(brightness).rgb(r, g, b).transition(transitionTime);
        yield this.api.setLightState(lightId, colorState);
        yield delay(transitionTime);
    }

    * toColorBHS(lightId, transitionTime, ct, b, h, s, x, y) {
        const state = hue.lightState.create();
        const colorState = state.transition(transitionTime).bri(b).hue(h).sat(s).xy(x, y).ct(ct);
        yield this.api.setLightState(lightId, colorState);
        yield delay(transitionTime);
    }

    * pulse(lightId, pulseTime, count, ct1, b1, h1, s1, x1, y1, ct2, b2, h2, s2, x2, y2) {
        const previousState = yield this.getLightState(lightId);
        const pulseState = hue.lightState.create();
        const runs = range(0, count);
        for (let run of runs) {
            yield this.api.setLightState(lightId, pulseState.transition(pulseTime).bri(b1).hue(h1).sat(s1).xy(x1, y1).ct(ct1));
            yield delay(pulseTime);
            if (ct2 && b2 && h2 && s2 && x2 && y2) {
                yield this.api.setLightState(lightId, pulseState.transition(pulseTime).bri(b2).hue(h2).sat(s2).xy(x2, y2).ct(ct2));
            } else {
                yield this.api.setLightState(lightId, pulseState.transition(pulseTime).xy(0.4573, 0.41).brightness(100));
            }
            yield delay(pulseTime);
        }
        yield this.reset(lightId, 200, previousState, pulseTime);
    }

    * off(lightId, transitionTime) {
        const state = hue.lightState.create();
        yield this.api.setLightState(lightId, state.off().transition(transitionTime));
        yield delay(transitionTime);
    }

    * on(lightId, transitionTime) {
        const state = hue.lightState.create();
        yield this.api.setLightState(lightId, state.on().transition(transitionTime));
        yield delay(transitionTime);
    }

    * reset(lightId, msDelay, toState, msTransition = 1000) {
        const resetState = hue.lightState.create();
        if (msDelay) {
            yield delay(msDelay);
        }
        if (toState) {
            const { ct, bri, sat, xy } = toState;
            yield this.api.setLightState(lightId, resetState.transition(msTransition).effect('none').bri(bri).hue(toState.hue).sat(sat).xy(...xy).ct(ct));
        } else {
            yield this.api.setLightState(lightId, resetState.transition(msTransition).effect('none').xy(0.4573, 0.41).brightness(100));
        }
    }

}

export default Lights;