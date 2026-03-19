#!/usr/bin/env node

import { Command } from 'commander';
import { cmdStations } from './commands/stations';
import { cmdBoard } from './commands/board';
import { cmdAlerts } from './commands/alerts';
import { cmdFavorite, cmdFavs } from './commands/favorites';

const program = new Command();
const pkg = require('../package.json') as { version: string };

program
    .name('gotrain')
    .description('Atomic CLI for NYC train departures (MTA, LIRR, MNR)')
    .version(pkg.version);

program
    .command('stations')
    .alias('s')
    .description('List stations (filter by query)')
    .argument('[query]', 'filter stations by name')
    .action(async (query) => {
        try {
            await cmdStations(query);
        } catch (err) {
            console.error('Error fetching stations:', err instanceof Error ? err.message : err);
        }
    });

program
    .command('departures')
    .alias('d')
    .description('Show departures')
    .argument('<id>', 'station ID or alias')
    .option('--to <id>', 'destination station ID or alias')
    .action(async (id, options) => {
        try {
            await cmdBoard(id, 'departures', options.to);
        } catch (err) {
            console.error('Error fetching departures:', err instanceof Error ? err.message : err);
        }
    });

program
    .command('arrivals')
    .alias('ar')
    .description('Show arrivals')
    .argument('<id>', 'station ID or alias')
    .option('--from <id>', 'origin station ID or alias')
    .action(async (id, options) => {
        try {
            await cmdBoard(id, 'arrivals', options.from);
        } catch (err) {
            console.error('Error fetching arrivals:', err instanceof Error ? err.message : err);
        }
    });

program
    .command('alerts')
    .alias('a')
    .description('Show active service alerts')
    .option('-s, --station <id>', 'filter by station ID or alias')
    .option('--all', 'show all alerts instead of top 5')
    .action(async (options) => {
        try {
            await cmdAlerts(options);
        } catch (err) {
            console.error('Error fetching alerts:', err instanceof Error ? err.message : err);
        }
    });

program
    .command('favs')
    .alias('fav')
    .description('Manage favorite stations (list, add, remove)')
    .argument('[subcmd|id]', 'subcommand (add, remove, rm) or station ID')
    .argument('[id|alias]', 'station ID for add/remove, or alias if toggle')
    .argument('[alias]', 'alias if add/remove and ID provided')
    .action(async (arg1, arg2, arg3) => {
        try {
            if (!arg1) {
                await cmdFavs();
            } else if (['add', 'remove', 'rm', 'list'].includes(arg1)) {
                if (arg1 === 'list') {
                    await cmdFavs();
                } else {
                    await cmdFavorite(arg1, arg2, arg3);
                }
            } else {
                // Default toggle/fallback behavior
                await cmdFavorite(arg1, arg2);
            }
        } catch (err) {
            console.error('Error managing favorites:', err instanceof Error ? err.message : err);
        }
    });

program.parse();
