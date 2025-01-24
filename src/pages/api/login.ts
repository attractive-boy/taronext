// pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';

import db from "../../db"; 



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    try {

      if(username == 'admin' && password == 'admin') {
        return res.status(200).json({ message: '登录成功' });
      }else{
        return res.status(401).json({ message: '用户名或密码错误' });
      }

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: '服务器错误' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}