import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { phone_number, name } = req.body;

    if (!phone_number || !name) {
      return res.status(400).json({ message: '参数不完整' });
    }

    // 更新用户姓名
    const result = await db('users')
      .where({ phone: phone_number })
      .update({ name });

    if (result > 0) {
      return res.status(200).json([{ success: true }]);
    } else {
      return res.status(404).json({ message: '用户不存在' });
    }
  } catch (error) {
    console.error('设置用户名失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
} 