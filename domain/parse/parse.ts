import LZString from 'lz-string';

export function parseVariableName(variable?: string) {
    if (!variable || typeof variable !== 'string') return '';
    // Remove all whitespace and make lowercase
    let name = '';
    if (variable.includes('(')) {
        name = variable.substring(0, variable.indexOf('('));
    } else {
        name = variable;
    }
    return name.toLowerCase().replace(/\s/g, '');
}

export function compressText(str: string) {
    return LZString.compressToUTF16(str);
}

export function decompressText(str: string) {
    return LZString.decompressFromUTF16(str);
}

export function copy(value?: string) {
    if (!value)
        return;
    navigator.clipboard.writeText(value);
}