export async function ac_fetch(url: string, settings: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    params?: URLSearchParams,
    token?: string,
    payload?: any
}) {
    if (!process.env.ACTIVECAMPAIGN_API_KEY) console.error("No API key found.");

    const headers: { [key: string]: string } = {
        "content-type": "application/json",
        "accept": "application/json",
        "Api-Token": url.includes('centercentre') ? process.env.ACTIVECAMPAIGN_API_KEY ?? "" : '',
        "Authorization": url.includes('centercentre') ? '' : 'Bearer ' + settings.token,
    };

    const res = await fetch(url + (settings.params ?? ''), {
        method: settings.method,
        headers: headers,
        body: settings.payload ? JSON.stringify(settings.payload) : undefined,
    });

    try {
        if (!res.ok) {
            const text = await res.text();
            console.error("Error calling Active Campaign: ", text);
            return text;
        }

        return JSON.parse(JSON.stringify(await res.json()));
    } catch (e) {
        console.error("Couldn't parse ActiveCampaign response:", res);
        return JSON.parse(JSON.stringify(res));
    }
}



// Auth calls

export async function testActiveCampaignToken(token: string): Promise<any> {
    return await ac_fetch("https://campaigns-backend.cluster.app-us1.com/campaigns", { method: 'GET', token });
}



// Campaign calls

export async function createEmptyCampaign(payload: { name: string, type?: string }): Promise<any> {
    payload = { ...payload, type: "single", };
    return await ac_fetch("https://centercentre.api-us1.com/api/3/campaign", { method: 'POST', payload });
}

// export async function editCampaign(id: string, payload: any): Promise<any> {
//     return await ac_fetch("https://centercentre.api-us1.com/api/3/campaigns/" + id + "/edit", { method: 'PUT', payload });
// }

export async function editCampaignInternal(id: string, payload: any, token: string): Promise<any> {
    return await ac_fetch("https://campaigns-backend.cluster.app-us1.com/campaigns/" + id + "/edit", { method: 'PUT', payload, token });
}

export async function getCampaign(id: string): Promise<any> {
    return await ac_fetch("https://centercentre.api-us1.com/api/3/campaigns/" + id, { method: 'GET' });
}

export async function deleteCampaign(id: string, token: string): Promise<any> {
    return await ac_fetch("https://campaigns-backend.cluster.app-us1.com/campaigns/" + id + '/delete', { method: 'DELETE', token });
}

export async function sendCampaignTestEmail(payload: { campaignId: number, messageId: number, toEmail: string, subject: string }): Promise<any> {
    return await ac_fetch("https://centercentre.activehosted.com/api/3/campaigns/test-send", { method: 'POST', payload });
}



// Template calls

export async function postTemplate(name: string, html: string): Promise<any> {
    const payload = { 'template': { name: name, "ed_version": "3", "content": `{"html":"${JSON.stringify(html).slice(1, -1)}"}`, } };
    return await ac_fetch("https://centercentre.api-us1.com/api/3/templates", { method: 'POST', payload });
}

// Creates a html-only template that is not compatible with the ActiveCampaign visual editor
// export async function postHTMLTemplate(name: string, html: string): Promise<any> {
//     const payload = { 'template': { name: name, "content": html } };
//     return await ac_fetch("https://centercentre.api-us1.com/api/3/templates", { method: 'POST', payload });
// }

// export async function putTemplate(id: string, payload: any): Promise<any> {
//     return await ac_fetch("https://centercentre.api-us1.com/api/3/templates/" + id, { method: 'PUT', payload });
// }

export async function deleteTemplate(id: string): Promise<any> {
    return await ac_fetch("https://centercentre.api-us1.com/api/3/templates/" + id, { method: 'DELETE' });
}

export async function getTemplate(id: string): Promise<any> {
    return await ac_fetch("https://centercentre.api-us1.com/api/3/templates/" + id, { method: 'GET' });
}

export async function listTemplates(): Promise<any> {
    return await ac_fetch("https://centercentre.api-us1.com/api/3/templates", { method: 'GET' });
}



// Messages calls

// export async function createMessage(message: { subject: string, html: string, text: string, email: string, reply2: string, preheader_text: string, fromname: string, ed_version: string }): Promise<any> {
//     const payload = { 'message': message };
//     return await ac_fetch("https://centercentre.api-us1.com/api/3/messages", { method: 'POST', payload });
// }

export async function createCampaignMessage(campaignID: string, payload: { subject: string, fromEmail: string, replyToEmail: string, preHeader: string, fromName: string, editorVersion: number, html?: string, text?: string }, token: string): Promise<any> {
    return await ac_fetch("https://campaigns-backend.cluster.app-us1.com/campaigns/" + campaignID + "/messages", { method: "POST", payload, token });
}

export async function populateCampaign(campaignID: string, messageID: string, templateID: string, token: string): Promise<any> {
    const url = "https://campaigns-backend.cluster.app-us1.com/campaigns/" + campaignID + "/messages/" + messageID + "/populate";
    const payload = { "baseTemplateId": templateID };
    return await ac_fetch(url, { method: 'PUT', payload, token });
}

export async function editMessage(messageID: string, payload: any, token: string): Promise<any> {
    return await ac_fetch("https://campaigns-backend.cluster.app-us1.com/messages/" + messageID, { method: 'PUT', payload, token });
}

export async function getMessage(id: string): Promise<any> {
    return await ac_fetch("https://centercentre.api-us1.com/api/3/messages/" + id, { method: 'GET' });
}

export async function listMessages(): Promise<any> {
    return await ac_fetch("https://centercentre.api-us1.com/api/3/messages", { method: 'GET' });
}



// File uploads

// import fs from 'fs';
// import path from 'path';
// import FormData from 'form-data';

// export async function uploadImage(url: string, token: string): Promise<any> {
//     const imagePath = path.resolve(process.cwd(), 'public', url.replace(/^\.\/+/, ''));

//     if (!fs.existsSync(imagePath)) {
//         throw new Error(`File not found: ${imagePath}`);
//     }

//     const fileStream = fs.createReadStream(imagePath);
//     const fileStats = fs.statSync(imagePath);
//     const fileName = path.basename(imagePath);
//     const mimeType = 'image/png';

//     const form = new FormData();
//     form.append('file', fileStream, {
//         filename: fileName,
//         contentType: mimeType,
//     });

//     form.append('fileAttributes', JSON.stringify({
//         name: fileName,
//         altText: '',
//         mimeType,
//         tags: [],
//         folders: [],
//         size: fileStats.size,
//     }));

//     const res = await fetch('https://content-content-api.cluster.app-us1.com/files', {
//         method: 'POST',
//         headers: {
//             ...form.getHeaders(),
//             Authorization: `Bearer ${token}`,
//             Accept: 'application/json',
//         },
//         body: form as any,
//     });

//     if (!res.ok) {
//         const err = await res.text();
//         console.error('Upload failed:', res.status, res.statusText, err);
//         throw new Error(`Upload failed: ${res.status}`);
//     }

//     const data = await res.json();
//     console.log('Upload success:', data);
//     return data;

// }


// import util from 'node:util';
// import child_process from 'node:child_process';
// const exec = util.promisify(child_process.exec);

// export async function uploadImage(url: string, token: string): Promise<any> {
//     console.log("Uploading image", url);
//     console.log("Command:", `curl -X POST "https://content-content-api.cluster.app-us1.com/files" \
//   -H "Authorization: Bearer ${token}" \
//   -H "Accept: application/json, text/plain, */*" \
//   -F "file=@./public${url.replace('./', '/')};type=image/png" \
//   -F "fileAttributes=${JSON.stringify(`{\"name\":\"${url.split('/').pop()}\",\"altText\":\"\",\"mimeType\":\"image/png\",\"tags\":[],\"folders\":[],\"size\":$(stat -f%z ./public${url.replace('./', '/')})}`)}"`);
//     const res = await exec(`curl -X POST "https://content-content-api.cluster.app-us1.com/files" \
//   -H "Authorization: Bearer ${token}" \
//   -H "Accept: application/json, text/plain, */*" \
//   -F "file=@./public${url.replace('./', '/')};type=image/png" \
//   -F "fileAttributes=${(`{\"name\":\"${url.split('/').pop()}\",\"altText\":\"\",\"mimeType\":\"image/png\",\"tags\":[],\"folders\":[],\"size\":$(stat -f%z ./public${url.replace('./', '/')})}`)}"`);
//     console.log("Upload image response", res);
//     return res;
// }
