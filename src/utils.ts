
import { format, parseISO } from 'date-fns';
import chalk from 'chalk';

export function formatTime(isoString: string | null | undefined, fmt: string = 'h:mm a zzz'): string {
    if (!isoString || isoString === 'null') return '--';
    try {
        const date = parseISO(isoString);
        return format(date, fmt);
    } catch (e) {
        return isoString;
    }
}

export const colors = {
    bold: chalk.bold,
    dim: chalk.gray,
    red: chalk.red,
    green: chalk.green,
    yellow: chalk.yellow,
    blue: chalk.blue,
    magenta: chalk.magenta,
    cyan: chalk.cyan,
    nc: chalk.reset,
};

export function getSystemIcon(system: string): string {
    switch (system.toUpperCase()) {
        case 'SUBWAY': return '🟦';
        case 'LIRR': return '🟩';
        case 'MNR': return '🟥';
        default: return '  ';
    }
}

export function getAccessIcon(status?: string): string {
    if (status === 'Fully Accessible') return ' ♿';
    if (status === 'Partially Accessible') return ' ⚠️';
    return '';
}
