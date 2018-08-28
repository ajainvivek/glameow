#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2))
var glameow = require('./src/index')

if (argv.root && argv.destination) {
    glameow({
        root: argv.root,
        destination: argv.destination,
        pwd: argv.pwd
    })
}
