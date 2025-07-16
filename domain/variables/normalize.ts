
export function normalizeName(variable?: string) {
    if (!variable || typeof variable !== 'string') return '';
    // Remove all whitespace and make lowercase
    let name = '';
    if (variable.includes('(')) {
        name = variable.substring(0, variable.indexOf('('));
    } else {
        name = variable;
    }
    return name.toLowerCase().replace(/\s/g, '').replaceAll('*', '');
}

