"use server";


export async function saveNotesDoc(notesName: string, docUrl: string, recordIds: string[], programTable: string, originalIds: string[], pdfUrl?: string) {

    if (!pdfUrl || pdfUrl === '') {
        const res = await fetch('https://pdf.centercentre.com/view', {
            method: 'POST',
            headers: {},
            body: JSON.stringify({
                url: docUrl,
                name: notesName,
                message: false
            })
        });

        const pdfRes = await res.json();
        pdfUrl = pdfRes.url;
    }

    for (const recordId of recordIds) {
        const updatePDFRes = await fetch('https://api.airtable.com/v0/applHtcejl4tEXatp/Calendar', {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${process.env.AIRTABLE_READ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                records: [{
                    id: recordId,
                    fields: {
                        'Collab PDF Link': pdfUrl,
                    }
                }]
            })
        });

        if (!updatePDFRes.ok) {
            const error = await updatePDFRes.text();
            console.error('Error updating PDF link:', error);
            return { success: false, error: 'Failed to update PDF link' };
        }
    }


    for (const originalId of originalIds) {
        const updateNotesRes = await fetch('https://api.airtable.com/v0/appHcZTzlfXAJpL7I/' + programTable, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${process.env.AIRTABLE_READ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                records: [{
                    id: originalId,
                    fields: {
                        'Collab Notes Link': docUrl,
                    }
                }]
            })
        });

        if (!updateNotesRes.ok) {
            const error = await updateNotesRes.text();
            console.error('Error updating notes link:', error);
            return { success: false, error: 'Failed to update notes link' };
        }
    }

    return { success: true, pdfUrl: pdfUrl };
}

export async function undoSaveNotesDoc(recordIds: string[], programTable: string, originalIds: string[]) {
    for (const recordId of recordIds) {
        const updatePDFRes = await fetch('https://api.airtable.com/v0/applHtcejl4tEXatp/Calendar', {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${process.env.AIRTABLE_READ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                records: [{
                    id: recordId,
                    fields: {
                        'Collab PDF Link': null,
                    }
                }]
            })
        });

        if (!updatePDFRes.ok) {
            const error = await updatePDFRes.text();
            console.error('Error undoing PDF link:', error);
            return { success: false, error: 'Failed to undo PDF link' };
        }
    }


    for (const originalId of originalIds) {
        const updateNotesRes = await fetch('https://api.airtable.com/v0/appHcZTzlfXAJpL7I/' + programTable, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${process.env.AIRTABLE_READ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                records: [{
                    id: originalId,
                    fields: {
                        'Collab Notes Link': null,
                    }
                }]
            })
        });

        if (!updateNotesRes.ok) {
            const error = await updateNotesRes.text();
            console.error('Error undoing notes link:', error);
            return { success: false, error: 'Failed to undo notes link' };
        }
    }
    return { success: true };
}