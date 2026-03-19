
import { getDepartures, getStations, resolveAlias, Departure, Station } from '../api';
import { colors, formatTime } from '../utils';

function normalizeStationName(name: string): string {
    return name.trim().toLowerCase();
}

function resolveStationIdByName(
    stations: Station[],
    stationName: string,
    preferredSystem?: string
): string | undefined {
    const normalizedName = normalizeStationName(stationName);
    const exactMatches = stations.filter(s => normalizeStationName(s.name) === normalizedName);

    if (preferredSystem) {
        const sameSystemMatches = exactMatches.filter(s => s.system === preferredSystem);
        if (sameSystemMatches.length > 0) return sameSystemMatches[0].id;
    }

    return exactMatches[0]?.id;
}

function formatRideDuration(startTime?: string, endTime?: string): string | undefined {
    if (!startTime || !endTime) return undefined;

    const diffMs = new Date(endTime).getTime() - new Date(startTime).getTime();
    if (!Number.isFinite(diffMs) || diffMs <= 0) return undefined;

    const totalMinutes = Math.round(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

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

    const tripLookups = new Map<string, Map<string, Departure>>();

    if (mode === 'departures') {
        const destinationStationIds = Array.from(new Set(
            departures
                .map(d => resolveStationIdByName(stations, d.destination, station?.system))
                .filter((id): id is string => Boolean(id))
        ));

        const destinationBoards = await Promise.all(
            destinationStationIds.map(async id => [id, await getDepartures(id)] as const)
        );

        destinationBoards.forEach(([id, board]) => {
            tripLookups.set(
                id,
                new Map(
                    board
                        .filter(item => Boolean(item.tripId))
                        .map(item => [item.tripId as string, item])
                )
            );
        });
    }

    if (mode === 'arrivals' && resolvedFilterId) {
        const originBoard = await getDepartures(resolvedFilterId);
        tripLookups.set(
            resolvedFilterId,
            new Map(
                originBoard
                    .filter(item => Boolean(item.tripId))
                    .map(item => [item.tripId as string, item])
            )
        );
    }

    const title = mode === 'departures' ? 'Departures' : 'Arrivals';
    console.log(`${colors.bold(colors.blue(title))} for ${colors.bold(`${stationName} (${resolvedId})`)}`);

    if (filterName) {
        const label = mode === 'departures' ? 'Destination' : 'Origin';
        console.log(colors.dim(`${label}: ${filterName} (${resolvedFilterId})`));
    }
    console.log(colors.dim('──────────────────────────────────────────────────────────'));

    departures.forEach(d => {
        const timeFmt = formatTime(d.departureTime);
        const metadata: string[] = [];

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

        if (mode === 'departures') {
            const destinationStationId = resolveStationIdByName(stations, d.destination, station?.system);
            const destinationStop = destinationStationId ? tripLookups.get(destinationStationId)?.get(d.tripId ?? '') : undefined;
            const rideDuration = formatRideDuration(d.departureTime, destinationStop?.departureTime);

            if (rideDuration) metadata.push(colors.dim(`Ride ${rideDuration}`));
        }

        if (mode === 'arrivals' && resolvedFilterId) {
            const originStop = tripLookups.get(resolvedFilterId)?.get(d.tripId ?? '');
            if (originStop) {
                metadata.push(colors.dim(`Dep ${formatTime(originStop.departureTime)}`));

                const rideDuration = formatRideDuration(originStop.departureTime, d.departureTime);
                if (rideDuration) metadata.push(colors.dim(`Ride ${rideDuration}`));
            }
        }

        const peakStr = d.peakStatus && d.peakStatus !== 'null' ? `  ${colors.dim(`(${d.peakStatus})`)}` : '';
        const lineInfo = d.routeLongName && d.routeLongName !== 'null' ? ` ${colors.magenta(`[Line: ${d.routeLongName}]`)}` : '';
        const metadataStr = metadata.length > 0 ? ` ${colors.dim('•')} ${metadata.join(` ${colors.dim('•')} `)}` : '';

        console.log(`${colors.cyan(timeFmt.padEnd(15))} ${colors.dim('│')} ${colors.bold(destDisplay)}${peakStr}${lineInfo}`);

        const trackDisplay = d.track && d.track !== '-' && d.track !== 'null' ? `Track ${colors.bold(d.track)}` : colors.dim('No Track');
        const tripDisplay = d.tripId ? ` ${colors.dim(`(Train #${d.tripId})`)}` : '';

        console.log(`                ${colors.dim('│')} ${statusColor(d.status.padEnd(14))} ${trackDisplay}${metadataStr}${tripDisplay}`);
        console.log('');
    });
}
