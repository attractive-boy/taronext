import { NextApiRequest, NextApiResponse } from 'next';
import db  from '@/db'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            let tarotCards = await db('cards').select('deck_name').distinct();
            res.status(200).json(tarotCards);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '获取套牌失败' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
