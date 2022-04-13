export function log(message: string, successful: boolean = true) {
    const openingColor = successful ? '\x1b[32m' : '\x1b[31m';
    const closingColor = '\x1b[0m';
    console.log(`${openingColor}%s${closingColor}`, message);
}
