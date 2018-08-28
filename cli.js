#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2), {
    string: ['path', 'destination', 'pwd'],
    boolean: ['help'],
    '--': true
})
var glameow = require('./src/index')

if (argv._[0] === 'generate' && argv.help) {
    console.info(`
        Usage: generate [options] <component || page>

        create a new component or page

        Options:

            -p, --path                      Component path url or default config path 
            -d, --destination               Destination path url or default config path
            -w, --pwd                       Set base working directory or default to ''
            -h, --help                      Output usage information
    `)
    return
}

if (argv._[0] !== 'generate') {
    console.info('Invalid options - please check glameow --help')
    return;
} else {
    if (argv._[1] === 'component' || argv._[1] === 'page') {
        glameow({
            path: argv.path,
            destination: argv.destination,
            pwd: argv.pwd,
            type: argv._[1]
        })
    } else {
        console.info('Invalid options - please check glameow --help')
        return;
    }
}

