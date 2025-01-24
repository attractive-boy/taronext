// pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import db from "../../db"; 

const JWT_SECRET = process.env.JWT_SECRET || '';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { phone_number } = req.body;

    try {
      

      // 查找或创建用户
      let user = await db('users').where({ phone: phone_number }).first();
      
      if (!user) {
        // 如果用户不存在，则创建新用户
        const [id] = await db('users').insert({
          phone: phone_number,
          created_at: new Date(),
        });
        user = await db('users').where({ id }).first();
      } 

      // 返回用户信息和token
      return res.status(200).json({
        userInfo: {
          id: user.id,
          phone: user.phone,
        }
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: '服务器错误' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}