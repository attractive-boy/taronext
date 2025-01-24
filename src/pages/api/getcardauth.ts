import { NextApiRequest, NextApiResponse } from 'next';
import db  from '@/db'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { phone_number } = req.body;
        try {
            let tarotCards = await db('users').where({ phone: phone_number }).select('auth_card');
            res.status(200).json(tarotCards[0].auth_card); 
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '获取塔罗牌失败' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
