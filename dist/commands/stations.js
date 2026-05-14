"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdStations = cmdStations;
const api_1 = require("../api");
const utils_1 = require("../utils");
async function cmdStations(query) {
    const stations = await (0, api_1.getStations)();
    console.log(utils_1.colors.bold(utils_1.colors.blue('NYC Transit Stations')));
    console.log(utils_1.colors.dim('──────────────────────────────────────────────────────────'));
    const filteredStations = query
        ? stations.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
        : stations;
    filteredStations.forEach(s => {
        const sysIcon = (0, utils_1.getSystemIcon)(s.system);
        const accessIcon = (0, utils_1.getAccessIcon)(s.accessibilityStatus);
        const locInfo = s.borough && s.borough !== 'null' ? utils_1.colors.dim(`(${s.borough})`) : '';
        const linesInfo = s.lines.length > 0 ? ` ${utils_1.colors.magenta('Lines: ' + s.lines.join(','))}` : '';
        console.log(`${sysIcon} ${utils_1.colors.bold(s.system)} │ ${s.name} ${locInfo}${linesInfo}${accessIcon} ${utils_1.colors.dim('ID: ' + s.id)}`);
    });
}
//# sourceMappingURL=stations.js.map