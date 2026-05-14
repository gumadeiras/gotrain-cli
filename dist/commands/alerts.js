"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdAlerts = cmdAlerts;
const api_1 = require("../api");
const utils_1 = require("../utils");
async function cmdAlerts(options) {
    const alerts = await (0, api_1.getAlerts)();
    let filterId = '';
    let filterName = '';
    if (options.station) {
        filterId = (0, api_1.resolveAlias)(options.station);
        const stations = await (0, api_1.getStations)();
        const station = stations.find(s => s.id === filterId);
        filterName = station ? station.name : options.station;
    }
    console.log(utils_1.colors.bold(utils_1.colors.yellow('Service Alerts')));
    if (filterName) {
        console.log(`Filtering for: ${utils_1.colors.bold(filterName)}`);
    }
    console.log(utils_1.colors.dim('──────────────────────────────────────────────────────────'));
    let filteredAlerts = alerts;
    if (filterId) {
        filteredAlerts = alerts.filter(a => a.affectedStations.includes(filterId) ||
            (filterName && a.affectedStationsLabels.some(label => label.toLowerCase().includes(filterName.toLowerCase()))));
    }
    // Deduplicate by title
    const uniqueAlerts = Array.from(new Map(filteredAlerts.map(a => [a.title, a])).values());
    // Sort by start time (newest first)
    uniqueAlerts.sort((a, b) => {
        const startA = a.activePeriods[0]?.start ? new Date(a.activePeriods[0].start).getTime() : 0;
        const startB = b.activePeriods[0]?.start ? new Date(b.activePeriods[0].start).getTime() : 0;
        return startB - startA;
    });
    const total = uniqueAlerts.length;
    const limit = options.all ? total : 5;
    const displayAlerts = uniqueAlerts.slice(0, limit);
    if (total > 0) {
        if (options.all) {
            console.log(utils_1.colors.dim(`Showing all ${utils_1.colors.bold(total.toString())} distinct active alerts.`));
        }
        else {
            console.log(utils_1.colors.dim(`Showing top ${utils_1.colors.bold(displayAlerts.length.toString())} of ${utils_1.colors.bold(total.toString())} distinct active alerts.`));
        }
        console.log('');
    }
    else {
        console.log('No active alerts found.');
        return;
    }
    displayAlerts.forEach(a => {
        const start = a.activePeriods[0]?.start;
        const end = a.activePeriods[0]?.end;
        let timeInfo = '';
        if (start) {
            const startFmt = (0, utils_1.formatTime)(start, 'MMM dd h:mm a');
            timeInfo = `🕒 ${utils_1.colors.dim('Start:')} ${startFmt}`;
        }
        if (end) {
            const endFmt = (0, utils_1.formatTime)(end, 'MMM dd h:mm a');
            timeInfo += `  ${utils_1.colors.dim('End:')} ${endFmt}`;
        }
        let scopeInfo = '';
        if (a.affectedLines.length > 0) {
            scopeInfo = utils_1.colors.magenta(`Lines: ${a.affectedLines.join(', ')}`);
        }
        else if (a.affectedStationsLabels.length > 0) {
            let stations = a.affectedStationsLabels.join(', ');
            if (stations.length > 50)
                stations = stations.substring(0, 47) + '...';
            scopeInfo = utils_1.colors.magenta(`Stations: ${stations}`);
        }
        else {
            scopeInfo = utils_1.colors.dim('General');
        }
        console.log(`${utils_1.colors.yellow('⚠️')}  ${utils_1.colors.bold(a.title)}`);
        console.log(`   ${timeInfo} • ${scopeInfo}`);
        if (a.description) {
            console.log(`   ${utils_1.colors.dim('────────────────────────────────────────────────')}`);
            const cleanDesc = a.description.replace(/\n/g, '\n   ');
            console.log(`   ${cleanDesc}`);
        }
        console.log('');
    });
}
//# sourceMappingURL=alerts.js.map