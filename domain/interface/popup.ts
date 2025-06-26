
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