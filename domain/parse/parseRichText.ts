import Quill from "quill";


export function findDeltaString(quill: Quill, text: string, start: number = 0): number {
    let index = start;
    while (index < quill.getLength()) {
        const deltaString = quill.getText(index, text.length);
        if (deltaString === text) {
            return index;
        }
        index += 1;
    }
    return -1;
}


