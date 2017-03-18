'use strict';

import filter from 'lodash/filter';
import find from 'lodash/find';
import includes from 'lodash/includes';
import get from 'lodash/get';
import assign from 'lodash/assign';
import reduce from 'lodash/reduce';
import first from 'lodash/first';
import range from 'lodash/range';

import hue from 'node-hue-api';

import { delay } from './util';

class Groups {

    * init(userToken) {
        this.userToken = userToken;
        this.bridges = yield hue.nupnpSearch();
        const hostname = first(this.bridges).ipaddress;
        this.api = new hue.HueApi(hostname, this.userToken);
    }

    * state(query) {
        const groups = yield this.api.groups();
        // console.log('full', JSON.stringify(groups, null, '\t'));
        if (query && query.path && query.value) {
            return filter(groups, group => get(group, query.path) === query.value);
        } else {
            return groups;
        }
    }

    * getGroupState(groupId) {
        const group = yield this.state({ path: 'id', value: groupId });
        const lightsState = yield this.api.lights();
        const groupLightIds = (first(group) || {}).lights;
        const groupState = [];
        for (let id of groupLightIds) {
            const light = find(lightsState.lights, l => l.id === id);
            if (light) {
                groupState.push({ id: light.id, state: light.state });
            }
        }
        return groupState;
    }

    * getGroupIds(names) {
        const groupsState = yield this.state();
        return reduce(groupsState, (res, group) => {
            if (includes(names, group.name)) {
                return assign(res, { [group.name]: group.id });
            } else {
                return res;
            }
        }, {});
    }

    * longAlert(groupId, r, g, b) {
        const previousState = yield this.getGroupState(groupId);
        const state = hue.lightState.create();
        yield this.api.setGroupLightState(groupId, state.brightness(100).rgb(r, g, b));
        yield this.api.setGroupLightState(groupId, state.longAlert());
        yield this.reset(2, 15000, previousState);
    }

    * shortAlert(groupId, r, g, b) {
        const previousState = yield this.getGroupState(groupId);
        const state = hue.lightState.create();
        yield this.api.setGroupLightState(groupId, state.ct(153).brightness(100).rgb(r, g, b));
        yield delay(500);
        yield this.api.setGroupLightState(groupId, state.shortAlert());
        yield delay(500);
        yield this.reset(2, 500, previousState);
    }

    * colorloop(groupId, count) {
        const previousState = yield this.getGroupState(groupId);
        const runs = range(0, count);
        for (let run of runs) {
            yield this.api.setGroupLightState(groupId, { effect: 'colorloop' });
            yield delay(20000);
        }
        yield this.reset(groupId, 500, previousState);
    }

    * toColorRGB(groupId, transitionTime, temp, brightness, r, g, b) {
        const state = hue.lightState.create();
        const colorState = state.ct(temp).brightness(brightness).rgb(r, g, b).transition(transitionTime);
        yield this.api.setGroupLightState(groupId, colorState);
        yield delay(transitionTime);
    }

    * toColorBHS(groupId, transitionTime, ct, b, h, s, x, y) {
        const state = hue.lightState.create();
        const colorState = state.transition(transitionTime).bri(b).hue(h).sat(s).xy(x, y).ct(ct);
        yield this.api.setGroupLightState(groupId, colorState);
        yield delay(transitionTime);
    }

    * pulse(groupId, pulseTime, count, ct1, b1, h1, s1, x1, y1, ct2, b2, h2, s2, x2, y2) {
        const previousState = yield this.getGroupState(groupId);
        const pulseState = hue.lightState.create();
        const runs = range(0, count);
        for (let run of runs) {
            yield this.api.setGroupLightState(groupId, pulseState.transition(pulseTime).bri(b1).hue(h1).sat(s1).xy(x1, y1).ct(ct1));
            yield delay(pulseTime);
            if (ct2 && b2 && h2 && s2 && x2 && y2) {
                yield this.api.setGroupLightState(groupId, pulseState.transition(pulseTime).bri(b2).hue(h2).sat(s2).xy(x2, y2).ct(ct2));
            } else {
                yield this.api.setGroupLightState(groupId, pulseState.transition(pulseTime).xy(0.4573, 0.41).brightness(100));
            }
            yield delay(pulseTime);
        }
        yield this.reset(groupId, 200, previousState, pulseTime);
    }

    * off(groupId, transitionTime) {
        const state = hue.lightState.create();
        yield this.api.setGroupLightState(groupId, state.off().transition(transitionTime));
        yield delay(transitionTime);
    }

    * on(groupId, transitionTime) {
        const state = hue.lightState.create();
        yield this.api.setGroupLightState(groupId, state.on().transition(transitionTime));
        yield delay(transitionTime);
    }

    * reset(groupId, msDelay, toState, msTransition = 1000) {
        const resetState = hue.lightState.create();
        if (msDelay) {
            yield delay(msDelay);
        }
        if (toState) {
            for (let light of toState) {
                const { ct, bri, sat, xy } = light.state;
                yield this.api.setLightState(light.id, resetState.transition(msTransition).effect('none').bri(bri).hue(light.state.hue).sat(sat).xy(...xy).ct(ct));
            }
        } else {
            yield this.api.setGroupLightState(groupId, resetState.transition(msTransition).effect('none').xy(0.4573, 0.41).brightness(100));
        }
    }

}

export default Groups;