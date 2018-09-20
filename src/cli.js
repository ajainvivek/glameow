#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2), {
    string: ['path', 'destination', 'cwd'],
    boolean: ['help'],
    alias: {
        h: 'help',
        p: 'path',
        d: 'destination',
        o: 'overwrite',
        c: 'cwd',
        w: 'watch'
    }
})
var glameow = require('.')
var chokidar = require('chokidar')

/**
 * @description watch for file changes and update the page/component
 * @param {object} {
 *  argv, cwd, path
 * }
 */
var watchFileChanges = function ({
    argv,
    cwd,
    path
}) {
    console.info('glameow watching for file changes...');    
    var pattern = `${cwd}/${path}/**/*.json`;
    chokidar.watch(pattern, {
        persistent: true,
        ignoreInitial: true
    }).on('all', (event, path) => {
        var search = (string, path) => new RegExp('\\b'+string+'\\b').test(path)
        //bust require cache to update with latest file changes
        for (const path in require.cache) {
            if (path.endsWith('.json')) { // only clear *.js, not *.node
                delete require.cache[path]
            }
        }
        if (search('component', path) || search('page', path)) {
            glameow({
                path: argv.path,
                destination: argv.destination,
                cwd,
                type: search('component', path) ? 'component' : 'page',
                overwrite: true,
                componentPath: path
            })
        }
    });
}

if (argv._[0] === 'generate' && argv.help) {
    console.info(`
        Usage: generate [options] <component || page>

        create a new component or page

        Options:

            -h, --help                      Output usage information
            -p, --path                      Component path url or default config path 
            -d, --destination               Destination path url or default config path
            -o, --overwrite                 Overwrite existing files or default is false
            -c, --cwd                       Set base working directory or default to 'process.cwd()'
            -w, --watch                     Watch for file changes and update the source code
    `)
    return
}

if (argv._[0] !== 'generate') {
    console.info('Invalid options - please check glameow generate --help')
    return;
} else {
    if (argv._[1] === 'component' || argv._[1] === 'page' || argv._[1] === undefined) {
        var cwd = argv.cwd || process.cwd();
        var path = argv.path || '.glameow';
        if (argv.watch) {
            watchFileChanges({
                argv,
                cwd,
                path
            });
            return;
        }
        if (argv._[1] !== undefined) {
            glameow({
                path: argv.path,
                destination: argv.destination,
                cwd: cwd,
                type: argv._[1],
                overwrite: argv.overwrite
            })
        } else {
            glameow({
                path: argv.path,
                destination: argv.destination,
                cwd: cwd,
                type: 'component',
                overwrite: argv.overwrite
            })
            glameow({
                path: argv.path,
                destination: argv.destination,
                cwd: argv.cwd || process.cwd(),
                type: 'page',
                overwrite: argv.overwrite
            })
        }
    } else {
        console.info('Invalid options - please check glameow generate --help')
        return;
    }
}

