
import { getStations, Station } from '../api';
import { colors, getSystemIcon, getAccessIcon } from '../utils';

export async function cmdStations(query?: string) {
    const stations = await getStations();

    console.log(colors.bold(colors.blue('NYC Transit Stations')));
    console.log(colors.dim('──────────────────────────────────────────────────────────'));

    const filteredStations = query
        ? stations.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
        : stations;

    filteredStations.forEach(s => {
        const sysIcon = getSystemIcon(s.system);
        const accessIcon = getAccessIcon(s.accessibilityStatus);
        const locInfo = s.borough && s.borough !== 'null' ? colors.dim(`(${s.borough})`) : '';
        const linesInfo = s.lines.length > 0 ? ` ${colors.magenta('Lines: ' + s.lines.join(','))}` : '';

        console.log(`${sysIcon} ${colors.bold(s.system)} │ ${s.name} ${locInfo}${linesInfo}${accessIcon} ${colors.dim('ID: ' + s.id)}`);
    });
}
