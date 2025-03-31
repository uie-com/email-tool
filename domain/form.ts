
const DEBUG = false;
export function focusOnNext(document: Document) {
    const id = document.activeElement?.id;
    const index = id?.substring(5);
    const next = document.getElementById('input' + (parseInt(index ?? '0') + 1));
    if (DEBUG) console.log('focusOnNext', id, index, next);
    if (next)
        next.focus();
    else
        setTimeout(() => {
            const next = document.getElementById('input' + (parseInt(index ?? '0') + 1));
            if (next) {
                next.focus();
            }
        }, 50);
}

export function focusOnPrev(document: Document) {
    const id = document.activeElement?.id;
    const index = id?.substring(5);
    const prev = document.getElementById('input' + (parseInt(index ?? '0') - 1));
    if (prev)
        prev.focus();
    else
        setTimeout(() => {
            const prev = document.getElementById('input' + (parseInt(index ?? '0') - 1));
            if (prev) {
                prev.focus();
            }
        }, 50);
}