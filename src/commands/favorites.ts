
import { getFavorites, addFavorite, removeFavorite, getStations } from '../api';
import { colors, getSystemIcon } from '../utils';

export async function cmdFavorite(subcmd: string, id?: string, alias?: string) {
    if (subcmd === 'add') {
        if (!id) {
            console.error(colors.red('Usage: gotrain favorite add <station-id> [alias]'));
            process.exit(1);
        }
        addFavorite(id, alias);
        console.log(`${colors.green('Added/Updated')} ${colors.bold(id)} ${colors.green('to favorites')}${alias ? ` with alias '${colors.bold(alias)}'` : ''} ${colors.green('✅')}`);
        return;
    }

    if (subcmd === 'remove' || subcmd === 'rm') {
        if (!id) {
            console.error(colors.red('Usage: gotrain favorite remove <station-id|alias>'));
            process.exit(1);
        }
        removeFavorite(id);
        console.log(`${colors.red('Removed')} ${colors.bold(id)} ${colors.red('from favorites')} 🗑️`);
        return;
    }

    // Toggle behavior
    const favorites = getFavorites();
    if (favorites[subcmd] !== undefined) {
        removeFavorite(subcmd);
        console.log(`${colors.red('Removed')} ${colors.bold(subcmd)} ${colors.red('from favorites')} 🗑️`);
    } else {
        addFavorite(subcmd, id); // id here would be alias if user did: gotrain favorite ID ALIAS
        console.log(`${colors.green('Added')} ${colors.bold(subcmd)} ${colors.green('to favorites')} ✅`);
    }
}

export async function cmdFavs() {
    console.log(colors.bold(colors.blue('Favorite Stations')));
    console.log(colors.dim('──────────────────────────────────────────────────────────'));

    const favorites = getFavorites();
    const stationIds = Object.keys(favorites);

    if (stationIds.length === 0) {
        console.log("No favorites yet. Use 'gotrain favorite <id>' to add.");
        return;
    }

    const stations = await getStations();

    stationIds.forEach(id => {
        const station = stations.find(s => s.id === id);
        if (station) {
            const alias = favorites[id];
            const aliasDisplay = alias ? ` ${colors.magenta(`(Alias: ${alias})`)}` : '';
            const sysIcon = getSystemIcon(station.system);

            console.log(`${sysIcon} ${colors.bold(station.system.padEnd(6))} | ${station.name} ${colors.dim(`(${station.id})`)}${aliasDisplay}`);
        } else {
            // In case station is no longer in the cache but in favorites
            console.log(`  Unknown | ${id} ${favorites[id] ? colors.magenta(`(Alias: ${favorites[id]})`) : ''}`);
        }
    });
}
