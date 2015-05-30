#!/usr/bin/env node
'use strict';
var meow = require('meow');
var mobiletrackGenerator = require('./'),
    feeder = require('./feeder');

var cli = meow({
    help: [
        'Usage',
        '  mobiletrack-generator <input>',
        '',
        'Example',
        '  mobiletrack-generator feeder'
    ].join('\n')
});

if (cli.input[0] === 'feeder') {
    feeder.apply(null, cli.input);
} else {
    mobiletrackGenerator(cli.input[0]);
}
