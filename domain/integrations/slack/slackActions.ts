"use server";

type SlackWebhookPayload = {
    Notion: string
    Reviewer: string
    Content: string
    Subject: string
    Priority: string
    EmailId: string
}

export async function createEmailInSlack(notion: string | undefined, referenceDoc: string, subject: string, emailId: string, reviewer: string, priorityFlag: string) {
    const slackData: SlackWebhookPayload = {
        Notion: notion ?? 'https://www.notion.so/centercentre/Email-Calendar-View-087ddad9c1d840fc92dd19179c01f89d?pvs=4',
        Reviewer: reviewer,
        Content: referenceDoc,
        Subject: subject,
        Priority: priorityFlag,
        EmailId: emailId,
    };


    const webhookUrl = process.env.SLACK_CREATE_WEBHOOK_URL;
    if (!webhookUrl) {
        console.error('SLACK_CREATE_WEBHOOK_URL is not defined');
        return { success: false, error: 'SLACK_CREATE_WEBHOOK_URL is not defined' };
    }

    if (!slackData.Reviewer || !slackData.Content || !slackData.Subject || !slackData.Priority || !slackData.EmailId) {
        console.error('Missing required fields in Slack data', slackData);
        return { success: false, error: 'Missing required fields in Slack data' };
    }

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Slack webhook error:', errorText);
        return { success: false, error: `Slack webhook error: ${errorText}` };
    }

    return { success: true };
}

export async function deleteEmailInSlack(emailId: string) {

    if (!emailId) {
        console.error('Email ID is required to delete the email in Slack');
        return { success: false, error: 'Email ID is required' };
    }

    const webhookUrl = process.env.SLACK_DELETE_WEBHOOK_URL;
    if (!webhookUrl) {
        throw new Error('Missing SLACK_DELETE_WEBHOOK_URL in environment variables');
    }

    console.log('Deleting email in Slack with ID:', emailId);


    const response = await fetch(webhookUrl, {
        method: 'POST', // Slack webhooks typically use POST
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailId: emailId }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Slack delete webhook error:', errorText);
        throw new Error('Failed to send delete request to Slack');
    }

    return { success: true };
}

export async function markEmailSentInSlack(emailId: string) {
    if (!emailId) {
        console.error('Email ID is required to mark the email as sent in Slack');
        return { success: false, error: 'Email ID is required' };
    }

    const webhookUrl = process.env.SLACK_SENT_WEBHOOK_URL;
    if (!webhookUrl) {
        throw new Error('Missing SLACK_SENT_WEBHOOK_URL in environment variables');
    }

    console.log('Marking email as sent in Slack with ID:', emailId);

    const response = await fetch(webhookUrl, {
        method: 'POST', // Slack webhooks typically use POST
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailId: emailId }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Slack mark sent webhook error:', errorText);
        throw new Error('Failed to send mark sent request to Slack');
    }

    return { success: true };
}

export async function markEmailUnsentInSlack(emailId: string) {
    if (!emailId) {
        console.error('Email ID is required to mark the email as unsent in Slack');
        return { success: false, error: 'Email ID is required' };
    }

    const webhookUrl = process.env.SLACK_UNDO_SENT_WEBHOOK_URL;
    if (!webhookUrl) {
        throw new Error('Missing SLACK_UNDO_SENT_WEBHOOK_URL in environment variables');
    }

    console.log('Marking email as unsent in Slack with ID:', emailId);

    const response = await fetch(webhookUrl, {
        method: 'POST', // Slack webhooks typically use POST
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailId: emailId }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Slack mark unsent webhook error:', errorText);
        throw new Error('Failed to send mark unsent request to Slack');
    }

    return { success: true };
}