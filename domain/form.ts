export function focusOnNext(document: Document, tryAgain: boolean = true) {
    setTimeout(() => {
        const inputs = document.querySelectorAll('input');
        for (let i = 0; i < inputs.length; i++) {
            if (inputs[i] === document.activeElement) {
                if (i + 1 < inputs.length) {
                    inputs[i + 1].focus();
                }
                break;
            }
        }
    }, 50);
}

export function focusOnPrev(document: Document) {
    let foundPrev = false;
    const inputs = document.querySelectorAll('input');
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i] === document.activeElement) {
            if (i - 1 >= 0) {
                inputs[i - 1].focus();
                foundPrev = true;
            }
            break;
        }
    }
    if (!foundPrev) {
        setTimeout(() => {
            focusOnPrev(document);
        }, 50);
    }
}