"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.colors = void 0;
exports.formatTime = formatTime;
exports.getSystemIcon = getSystemIcon;
exports.getAccessIcon = getAccessIcon;
const chalk_1 = __importDefault(require("chalk"));
function formatTime(isoString, fmt) {
    if (!isoString || isoString === 'null')
        return '--';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime()))
            return isoString;
        const options = {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }
    catch (e) {
        return isoString;
    }
}
exports.colors = {
    bold: chalk_1.default.bold,
    dim: chalk_1.default.gray,
    red: chalk_1.default.red,
    green: chalk_1.default.green,
    yellow: chalk_1.default.yellow,
    blue: chalk_1.default.blue,
    magenta: chalk_1.default.magenta,
    cyan: chalk_1.default.cyan,
    nc: chalk_1.default.reset,
};
function getSystemIcon(system) {
    switch (system.toUpperCase()) {
        case 'SUBWAY': return '🟦';
        case 'LIRR': return '🟩';
        case 'MNR': return '🟥';
        default: return '  ';
    }
}
function getAccessIcon(status) {
    if (status === 'Fully Accessible')
        return ' ♿';
    if (status === 'Partially Accessible')
        return ' ⚠️';
    return '';
}
//# sourceMappingURL=utils.js.map