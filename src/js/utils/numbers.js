export function formatNumber(number) {
    // Work out whether decimal separator is . or , for localised numbers
    const decimalSeparator = /\./.test((1.1).toLocaleString()) ? '.' : ',';
    // Round n to an integer and present
    const regex = new RegExp(`\\${decimalSeparator}\\d+$`);

    return Math.round(number)
        .toLocaleString()
        .replace(regex, '');
}

export default { formatNumber };
