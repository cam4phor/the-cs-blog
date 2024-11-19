import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
): void {
    if (req.method === 'POST') {
        const { title, excerpt, content } = req.body;

        if (!title || !excerpt || !content) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const timestamp = Date.now();
        const filename = `${timestamp}.json`;
        const postData = {
            id: timestamp,
            title,
            excerpt,
            content, // Serialized content from Lexical
            date: new Date().toISOString(),
        };

        const filePath = path.join(process.cwd(), 'data', filename);

        fs.writeFile(filePath, JSON.stringify(postData, null, 2), (err) => {
            if (err) {
                res.status(500).json({ error: 'Error saving post' });
            } else {
                res.status(200).json({ message: 'Post saved', post: postData });
            }
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
