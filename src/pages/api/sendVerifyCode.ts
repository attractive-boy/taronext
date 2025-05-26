import type { NextApiRequest, NextApiResponse } from 'next';
import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';
import * as Credential from '@alicloud/credentials';
import * as $tea from '@alicloud/tea-typescript';
import db from "../../db";

const ACCESS_KEY_ID = process.env.ALIYUN_ACCESS_KEY_ID || '';
const ACCESS_KEY_SECRET = process.env.ALIYUN_ACCESS_KEY_SECRET || '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ code: 405, message: 'Method Not Allowed' });
  }

  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ code: 400, message: '手机号不能为空' });
  }

  try {
    // 生成6位随机验证码
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 配置阿里云客户端
    const credentialsConfig = new Credential.Config({
      type: 'access_key',
      accessKeyId: ACCESS_KEY_ID,
      accessKeySecret: ACCESS_KEY_SECRET,
    });
    const credential = new Credential.default(credentialsConfig);
    
    const config = new $OpenApi.Config({
      credential: credential,
    });
    config.endpoint = 'dysmsapi.aliyuncs.com';
    
    const client = new Dysmsapi20170525(config);
    const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
      phoneNumbers: phone_number,
      signName: "验证码短信",
      templateCode: "SMS_318355051",
      templateParam: JSON.stringify({ code: verifyCode }),
    });

    const runtime = new $Util.RuntimeOptions({});
    const result = await client.sendSmsWithOptions(sendSmsRequest, runtime);
    console.log(result);

    if (result?.body?.code === 'OK') {
      // 将验证码保存到数据库，设置5分钟过期
      await db('verify_codes').insert({
        phone: phone_number,
        code: verifyCode,
        created_at: new Date(),
        expired_at: new Date(Date.now() + 5 * 60 * 1000), // 5分钟后过期
      });

      return res.status(200).json({ 
        code: 200, 
        message: '验证码发送成功' 
      });
    } else {
      return res.status(500).json({ 
        code: 500, 
        message: '验证码发送失败' 
      });
    }
  } catch (error) {
    console.error('发送验证码错误:', error);
    return res.status(500).json({ 
      code: 500, 
      message: '服务器错误' 
    });
  }
} 