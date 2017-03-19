# huwee
Lighting programs for Philips Hue

## Introduction

Since the Hue lights don't retain their scene settings between hardware switches Huwee can
run cron jobs to set different scenes according to the hour. This way you can still use the
hardware switch without losing the scene settingss.
It was initially conceived to make the lights follow a gradient over time (white-blue light
in the morning, dim red light before sleep) to optimize the sleep related hormone melatonin.

## Getting started

First install the dependencies: 'npm install'.
Huwee requires a settings.json to function which contains the different jobs, app-token, etc.
To register your app and generate a simple settings.json simply run: 'npm start register'.
Answer the questions and at the end click on your Hue bridge link button. After this a settings.json
will be generated in the root of this project. See the test-settings.json for different types of jobs.

## Types of jobs

A settings.json file can contain multiple job entries which can be enabled/disabled individually
by providing the boolean. The transition time in ms can be defined globally and can also be overridden
on a per job basis.

### Preset

The preset job makes sure a preset is enforced every time your Hue light is switched off and on again.
In this case it will set the light to the 'NIGHTLIGHT' preset each 10 seconds from midnight up until 6 in the morning.
So when switching on your light with your hardware switch at night will at worst give off 10 seconds of
'unbearable' white light (the preset which you can't configure for Hue lights) after which it will
transform into a very dim yellow light.

```Javascript
{
    ...
    "bedroom-nightlight": {
      "enabled": true,
      "group": "Bedroom",
      "type": "PRESET",
      "cron": "*/10 * 0-5 * * *",
      "preset": "NIGHTLIGHT",
      "transition-ms": 1000
    }
    ...
}
```

### Gradient

The following will change the 'Kitchen' light each 30 seconds from 6 in the morning until 3 in the
afternoon. At 6 it will emit the 'ENERGIZE' preset scene (which is intense white-blue light) and up
until 3 in the afernoon it will have changed into a dim red light.

```Javascript
{
    ...
    "kitchen-better-sleep-gradient": {
      "enabled": true,
      "light": "Kitchen",
      "type": "GRADIENT",
      "cron": "*/30 * 6-14 * * *",
      "gradient": {
        "start": {
          "time": {
            "hour": 6,
            "minute": 0,
            "second": 0
          },
          "preset": "ENERGIZE"
        },
        "end": {
          "time": {
            "hour": 14,
            "minute": 59,
            "second": 59
          },
          "preset": "RELAX"
        }
      },
      "transition-ms": 1000
    }
    ...
}
```
Be adviced that you can define a cron wider (or narrower) than the gradient start and end times. A warning will
be logged when you can optimize your gradient start and end times.

### Colorloop

The following will turn the 'Dancehall' lights group into a party. It will run a colorloop every minute.

Javascript```
{
    ...
    "dancehall-color-loop": {
      "enabled": true,
      "group": "Dancehall",
      "type": "COLORLOOP",
      "cron": "00 */1 * * * *",
      "count": 1
    }
    ...
}
```

### On/Off

Simply turn on/off the lights at a given time. In the example below it will turn on
the 'Kitchen' light at 6 in the morning every weekday and turn it off at 23:00 in weekends.

Javascript```
{
    ...
    "kitchen-on": {
      "enabled": true,
      "light": "Kitchen",
      "type": "ON",
      "cron": "00 00 6 * * 1-5",
      "transition-ms": 10000
    },
    "kitchen-off": {
      "enabled": true,
      "light": "Kitchen",
      "type": "OFF",
      "cron": "00 00 23 * * 0,6",
      "transition-ms": 10000
    }
    ...
}
```

### Pulse

Javascript```
{
    ...
    "kids-room-pulse": {
      "enabled": true,
      "group": "Kids",
      "type": "PULSE",
      "cron": "00 30 7 * * 1-5",
      "pulse": {
        "pulse-duration-ms": 1000,
        "count": 20,
        "from": "RED",
        "to": "GREEN"
      }
    }
    ...
}
```

This wakes up the kids at 7:30 with 20 pulses with a frequency of 1 second from red to green.

### Alert

Another way to wake up the kids. This time it will dim the light at a certain frequency for
a long or short period of time on a certain preset.

Javascript```
{
    "kids-room-alert": {
      "enabled": true,
      "group": "Kids",
      "type": "ALERT",
      "cron": "00 30 7 * * 1-5",
      "alert": {
        "type": "LONG",
        "preset": "RED"
      }
    }
}
```

## Possible preset types

### Whites

STANDARD, ENERGIZE, CONCENTRATE, READ, RELAX, NIGHTLIGHT

### Colors

RED, GREEN, BLUE, YELLOW, ORANGE, PINK, PURPLE, TURQUOISE
