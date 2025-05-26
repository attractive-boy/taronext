import type { NextApiRequest, NextApiResponse } from 'next';
import db from "../../db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id, auth_card_level } = req.body;

    try {
      // 处理null或undefined的情况
      const levels = auth_card_level || [];

      // 验证等级格式
      const validLevels = ['z1', 'z2', 'z3', 'x1', 'x2', 'x3', 'a1', 'a2', 'a3'];
      const isValidLevel = levels.every((level: string) => validLevels.includes(level));
      
      if (!isValidLevel) {
        return res.status(400).json({ 
          success: false, 
          message: '无效的等级格式' 
        });
      }

      // 根据等级设置对应的卡牌权限
      const auth_card = levels.map((level: string) => {
        if (level.startsWith('z')) return "陈靖韬灵犀心理牌";
        if (level.startsWith('x')) return "陈靖韬虹道励志牌";
        if (level.startsWith('a')) return "陈靖韬明心思维牌";
        return level;
      });

      // 更新用户等级和卡牌权限
      const result = await db('users')
        .where('id', id)
        .update({ 
          auth_card_level: JSON.stringify(levels),
          auth_card: JSON.stringify(auth_card)
        });

      if (result === 0) {
        return res.status(404).json({ 
          success: false, 
          message: '用户不存在' 
        });
      }

      return res.status(200).json({ 
        success: true, 
        message: '等级更新成功',
        data: result 
      });

    } catch (error) {
      console.error('更新用户等级错误:', error);
      return res.status(500).json({ 
        success: false, 
        message: '服务器错误' 
      });
    }
  }

  return res.status(405).json({ 
    success: false, 
    message: 'Method Not Allowed' 
  });
} 