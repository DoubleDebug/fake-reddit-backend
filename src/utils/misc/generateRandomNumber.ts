export function generateRandomNumber(
    range: [number, number],
    floor: 'floor' | 'ceil' = 'floor'
) {
    const rangeStart = range[0];
    const rangeEnd = range[1];
    return Math[floor](Math.random() * (rangeEnd - rangeStart) + rangeStart);
}
