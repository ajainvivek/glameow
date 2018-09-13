#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2), {
    string: ['path', 'destination', 'cwd'],
    boolean: ['help'],
    alias: {
        p: 'path',
        d: 'destination',
        o: 'overwrite',
        w: 'cwd',
        h: 'help'
    }
})
var glameow = require('.')

if (argv._[0] === 'generate' && argv.help) {
    console.info(`
        Usage: generate [options] <component || page>

        create a new component or page

        Options:

            -p, --path                      Component path url or default config path 
            -d, --destination               Destination path url or default config path
            -o, --overwrite                 Overwrite existing files or default is false
            -w, --cwd                       Set base working directory or default to ''
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
            cwd: argv.cwd,
            type: argv._[1],
            overwrite: argv.overwrite
        })
    } else {
        console.info('Invalid options - please check glameow --help')
        return;
    }
}

