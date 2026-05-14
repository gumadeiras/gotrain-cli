"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdFavorite = cmdFavorite;
exports.cmdFavs = cmdFavs;
const api_1 = require("../api");
const utils_1 = require("../utils");
async function cmdFavorite(subcmd, id, alias) {
    if (subcmd === 'add') {
        if (!id) {
            console.error(utils_1.colors.red('Usage: gotrain favs add <station-id> [alias]'));
            process.exit(1);
        }
        (0, api_1.addFavorite)(id, alias);
        console.log(`${utils_1.colors.green('Added/Updated')} ${utils_1.colors.bold(id)} ${utils_1.colors.green('to favorites')}${alias ? ` with alias '${utils_1.colors.bold(alias)}'` : ''} ${utils_1.colors.green('✅')}`);
        return;
    }
    if (subcmd === 'remove' || subcmd === 'rm') {
        if (!id) {
            console.error(utils_1.colors.red('Usage: gotrain favs rm <station-id|alias>'));
            process.exit(1);
        }
        const resolved = (0, api_1.resolveAlias)(id);
        (0, api_1.removeFavorite)(resolved);
        console.log(`${utils_1.colors.red('Removed')} ${utils_1.colors.bold(resolved)} ${utils_1.colors.red('from favorites')} 🗑️`);
        return;
    }
    // Toggle behavior for convenience
    const favorites = (0, api_1.getFavorites)();
    const resolved = (0, api_1.resolveAlias)(subcmd);
    if (favorites[resolved] !== undefined) {
        (0, api_1.removeFavorite)(resolved);
        console.log(`${utils_1.colors.red('Removed')} ${utils_1.colors.bold(resolved)} ${utils_1.colors.red('from favorites')} 🗑️`);
    }
    else {
        (0, api_1.addFavorite)(resolved, id); // id here would be alias
        console.log(`${utils_1.colors.green('Added')} ${utils_1.colors.bold(resolved)} ${utils_1.colors.green('to favorites')}${id ? ` (Alias: ${id})` : ''} ✅`);
    }
}
async function cmdFavs() {
    console.log(utils_1.colors.bold(utils_1.colors.blue('Favorite Stations')));
    console.log(utils_1.colors.dim('──────────────────────────────────────────────────────────'));
    const favorites = (0, api_1.getFavorites)();
    const stationIds = Object.keys(favorites);
    if (stationIds.length === 0) {
        console.log("No favorites yet. Use 'gotrain favs add <id>' to add.");
        return;
    }
    const stations = await (0, api_1.getStations)();
    stationIds.forEach(id => {
        const station = stations.find(s => s.id === id);
        if (station) {
            const alias = favorites[id];
            const aliasDisplay = alias ? ` ${utils_1.colors.magenta(`(Alias: ${alias})`)}` : '';
            const sysIcon = (0, utils_1.getSystemIcon)(station.system);
            console.log(`${sysIcon} ${utils_1.colors.bold(station.system.padEnd(6))} | ${station.name} ${utils_1.colors.dim(`(${station.id})`)}${aliasDisplay}`);
        }
        else {
            // In case station is no longer in the cache but in favorites
            console.log(`  Unknown | ${id} ${favorites[id] ? utils_1.colors.magenta(`(Alias: ${favorites[id]})`) : ''}`);
        }
    });
}
//# sourceMappingURL=favorites.js.map