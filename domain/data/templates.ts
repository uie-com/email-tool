"use server";

import { promises as fs } from 'fs';
import { glob } from 'glob';

export async function getAllTemplates(): Promise<{ path: string, html: string }[]> {
    try {
        const files = await glob('./public/templates/**/*');;
        const paths = files.filter((file) => file.endsWith('.html'));
        const templates = await Promise.all(paths.map((path) => {
            return fs.readFile('./' + path, 'utf-8');
        }));

        const templateObjects = paths.map((path, index) => {
            return {
                path: path,
                html: templates[index]
            };
        });

        return templateObjects;
    } catch (error) {
        console.error("Error reading directory:", error);
        return [];
    }

}
