
import { getDepartures, getStations, resolveAlias, Departure } from '../api';
import { colors, formatTime } from '../utils';

export async function cmdBoard(
    stationId: string,
    mode: 'departures' | 'arrivals',
    filterId?: string
) {
    const resolvedId = resolveAlias(stationId);
    const resolvedFilterId = filterId ? resolveAlias(filterId) : undefined;

    const stations = await getStations();
    const station = stations.find(s => s.id === resolvedId);
    const stationName = station ? station.name : resolvedId;

    const filterStation = resolvedFilterId ? stations.find(s => s.id === resolvedFilterId) : undefined;
    const filterName = filterStation ? filterStation.name : resolvedFilterId;

    let departures = await getDepartures(resolvedId);

    // Filter based on mode
    if (mode === 'departures') {
        departures = departures.filter(d => d.destination !== stationName);
    } else {
        departures = departures.filter(d => d.destination === stationName);
    }

    // Filter by destination/origin if provided
    if (resolvedFilterId && filterName) {
        if (mode === 'departures') {
            departures = departures.filter(d =>
                d.destination.toLowerCase().includes(filterName.toLowerCase())
            );
        } else {
            // Arrivals origin filter logic (from bash script)
            departures = departures.filter(d => {
                const routeMatch = (d.routeLongName?.toLowerCase().includes(filterName.toLowerCase()) ||
                    d.routeShortName?.toLowerCase().includes(filterName.toLowerCase()));

                // Hub logic from bash
                const isHub = resolvedFilterId === 'MNR-1' || resolvedFilterId === 'LIRR-1';
                if (isHub && d.direction === 'Outbound') return true;

                return routeMatch;
            });
        }
    }

    // Sort by departure time
    departures.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());

    const title = mode === 'departures' ? 'Departures' : 'Arrivals';
    console.log(`${colors.bold(colors.blue(title))} for ${colors.bold(`${stationName} (${resolvedId})`)}`);

    if (filterName) {
        const label = mode === 'departures' ? 'Destination' : 'Origin';
        console.log(colors.dim(`${label}: ${filterName} (${resolvedFilterId})`));
    }
    console.log(colors.dim('──────────────────────────────────────────────────────────'));

    departures.forEach(d => {
        const timeFmt = formatTime(d.departureTime);

        let statusColor = colors.green;
        if (d.status.includes('Delayed')) statusColor = colors.yellow;
        else if (d.status.includes('Cancel')) statusColor = colors.red;
        else if (d.status.includes('Due')) statusColor = colors.green;

        let destDisplay = d.destination;
        if (mode === 'arrivals') {
            let originGuess = '';
            if (d.direction === 'Outbound') {
                if (resolvedId.startsWith('MNR')) originGuess = 'Grand Central';
                if (resolvedId.startsWith('LIRR')) originGuess = 'New York';
            }

            if (originGuess === stationName) originGuess = '';

            if (d.destination === stationName) {
                destDisplay = originGuess ? `From ${originGuess}` : d.destination;
            } else {
                destDisplay = originGuess ? `${originGuess} ➤ ${d.destination}` : `Continues to ${d.destination}`;
            }
        }

        const peakStr = d.peakStatus && d.peakStatus !== 'null' ? `  ${colors.dim(`(${d.peakStatus})`)}` : '';
        const lineInfo = d.routeLongName && d.routeLongName !== 'null' ? ` ${colors.magenta(`[Line: ${d.routeLongName}]`)}` : '';

        console.log(`${colors.cyan(timeFmt.padEnd(15))} ${colors.dim('│')} ${colors.bold(destDisplay)}${peakStr}${lineInfo}`);

        const trackDisplay = d.track && d.track !== '-' && d.track !== 'null' ? `Track ${colors.bold(d.track)}` : colors.dim('No Track');

        console.log(`                ${colors.dim('│')} ${statusColor(d.status.padEnd(14))} ${trackDisplay} ${colors.dim(`(Train #${d.tripId})`)}`);
        console.log('');
    });
}
