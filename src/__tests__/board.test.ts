
import { cmdBoard } from '../commands/board';
import { getDepartures, getStations, resolveAlias } from '../api';

const stripAnsi = (str: string) => str.replace(/\x1B\[\d+m/g, '');

// Mock dependencies
jest.mock('../api');
jest.mock('../utils', () => ({
    ...jest.requireActual('../utils'),
    formatTime: (t: string) => t, // Keep ISO for deterministic tests
}));

describe('Board Command (Departures/Arrivals)', () => {
    let logSpy: jest.SpyInstance;

    beforeEach(() => {
        logSpy = jest.spyOn(console, 'log').mockImplementation();
        (resolveAlias as jest.Mock).mockImplementation((id) => id);
        (getStations as jest.Mock).mockResolvedValue([
            { id: 'MNR-1', name: 'Grand Central', system: 'MNR' },
            { id: 'MNR-149', name: 'New Haven', system: 'MNR' },
        ]);
    });

    afterEach(() => {
        logSpy.mockRestore();
        jest.clearAllMocks();
    });

    test('renders departures correctly', async () => {
        (getDepartures as jest.Mock).mockResolvedValue([
            {
                departureTime: '2026-01-25T22:00:00Z',
                destination: 'New Haven',
                status: 'On Time',
                track: '14',
                tripId: '123'
            }
        ]);

        await cmdBoard('MNR-1', 'departures');

        const output = stripAnsi(logSpy.mock.calls.map(call => call[0]).join('\n'));
        expect(output).toContain('Departures for Grand Central (MNR-1)');
        expect(output).toContain('New Haven');
        expect(output).toContain('Track 14');
        expect(output).toContain('Train #123');
    });

    test('filters departures to destination', async () => {
        (getDepartures as jest.Mock).mockResolvedValue([
            { destination: 'New Haven', departureTime: '2026-01-25T22:00:00Z', status: 'On Time' },
            { destination: 'Stamford', departureTime: '2026-01-25T22:05:00Z', status: 'On Time' },
        ]);

        await cmdBoard('MNR-1', 'departures', 'MNR-149'); // Filter for New Haven

        const output = stripAnsi(logSpy.mock.calls.map(call => call[0]).join('\n'));
        expect(output).toContain('New Haven');
        expect(output).not.toContain('Stamford');
    });
});
