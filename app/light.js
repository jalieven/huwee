'use strict';

import filter from 'lodash/filter';
import get from 'lodash/get';
import assign from 'lodash/assign';
import reduce from 'lodash/reduce';
import first from 'lodash/first';
import range from 'lodash/range';

import hue from 'node-hue-api';

const delay = (ms) => new Promise(resolve => setTimeout(() => resolve(true), ms));

class Light {

    * init(userToken) {
        this.userToken = userToken;
        this.bridges = yield hue.nupnpSearch();
        const hostname = first(this.bridges).ipaddress;
        this.api = new hue.HueApi(hostname, this.userToken);
    }

    * state(query) {
        const fullState = yield this.api.fullState();
        console.log('full', JSON.stringify(fullState, null, '\t'));
        const lights = reduce(fullState.lights, (res, value, key) => {
            res.push(assign(value, { key }));
            return res;
        }, []);
        if (query && query.path && query.value) {
            return filter(lights, light => get(light, query.path) === query.value);
        } else {
            return lights;
        }
    }

    * getLightIds(names) {
        const result = {};
        for (let name of names) {
            const lightState = yield this.state({ path: 'name', value: name });
            const key = (first(lightState) || {}).key;
            result[name] = key;
        }
        return result;
    }

    * longAlert(lightId, r, g, b) {
        const state = hue.lightState.create();
        yield this.api.setLightState(lightId, state.brightness(100).rgb(r, g, b));
        yield this.api.setLightState(lightId, state.longAlert());
        yield this.reset(2, 15000);
    }

    * shortAlert(lightId, r, g, b) {
        const state = hue.lightState.create();
        yield this.api.setLightState(lightId, state.ct(153).brightness(100).rgb(r, g, b));
        yield delay(500);
        yield this.api.setLightState(lightId, state.shortAlert());
        yield delay(500);
        yield this.reset(2, 500);
    }

    * colorloop(lightId, count) {
        const runs = range(0, count);
        for (let run of runs) {
            yield this.api.setLightState(lightId, { effect: 'colorloop' });
            yield delay(20000);
        }
        yield this.reset(lightId, 500);
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

    * pulse(lightId, pulseTime, count, r1, g1, b1, r2, g2, b2) {
        const pulseState = hue.lightState.create();
        const runs = range(0, count);
        for (let run of runs) {
            yield this.api.setLightState(lightId, pulseState.transition(pulseTime).rgb(r1, g1, b1).brightness(100));
            yield delay(pulseTime);
            if (r1 && g2 && b2) {
                yield this.api.setLightState(lightId, pulseState.transition(pulseTime).rgb(r2, g2, b2).brightness(100));
            } else {
                yield this.api.setLightState(lightId, pulseState.transition(pulseTime).rgb(255, 255, 255).brightness(100));
            }
            yield delay(pulseTime);
        }
        yield this.reset(lightId, 200);
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

    * reset(lightId, msDelay, msTransition = 2000) {
        const resetState = hue.lightState.create();
        if (msDelay) {
            yield delay(msDelay);
        }
        yield this.api.setLightState(lightId, resetState.transition(msTransition).effect('none').xy(0.4573, 0.41).brightness(100));
    }

}

export default Light;