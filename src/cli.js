#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2), {
    string: ['path', 'destination', 'cwd'],
    boolean: ['help'],
    alias: {
        h: 'help',
        p: 'filepath',
        d: 'destination',
        o: 'overwrite',
        c: 'cwd',
        w: 'watch',
    },
});
var glameow = require('.');
var chokidar = require('chokidar');
var configBasePath = '.glameow';

/**
 * @description watch for file changes and update the page/component
 * @param {object} {
 *  argv, cwd, path
 * }
 */
var watchFileChanges = function({argv, cwd}) {
    console.info('glameow watching for file changes...');
    var pattern = `${cwd}/${configBasePath}/**/*.json`;
    chokidar
        .watch(pattern, {
            persistent: true,
            ignoreInitial: true,
        })
        .on('all', (event, path) => {
            var search = (string, path) => new RegExp('\\b' + string + '\\b').test(path);
            //bust require cache to update with latest file changes
            for (const path in require.cache) {
                if (path.endsWith('.json')) {
                    // only clear *.js, not *.node
                    delete require.cache[path];
                }
            }
            if (search('component', path) || search('page', path)) {
                glameow({
                    destination: argv.destination,
                    cwd,
                    type: search('component', path) ? 'component' : 'page',
                    overwrite: true,
                    filepath: path,
                });
            }
        });
};

if (argv._[0] === 'generate' && argv.help) {
    console.info(`
        Usage: generate [options] <component || page>

        create a new component or page

        Options:

            -h, --help                      Output usage information
            -p, --filepath                  Component path url or default config path 
            -d, --destination               Destination path url or default config path
            -o, --overwrite                 Overwrite existing files or default is false
            -c, --cwd                       Set base working directory or default to 'process.cwd()'
            -w, --watch                     Watch for file changes and update the source code
    `);
    return;
}

if (argv._[0] !== 'generate') {
    console.info('Invalid options - please check glameow generate --help');
    return;
} else {
    if (argv._[1] === 'component' || argv._[1] === 'page' || argv._[1] === undefined) {
        var cwd = argv.cwd || process.cwd();
        var filepath = argv.filepath ? `${cwd}/${argv.filepath}` : '';
        if (argv.watch) {
            watchFileChanges({
                argv,
                cwd,
            });
            return;
        }
        if (argv._[1] !== undefined) {
            glameow({
                filepath,
                destination: argv.destination,
                cwd,
                type: argv._[1],
                overwrite: argv.overwrite,
            });
        } else {
            glameow({
                filepath,
                destination: argv.destination,
                cwd,
                type: 'component',
                overwrite: argv.overwrite,
            });
            glameow({
                filepath,
                destination: argv.destination,
                cwd,
                type: 'page',
                overwrite: argv.overwrite,
            });
        }
    } else {
        console.info('Invalid options - please check glameow generate --help');
        return;
    }
}
