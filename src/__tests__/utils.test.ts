
import { formatTime, getSystemIcon, getAccessIcon } from '../utils';

describe('Utility Functions', () => {
    test('formatTime', () => {
        const iso = '2026-01-25T21:39:00Z';
        // The output depends on the local timezone, so we check for components
        const formatted = formatTime(iso);
        expect(formatted).toMatch(/\d{1,2}:\d{2} [AP]M/);
        expect(formatTime(null)).toBe('--');
        expect(formatTime('invalid')).toBe('invalid');
    });

    test('getSystemIcon', () => {
        expect(getSystemIcon('SUBWAY')).toBe('🟦');
        expect(getSystemIcon('LIRR')).toBe('🟩');
        expect(getSystemIcon('MNR')).toBe('🟥');
        expect(getSystemIcon('Unknown')).toBe('  ');
    });

    test('getAccessIcon', () => {
        expect(getAccessIcon('Fully Accessible')).toBe(' ♿');
        expect(getAccessIcon('Partially Accessible')).toBe(' ⚠️');
        expect(getAccessIcon('None')).toBe('');
    });
});
