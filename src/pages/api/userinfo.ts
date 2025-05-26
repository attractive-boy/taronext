import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '方法不允许' });
  }

  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({ message: '参数不完整' });
    }

    // 获取用户信息
    const users = await db('users')
      .select('id', 'name', 'phone', 'auth_card_level as level')
      .where({ phone: phone_number });

    if (users.length > 0) {
      // 处理用户等级显示
      const user = users[0];
      let level = '';
      
      if (user.level) {
        try {
          const levels = typeof user.level === 'string' ? JSON.parse(user.level) : user.level;
          if (Array.isArray(levels) && levels.length > 0) {
            level = levels.join(', ');
          }
        } catch (e) {
          console.error('解析用户等级错误:', e);
        }
      }

      return res.status(200).json([{
        id: user.id,
        name: user.name || '用户名',
        level: level
      }]);
    } else {
      return res.status(404).json({ message: '用户不存在' });
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return res.status(500).json({ message: '服务器错误' });
  }
} 