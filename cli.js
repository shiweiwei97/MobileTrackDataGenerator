#!/usr/bin/env node
'use strict';
var meow = require('meow');
var mobiletrackGenerator = require('./');

var cli = meow({
  help: [
    'Usage',
    '  mobiletrack-generator <input>',
    '',
    'Example',
    '  mobiletrack-generator Unicorn'
  ].join('\n')
});

mobiletrackGenerator(cli.input[0]);
