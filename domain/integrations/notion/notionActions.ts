'use server';

import { matchEmailName, shortenIdentifier } from '@/domain/email/identifiers/parsePrograms';
import { Client } from '@notionhq/client';
import { BlockObjectRequest, BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_EMAIL_DB_ID as string;

export async function updateNotionCard(cardId: string, referenceDoc: string, isDone: boolean, isPreApproved?: boolean): Promise<{ success: boolean; error?: string | null }> {
    let blocks: (BlockObjectRequest)[] = [];
    // if (isPreApproved !== undefined) {
    //     const pageId = !isPreApproved ? NOTION_NEW_TEMPLATE : NOTION_PRE_APPROVED_TEMPLATE;
    //     blocks = await getBlocksRecursively(pageId);
    // }
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
                'Email Task/Status:': {
                    id: 'Email Task/Status:',
                    status: {
                        id: isDone ? '4438c2fc-a667-469e-b9f1-69227231716c' : ':IMV',
                        name: isDone ? 'Sent/Scheduled' : 'Review Email FSOEs',
                        color: isDone ? 'green' : 'pink',
                    },
                },
            },
        });
        console.log('Updated Notion card:', response);

        // if (blocks.length > 0) {
        //     for (const block of blocks) {
        //         const { children, ...blockWithoutChildren } = block as BlockObjectRequest & { children?: BlockObjectRequest[] };

        //         // Append top-level block
        //         const created = await notion.blocks.children.append({
        //             block_id: cardId,
        //             children: [blockWithoutChildren],
        //         });

        //         // If it had children, recursively add them to the new block
        //         if (children && created.results.length > 0) {
        //             const newBlockId = (created.results[0] as BlockObjectResponse).id;
        //             for (const child of children) {
        //                 await appendBlockWithChildren(newBlockId, child);
        //             }
        //         }

        //         console.log('Added Block:', block.type);
        //     }
        // }


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


export async function findNotionCard(date: string, emailName: string, shareReviewBy: string | undefined): Promise<{ success: boolean; url?: string; id?: string; error?: string | null, card?: NotionCard | null }> {
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

    const filteredCards = cards.filter(card => filterCardByName(card, emailName, shareReviewBy));
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
        card: card,
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

function filterCardByName(card: NotionCard, emailName: string, shareReviewBy?: string) {
    let cardName = card.properties.name.title[0].text.content;
    if (!cardName) return false;

    if (shareReviewBy?.trim().length === 0)
        shareReviewBy = undefined;

    console.log('Comparing card name:', cardName, 'with email name:', emailName, 'and shareReviewBy:', shareReviewBy, ' found:', matchEmailName(cardName, emailName, shareReviewBy));

    return matchEmailName(cardName, emailName, shareReviewBy);
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

// Recursively get all blocks and their children
async function getBlocksRecursively(blockId: string): Promise<(BlockObjectRequest & { children?: BlockObjectRequest[] })[]> {
    const blocks: (BlockObjectRequest & { children?: BlockObjectRequest[] })[] = [];
    let cursor: string | undefined = undefined;

    do {
        const response = await notion.blocks.children.list({
            block_id: blockId,
            start_cursor: cursor,
        });

        for (const block of response.results) {
            const typed = block as BlockObjectResponse;
            const newBlock: any = {
                type: typed.type,
                ...(typed.type in typed ? { [typed.type]: (typed as any)[typed.type] } : {}), // safely access block type
            };

            if (typed.has_children) {
                newBlock.children = await getBlocksRecursively(typed.id);
            }

            console.log('Found Block:', newBlock.type);
            blocks.push(newBlock);
        }

        cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
    } while (cursor);

    return blocks;
}

async function appendBlockWithChildren(parentId: string, block: BlockObjectRequest & { children?: BlockObjectRequest[] }) {
    const { children, ...blockWithoutChildren } = block;

    const created = await notion.blocks.children.append({
        block_id: parentId,
        children: [blockWithoutChildren],
    });

    if (children && created.results.length > 0) {
        const newBlockId = (created.results[0] as BlockObjectResponse).id;
        for (const child of children) {
            await appendBlockWithChildren(newBlockId, child);
        }
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