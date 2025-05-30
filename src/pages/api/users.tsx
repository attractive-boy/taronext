import type { NextApiRequest, NextApiResponse } from 'next';
import db from "../../db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { current = 1, pageSize = 10, name,  phone } = req.query;

      let query = db('users');

      // 添加搜索条件
      if (name) query = query.where('name', 'like', `%${name}%`);

      if (phone) query = query.where('phone', 'like', `%${phone}%`);
 

      // 分别执行计数查询和数据查询
      const countQuery = query.clone().count('* as total');
      const totalResult = await countQuery.first();
      const total = totalResult?.total || 0;

      // 获取分页数据
      const list = await query
        .select('*')  // 明确指定选择所有列
        .orderBy('created_at', 'desc')
        .limit(Number(pageSize))
        .offset((Number(current) - 1) * Number(pageSize));

      return res.status(200).json({
        success: true,
        data: {
          list,
          total,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: '服务器错误' });
    }
  } else if (req.method === 'PUT') {
    const { id, auth_card } = req.body;
    console.log('auth_card = ', auth_card);
    const result = await db('users').where('id', id).update({ auth_card: JSON.stringify(auth_card) });
    return res.status(200).json({ success: true, data: result });
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
} 