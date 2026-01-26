import chalk from 'chalk';

export function formatTime(isoString: string | null | undefined, fmt?: string): string {
    if (!isoString || isoString === 'null') return '--';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return isoString;

        const options: Intl.DateTimeFormatOptions = {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        };

        return new Intl.DateTimeFormat('en-US', options).format(date);
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
