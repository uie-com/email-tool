import Quill from "quill";


export function forEachChar(quill: Quill, callback: (char: string, index: number) => number): void {
    let charIndex = 0, opIndex = 0, totalIndex = 0;
    let delta = quill.getContents();
    while (opIndex < delta.ops.length) {
        let text = delta.ops[opIndex].insert;
        charIndex = 0;
        if (typeof text === 'string') {
            while (charIndex < text.length) {
                const char = text[charIndex];
                let offset = callback(char, totalIndex);

                totalIndex += offset;

                if (offset < 0) {
                    delta = quill.getContents();
                    text = delta.ops[opIndex].insert as string ?? ' ';
                    while ((charIndex + offset) < 0) {
                        opIndex--;
                        if (opIndex < 0) {
                            break;
                        }
                        const prevOp = delta.ops[opIndex];
                        if (typeof prevOp.insert === 'string') {
                            charIndex += prevOp.insert.length;
                            text = prevOp.insert;
                        } else {
                            charIndex += 1;
                            text = ' ';
                        }
                    }
                    if (opIndex < 0) {
                        opIndex = 0;
                        charIndex = 0;
                        break;
                    }
                    text = delta.ops[opIndex].insert as string ?? ' ';
                    charIndex = (charIndex + offset);
                } else if (offset > 0) {
                    delta = quill.getContents();
                    text = delta.ops[opIndex].insert as string ?? ' ';
                    while ((charIndex + offset) > text.length) {
                        opIndex++;
                        if (opIndex >= delta.ops.length) {
                            break;
                        }
                        const nextOp = delta.ops[opIndex];
                        if (typeof nextOp.insert === 'string') {
                            offset -= text.length - charIndex;
                            text = nextOp.insert;
                            charIndex = 0;
                        } else {
                            offset -= 1;
                            text = ' ';
                        }
                    }
                    if (opIndex >= delta.ops.length) {
                        console.error('Invalid offset', offset, ' for op ', opIndex);
                        break;
                    }
                    text = delta.ops[opIndex].insert as string ?? ' ';
                    charIndex = (charIndex + offset);
                }

                totalIndex++;
                charIndex++;
            }
        }
        opIndex++;
    }
}

