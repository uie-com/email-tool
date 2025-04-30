"use server";

export async function getToken(code?: string, refreshToken?: string) {
    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(
            code ? {
                code,
                client_id: process.env.GOOGLE_CLIENT_ID ?? '',
                client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
                redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? '',
                grant_type: 'authorization_code',
            } : {
                refresh_token: refreshToken ?? '',
                client_id: process.env.GOOGLE_CLIENT_ID ?? '',
                client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
                grant_type: 'refresh_token',
            }),
    });

    if (!res.ok) {
        console.error('Failed to fetch token');
        console.error('Response: ', res);
    }

    return res.json();
}

export async function testGoogleToken(token: string) {
    if (!token || token === '') {
        console.error('No token provided');
        return;
    }
    const res = await fetch('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' + token, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        console.error('Failed to test token: ', token);
        console.error('Response: ', res);
    }
    return res.json();
}

type CopyDocResult = {
    success: boolean;
    newFileId?: string;
    newFileName?: string;
    error?: string;
};

export async function copyGoogleDocByUrl(docUrl: string, newName: string, accessToken: string): Promise<CopyDocResult> {
    try {
        // Extract File ID from URL
        const match = docUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (!match || !match[1]) {
            return { success: false, error: 'Invalid Google Docs URL' };
        }

        const fileId = match[1].trim();
        console.log('Copying Google Doc:', fileId);


        // Get the file metadata to determine folder and name
        const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,parents&supportsAllDrives=true`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!metaRes.ok) {
            console.log('Copying Google Doc:', metaRes);

            return { success: false, error: 'Failed to fetch file metadata' };
        }

        const { name, parents } = await metaRes.json();

        // Copy the file
        const copyRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/copy?supportsAllDrives=true`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: newName,
                parents: parents, // Same folder as original
            }),
        });

        if (!copyRes.ok) {
            const err = await copyRes.json();
            return { success: false, error: `Copy failed: ${err.error?.message || 'Unknown error'}` };
        }

        const newFile = await copyRes.json();
        return {
            success: true,
            newFileId: newFile.id,
            newFileName: newFile.name,
        };
    } catch (err: any) {
        return { success: false, error: err.message || 'Unexpected error' };
    }
}

type DeleteDocResult = {
    success: boolean;
    error?: string;
};

export async function deleteGoogleDocByUrl(url: string, accessToken: string): Promise<DeleteDocResult> {
    if (!url || !accessToken) {
        return { success: false, error: 'Missing file ID or access token' };
    }

    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (!match || !match[1]) {
        return { success: false, error: 'Invalid Google Docs URL' };
    }

    const fileId = match[1];

    try {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?supportsAllDrives=true`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trashed: true }),
        });

        if (res.status === 204 || res.status === 200) {
            return { success: true };
        }

        const error = await res.json();
        return { success: false, error: error?.error?.message || 'Failed to delete document' };

    } catch (err: any) {
        return { success: false, error: err.message || 'Unexpected error' };
    }
}