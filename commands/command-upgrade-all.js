require('raptor-polyfill/string/startsWith');

var fs = require('fs');
var nodePath = require('path');
var raptorPromises = require('raptor-promises');
var upgrade = require('../lib/upgrade');

module.exports = {
    usage: 'Usage: $0 $commandName [dir]',

    options: {
        'no-prompt': {
            description: 'Do not prompt for each upgrade',
            type: 'boolean',
            default: true
        }
    },

    validate: function(args, rapido) {
        args.dir = args._[0];

        if (args.dir) {
            args.dir = nodePath.resolve(process.cwd(), args.dir);
        } else {
            args.dir = process.cwd();
        }

        return args;
    },

    run: function(args, config, rapido) {
        var org = require('../lib/raptorjs-github-org');

        var logger = rapido.util.replayLogger();

        logger.info('GitHub organization: ' + org);
        return rapido.prompt({
                properties: {
                    dir: {
                        name: 'dir',
                        description: 'Enter location for ' + org + ' repositories',
                        default: args.dir
                    }
                }
            })
            .then(function(result) {

                var promiseChain = raptorPromises.resolved();

                var dir = nodePath.resolve(result.dir);

                var moduleDirs = fs.readdirSync(dir);



                moduleDirs.forEach(function(moduleName) {
                    if (!moduleName.startsWith('.')) {
                        var moduleDir = nodePath.join(dir, moduleName);
                        var pkgPath = nodePath.join(moduleDir, 'package.json');
                        if (fs.existsSync(pkgPath)) {
                            promiseChain = promiseChain.then(function() {
                                return upgrade.upgradePackageLatest(pkgPath);
                            });
                        }
                    }

                });

                return raptorPromises.all([promiseChain]).then(function() {
                    if (!args.logger) {
                        // Only log if we created the logger (it was not provided as input)
                        rapido.log();
                        logger.summarize();
                    }

                    logger.success('success', 'Version update completed');
                });
            });
    }
};
