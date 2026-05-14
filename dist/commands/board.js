"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdBoard = cmdBoard;
const api_1 = require("../api");
const utils_1 = require("../utils");
function normalizeStationName(name) {
    return name.trim().toLowerCase();
}
function resolveStationIdByName(stations, stationName, preferredSystem) {
    const normalizedName = normalizeStationName(stationName);
    const exactMatches = stations.filter(s => normalizeStationName(s.name) === normalizedName);
    if (preferredSystem) {
        const sameSystemMatches = exactMatches.filter(s => s.system === preferredSystem);
        if (sameSystemMatches.length > 0)
            return sameSystemMatches[0].id;
    }
    return exactMatches[0]?.id;
}
function formatRideDuration(startTime, endTime) {
    if (!startTime || !endTime)
        return undefined;
    const diffMs = new Date(endTime).getTime() - new Date(startTime).getTime();
    if (!Number.isFinite(diffMs) || diffMs <= 0)
        return undefined;
    const totalMinutes = Math.round(diffMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0)
        return `${minutes}m`;
    return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}
async function cmdBoard(stationId, mode, filterId) {
    const resolvedId = (0, api_1.resolveAlias)(stationId);
    const resolvedFilterId = filterId ? (0, api_1.resolveAlias)(filterId) : undefined;
    const stations = await (0, api_1.getStations)();
    const station = stations.find(s => s.id === resolvedId);
    const stationName = station ? station.name : resolvedId;
    const filterStation = resolvedFilterId ? stations.find(s => s.id === resolvedFilterId) : undefined;
    const filterName = filterStation ? filterStation.name : resolvedFilterId;
    let departures = await (0, api_1.getDepartures)(resolvedId);
    // Filter based on mode
    if (mode === 'departures') {
        departures = departures.filter(d => d.destination !== stationName);
    }
    else {
        departures = departures.filter(d => d.destination === stationName);
    }
    // Filter by destination/origin if provided
    if (resolvedFilterId && filterName) {
        if (mode === 'departures') {
            departures = departures.filter(d => d.destination.toLowerCase().includes(filterName.toLowerCase()));
        }
        else {
            // Arrivals origin filter logic (from bash script)
            departures = departures.filter(d => {
                const routeMatch = (d.routeLongName?.toLowerCase().includes(filterName.toLowerCase()) ||
                    d.routeShortName?.toLowerCase().includes(filterName.toLowerCase()));
                // Hub logic from bash
                const isHub = resolvedFilterId === 'MNR-1' || resolvedFilterId === 'LIRR-1';
                if (isHub && d.direction === 'Outbound')
                    return true;
                return routeMatch;
            });
        }
    }
    // Sort by departure time
    departures.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
    const tripLookups = new Map();
    if (mode === 'departures') {
        const destinationStationIds = Array.from(new Set(departures
            .map(d => resolveStationIdByName(stations, d.destination, station?.system))
            .filter((id) => Boolean(id))));
        const destinationBoards = await Promise.all(destinationStationIds.map(async (id) => [id, await (0, api_1.getDepartures)(id)]));
        destinationBoards.forEach(([id, board]) => {
            tripLookups.set(id, new Map(board
                .filter(item => Boolean(item.tripId))
                .map(item => [item.tripId, item])));
        });
    }
    if (mode === 'arrivals' && resolvedFilterId) {
        const originBoard = await (0, api_1.getDepartures)(resolvedFilterId);
        tripLookups.set(resolvedFilterId, new Map(originBoard
            .filter(item => Boolean(item.tripId))
            .map(item => [item.tripId, item])));
    }
    const title = mode === 'departures' ? 'Departures' : 'Arrivals';
    console.log(`${utils_1.colors.bold(utils_1.colors.blue(title))} for ${utils_1.colors.bold(`${stationName} (${resolvedId})`)}`);
    if (filterName) {
        const label = mode === 'departures' ? 'Destination' : 'Origin';
        console.log(utils_1.colors.dim(`${label}: ${filterName} (${resolvedFilterId})`));
    }
    console.log(utils_1.colors.dim('──────────────────────────────────────────────────────────'));
    departures.forEach(d => {
        const timeFmt = (0, utils_1.formatTime)(d.departureTime);
        const metadata = [];
        let statusColor = utils_1.colors.green;
        if (d.status.includes('Delayed'))
            statusColor = utils_1.colors.yellow;
        else if (d.status.includes('Cancel'))
            statusColor = utils_1.colors.red;
        else if (d.status.includes('Due'))
            statusColor = utils_1.colors.green;
        let destDisplay = d.destination;
        if (mode === 'arrivals') {
            let originGuess = '';
            if (d.direction === 'Outbound') {
                if (resolvedId.startsWith('MNR'))
                    originGuess = 'Grand Central';
                if (resolvedId.startsWith('LIRR'))
                    originGuess = 'New York';
            }
            if (originGuess === stationName)
                originGuess = '';
            if (d.destination === stationName) {
                destDisplay = originGuess ? `From ${originGuess}` : d.destination;
            }
            else {
                destDisplay = originGuess ? `${originGuess} ➤ ${d.destination}` : `Continues to ${d.destination}`;
            }
        }
        if (mode === 'departures') {
            const destinationStationId = resolveStationIdByName(stations, d.destination, station?.system);
            const destinationStop = destinationStationId ? tripLookups.get(destinationStationId)?.get(d.tripId ?? '') : undefined;
            const rideDuration = formatRideDuration(d.departureTime, destinationStop?.departureTime);
            if (rideDuration)
                metadata.push(utils_1.colors.dim(`Ride ${rideDuration}`));
        }
        if (mode === 'arrivals' && resolvedFilterId) {
            const originStop = tripLookups.get(resolvedFilterId)?.get(d.tripId ?? '');
            if (originStop) {
                metadata.push(utils_1.colors.dim(`Dep ${(0, utils_1.formatTime)(originStop.departureTime)}`));
                const rideDuration = formatRideDuration(originStop.departureTime, d.departureTime);
                if (rideDuration)
                    metadata.push(utils_1.colors.dim(`Ride ${rideDuration}`));
            }
        }
        const peakStr = d.peakStatus && d.peakStatus !== 'null' ? `  ${utils_1.colors.dim(`(${d.peakStatus})`)}` : '';
        const lineInfo = d.routeLongName && d.routeLongName !== 'null' ? ` ${utils_1.colors.magenta(`[Line: ${d.routeLongName}]`)}` : '';
        const metadataStr = metadata.length > 0 ? ` ${utils_1.colors.dim('•')} ${metadata.join(` ${utils_1.colors.dim('•')} `)}` : '';
        console.log(`${utils_1.colors.cyan(timeFmt.padEnd(15))} ${utils_1.colors.dim('│')} ${utils_1.colors.bold(destDisplay)}${peakStr}${lineInfo}`);
        const trackDisplay = d.track && d.track !== '-' && d.track !== 'null' ? `Track ${utils_1.colors.bold(d.track)}` : utils_1.colors.dim('No Track');
        const tripDisplay = d.tripId ? ` ${utils_1.colors.dim(`(Train #${d.tripId})`)}` : '';
        console.log(`                ${utils_1.colors.dim('│')} ${statusColor(d.status.padEnd(14))} ${trackDisplay}${metadataStr}${tripDisplay}`);
        console.log('');
    });
}
//# sourceMappingURL=board.js.map