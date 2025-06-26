import LZString from 'lz-string';


export function compressText(str: string) {
    return LZString.compressToUTF16(str);
}

export function decompressText(str: string) {
    return LZString.decompressFromUTF16(str);
}