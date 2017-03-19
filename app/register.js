'use strict';

import inquirer from 'inquirer';
import co from 'co';
import first from 'lodash/first';
import hue from 'node-hue-api';
import jsonfile from 'jsonfile';

class Registrar {

    * init() {
        this.bridges = yield hue.nupnpSearch();
        this.hostname = first(this.bridges).ipaddress;
        this.api = new hue.HueApi();
    }

    * registerApp(appDescription) {
        return this.api.registerUser(this.hostname, appDescription);
    }

    * generateSettings(appToken, lightName, defaultTransitionTime, timeZone) {
        const settings = {
            'app-token': appToken,
            'transition-ms': defaultTransitionTime,
            'time-zone': timeZone,
            jobs: {
                'generated-job': {
                    enabled: true,
                    light: lightName,
                    type: 'GRADIENT',
                    cron: '00 */1 6-16 * * *',
                    gradient: {
                        start: {
                            time: {
                                hour: 6,
                                minute: 0,
                                second: 0
                            },
                            preset: 'ENERGIZE',
                        },
                        end: {
                          time: {
                            hour: 16,
                            minute: 59,
                            second: 59
                          },
                          preset: 'RELAX',
                        }
                    },
                },
            },
        };
        jsonfile.writeFileSync(`${__dirname}/../settings.json`, settings, { spaces: 2 });
    }

    register(input) {
        co.wrap(function* (that) {
            yield that.init();
            const appToken = yield that.registerApp(input.appDescription);
            yield that.generateSettings(appToken, input.lightName, input.defaultTransitionTime, input.timeZone);
        })(this)
        .then(() => {
            console.log('All done! Now check and modify the generated settings.json. Then run "npm start".');
        })
        .catch((err) => {
            console.error('Something went wrong!', err);
        });
    }

}

const questions = [
    {
        type: 'input',
        name: 'appDescription',
        message: 'What is the name of the app you want to register?',
        default: 'MyHueApp',
    },
    {
        type: 'input',
        name: 'lightName',
        message: 'What is the name your the light?',
        default: 'Kitchen',
    },
    {
        type: 'input',
        name: 'defaultTransitionTime',
        message: 'What is the default transition time (in ms) for all jobs?',
        validate: (value) => {
            const valid = !isNaN(parseFloat(value));
            return valid || 'Please enter a number';
        },
        filter: Number,
        default: 2000,
    },
    {
        type: 'input',
        name: 'timeZone',
        message: 'In what timezone will your app run?',
        default: 'America/Los_Angeles',
    },
    {
        type: 'confirm',
        name: 'clicked',
        message: 'Have you clicked the link button on your Hue bridge?',
        default: false,
    }
];

inquirer.prompt(questions).then((answers) => {
    if (answers.clicked) {
        const registrar = new Registrar();
        registrar.register(answers);
    } else {
        console.log('Go click on the link button, would ya?');
    }
});



