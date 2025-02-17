import { NextApiRequest, NextApiResponse } from 'next';
import db  from '@/db'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            let tarotCards = await db('mailoon').select('*');
            res.status(200).json(tarotCards); 
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '获取脉轮信息失败' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}