'use server';

import { Client } from '@notionhq/client';
import { shortenIdentifier } from '../parse/parsePrograms';
import { error } from 'console';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_EMAIL_DB_ID as string;

export async function updateNotionCard(cardId: string, referenceDoc: string, isDone: boolean): Promise<{ success: boolean; error?: string | null }> {
    try {
        const response = await notion.pages.update({
            page_id: cardId,
            properties: {
                'Google Docs': {
                    id: 'Google Docs',
                    url: referenceDoc,
                },
                'Checkbox': {
                    id: 'Checkbox',
                    checkbox: isDone,
                },
            },
        });
        console.log('Updated Notion card:', response);
        return {
            success: true,
            error: null,
        };
    } catch (error) {
        console.error('Error updating Notion card:', error);
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

export async function deleteNotionCard(cardId: string) {
    try {
        const response = await notion.pages.update({
            page_id: cardId,
            archived: true,
        });
        console.log('Deleted Notion card:', response);
        return {
            success: true,
            id: response.id,
            error: null,
        };
    } catch (error) {
        console.error('Error deleting Notion card:', error);
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}


export async function findNotionCard(date: string, emailName: string): Promise<{ success: boolean; url?: string; id?: string; error?: string | null }> {
    console.log('Finding Notion card with date:', date, 'and emailName:', emailName);
    const potentialCards = await getNotionCardByDate(date);
    if (!potentialCards.success) {
        console.error('Error fetching Notion cards:', potentialCards.error);
        return {
            success: false,
            error: potentialCards.error,
        };
    }
    const cards = potentialCards.results ?? [];
    if (cards.length === 0) {
        console.log('No cards found for the given date:', date);
        return {
            success: false,
        };
    }

    const filteredCards = cards.filter(card => filterCardByName(card, emailName));
    if (filteredCards.length === 0) {
        console.log('No cards found matching the email name:', emailName);
        return {
            success: false,
        };
    }

    const card = filteredCards[0];
    console.log('Found card:', card);
    return {
        success: true,
        url: card.url,
        id: card.id,
        error: null,
    };
}

export async function createNotionCard(date: string, emailName: string): Promise<{ success: boolean; url?: string; id?: string; error?: string | null }> {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseId },
            properties: {
                'Schedule Date': {
                    date: {
                        start: date,
                    },
                },
                name: {
                    title: [
                        {
                            text: {
                                content: shortenIdentifier(emailName),
                            },
                        },
                    ],
                },
            },
        });
        console.log('Created Notion card:', response);
        return {
            success: true,
            id: response.id,
            url: (response as NotionCard).url,
            error: null,
        };
    } catch (error) {
        console.error('Error creating Notion card:', error);
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}

function filterCardByName(card: NotionCard, emailName: string) {
    let cardName = card.properties.name.title[0].text.content;
    if (!cardName) return false;

    let emailNames = emailName.split(' ');
    let shortenedEmailNames = shortenIdentifier(emailName).split(' ');

    // // Remove cohort from win, USE IF COMBINING QA
    // if (emailNames.includes('Win')) {
    //     const index = emailNames.indexOf('Win');
    //     if (index > -1) {
    //         emailNames.splice(index + 1, 1);
    //     }
    //     const index2 = shortenedEmailNames.indexOf('Win');
    //     if (index2 > -1) {
    //         shortenedEmailNames.splice(index2 + 1, 1);
    //     }
    // }

    const hasAllEmailNames = emailNames.every(emailName => cardName.toLowerCase().replace(/\s+/g, '').includes(emailName.toLowerCase().replace(/\s+/g, '')));
    const hasAllShortenedEmailNames = shortenedEmailNames.every(shortenedEmailName => cardName.toLowerCase().replace(/\s+/g, '').includes(shortenedEmailName.toLowerCase().replace(/\s+/g, '')));
    if (hasAllEmailNames || hasAllShortenedEmailNames) return true;
    return false;
}

async function getNotionCardByDate(date: string) {
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                and: [
                    {
                        property: 'Schedule Date',
                        date: {
                            equals: date, // format: 'YYYY-MM-DD'
                        },
                    },
                ]

            },
        });

        const filteredResults = (response.results as NotionCard[]).filter((result: NotionCard) => result.in_trash === false && result.archived === false);
        return {
            success: true,
            results: filteredResults,
        };
    } catch (error) {
        console.error('Error querying Notion:', error);
        return {
            success: false,
            error: (error as Error).message,
        };
    }
}


type NotionCard = {
    object: "page";
    id: string;
    archived: boolean;
    in_trash: boolean;
    properties: {
        Tags: {
            id: string;
            type: "multi_select";
            multi_select: Array<unknown>;
        };
        Checkbox: {
            id: string;
            type: "checkbox";
            checkbox: boolean;
        };
        name: {
            id: string;
            type: "title";
            title: Array<{
                type: "text";
                text: {
                    content: string;
                    link: string | null;
                };
                annotations: {
                    bold: boolean;
                    italic: boolean;
                    strikethrough: boolean;
                    underline: boolean;
                    code: boolean;
                    color: string;
                };
                plain_text: string;
                href: string | null;
            }>;
        };
        "Google Docs": {
            id: string;
            type: "url";
            url: string | null;
        };
        "Schedule Date": {
            id: string;
            type: "date";
            date: {
                start: string;
                end: string | null;
                time_zone: string | null;
            };
        };
        "Email Task/Status:": {
            id: string;
            type: "status";
            status: {
                id: string;
                name: string;
                color: string;
            };
        };
    };
    url: string;
    public_url: string | null;
}