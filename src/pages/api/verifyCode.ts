import type { NextApiRequest, NextApiResponse } from 'next';
import db from "../../db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ code: 405, message: 'Method Not Allowed' });
  }

  const { phone_number, verify_code } = req.body;

  if (!phone_number || !verify_code) {
    return res.status(400).json({ code: 400, message: '手机号和验证码不能为空' });
  }

  try {
    // 查找最新的验证码记录
    const verifyRecord = await db('verify_codes')
      .where({
        phone: phone_number,
        code: verify_code,
      })
      .where('expired_at', '>', new Date())
      .orderBy('created_at', 'desc')
      .first();

    if (!verifyRecord) {
      return res.status(400).json({ 
        code: 400, 
        message: '验证码错误或已过期' 
      });
    }

    // 验证成功后删除该验证码记录
    await db('verify_codes')
      .where({ id: verifyRecord.id })
      .delete();

    return res.status(200).json({ 
      code: 200, 
      message: '验证成功' 
    });
  } catch (error) {
    console.error('验证码验证错误:', error);
    return res.status(500).json({ 
      code: 500, 
      message: '服务器错误' 
    });
  }
} 