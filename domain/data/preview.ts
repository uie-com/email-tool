

export async function getPreview(url: string) {
    const res = await fetch('/api/preview?url=' + url);
    const text = await res.text();
    const doc = JSON.parse("{ \"body\": " + text + "}").body
    return doc;
}