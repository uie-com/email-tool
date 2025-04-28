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