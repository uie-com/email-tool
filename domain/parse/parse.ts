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

export function openPopup(url: string) {
    if (!url || window === undefined) return;
    const screenWidth = window.screen.availWidth;

    const x = window.screenX;
    const y = window.screenY;

    const isLeft = x + 100 < screenWidth / 2;

    const popupWidth = screenWidth / 2;
    const popupHeight = window.screen.availHeight;
    const popupLeft = isLeft ? (screenWidth) / 2 : 0;

    console.log(`Opening popup on ${isLeft ? 'left' : 'right'} at ${popupLeft}px of ${screenWidth}px with ${popupWidth} width, and ${0}px y of ${window.screen.availHeight}px at ${popupHeight}. Current window x: ${x}, y: ${y}`);

    return window.open(url, '_blank', `toolbar=no, location=no, directories=no, status=no, menubar=no,scrollbars=yes,resizable=yes,width=${popupWidth},height=${popupHeight},left=${isLeft ? popupLeft : 0},top=0`);
}