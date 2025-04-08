
function fetchAirtableData(url: string): Promise<any> {

    return new Promise((resolve, reject) => {
        fetch(url, {
            headers: {
                'Authorization': `Bearer ${process.env.AIRTABLE_READ_API_KEY}`
            }
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .then((data) => resolve(data))
            .catch((error) => reject(error));
    });
}