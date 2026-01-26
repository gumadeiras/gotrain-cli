
import { getAlerts, resolveAlias, getStations } from '../api';
import { colors, formatTime } from '../utils';

export async function cmdAlerts(options: { station?: string; all?: boolean }) {
    const alerts = await getAlerts();

    let filterId = '';
    let filterName = '';

    if (options.station) {
        filterId = resolveAlias(options.station);
        const stations = await getStations();
        const station = stations.find(s => s.id === filterId);
        filterName = station ? station.name : options.station;
    }

    console.log(colors.bold(colors.yellow('Service Alerts')));
    if (filterName) {
        console.log(`Filtering for: ${colors.bold(filterName)}`);
    }
    console.log(colors.dim('──────────────────────────────────────────────────────────'));

    let filteredAlerts = alerts;
    if (filterId) {
        filteredAlerts = alerts.filter(a =>
            a.affectedStations.includes(filterId) ||
            (filterName && a.affectedStationsLabels.some(label => label.toLowerCase().includes(filterName.toLowerCase())))
        );
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
            console.log(colors.dim(`Showing all ${colors.bold(total.toString())} distinct active alerts.`));
        } else {
            console.log(colors.dim(`Showing top ${colors.bold(displayAlerts.length.toString())} of ${colors.bold(total.toString())} distinct active alerts.`));
        }
        console.log('');
    } else {
        console.log('No active alerts found.');
        return;
    }

    displayAlerts.forEach(a => {
        const start = a.activePeriods[0]?.start;
        const end = a.activePeriods[0]?.end;

        let timeInfo = '';
        if (start) {
            const startFmt = formatTime(start, 'MMM dd h:mm a');
            timeInfo = `🕒 ${colors.dim('Start:')} ${startFmt}`;
        }
        if (end) {
            const endFmt = formatTime(end, 'MMM dd h:mm a');
            timeInfo += `  ${colors.dim('End:')} ${endFmt}`;
        }

        let scopeInfo = '';
        if (a.affectedLines.length > 0) {
            scopeInfo = colors.magenta(`Lines: ${a.affectedLines.join(', ')}`);
        } else if (a.affectedStationsLabels.length > 0) {
            let stations = a.affectedStationsLabels.join(', ');
            if (stations.length > 50) stations = stations.substring(0, 47) + '...';
            scopeInfo = colors.magenta(`Stations: ${stations}`);
        } else {
            scopeInfo = colors.dim('General');
        }

        console.log(`${colors.yellow('⚠️')}  ${colors.bold(a.title)}`);
        console.log(`   ${timeInfo} • ${scopeInfo}`);

        if (a.description) {
            console.log(`   ${colors.dim('────────────────────────────────────────────────')}`);
            const cleanDesc = a.description.replace(/\n/g, '\n   ');
            console.log(`   ${cleanDesc}`);
        }
        console.log('');
    });
}
