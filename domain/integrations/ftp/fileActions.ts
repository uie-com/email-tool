"use server";

import crypto from "crypto";
import SFTPClient from "ssh2-sftp-client";
import { Readable } from "stream";


const SFTP_USER = process.env.FTP_USER;
const SFTP_PASS = process.env.FTP_PASS;
const SFTP_HOST = process.env.FTP_HOST;
const SFTP_PORT = process.env.SFTP_PORT ? parseInt(process.env.SFTP_PORT) : 22;

const REMOTE_DIR = "/home/asset/emails/img";


export async function saveFileAction(file: File) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileStream = Readable.from(buffer);

    const sftp = new SFTPClient();

    const fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
    const hashFileName = `${fileHash}${getFileExtension(file.name)}`;
    const remotePath = `${REMOTE_DIR}/${hashFileName}`;

    try {
        await sftp.connect({
            host: SFTP_HOST,
            port: SFTP_PORT,
            username: SFTP_USER,
            password: SFTP_PASS,
        });

        const existingFiles = await sftp.list(REMOTE_DIR);
        const alreadyExists = existingFiles.some(file => file.name === hashFileName);

        if (alreadyExists) {
            console.log("File with same hash already exists. Skipping upload.");
            return `https://asset.uie.com/emails/img/${encodeURIComponent(hashFileName)}`;
        }

        await sftp.put(buffer, remotePath);
        console.log(`File uploaded to https://asset.uie.com/emails/img/${encodeURIComponent(file.name)}`);
    } catch (err) {
        console.error("SFTP Upload Error:", err);
        throw new Error("Failed to upload file to SFTP server.");
    } finally {
        sftp.end();
    }

    return `https://asset.uie.com/emails/img/${encodeURIComponent(hashFileName)}`;
}

function getFileExtension(name: string): string {
    const lastDot = name.lastIndexOf(".");
    return lastDot !== -1 ? name.slice(lastDot) : "";
}