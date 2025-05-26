import type { NextApiRequest, NextApiResponse } from 'next';
import db from "../../db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { phone, auth_card_level = [] } = req.body;

    try {
      // 验证手机号是否已存在
      const existingUser = await db('users').where({ phone }).first();
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '该手机号已注册'
        });
      }

      // 验证等级格式
      const validLevels = ['z1', 'z2', 'z3', 'x1', 'x2', 'x3', 'a1', 'a2', 'a3'];
      const isValidLevel = auth_card_level.every((level: string) => validLevels.includes(level));
      
      if (!isValidLevel) {
        return res.status(400).json({ 
          success: false, 
          message: '无效的等级格式' 
        });
      }

      // 根据等级设置对应的卡牌权限
      const auth_card = auth_card_level.map((level: string) => {
        if (level.startsWith('z')) return "陈靖韬灵犀心理牌";
        if (level.startsWith('x')) return "陈靖韬虹道励志牌";
        if (level.startsWith('a')) return "陈靖韬明心思维牌";
        return level;
      });

      // 创建新用户
      const [id] = await db('users').insert({
        phone,
        auth_card_level: JSON.stringify(auth_card_level),
        auth_card: JSON.stringify(auth_card),
        created_at: new Date()
      });

      return res.status(200).json({
        success: true,
        message: '用户创建成功',
        data: { id }
      });

    } catch (error) {
      console.error('创建用户错误:', error);
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