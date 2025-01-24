import { NextResponse } from 'next/server';

export function middleware(req: Request) {
    const res = NextResponse.next();

    // 设置 CORS 头部
    res.headers.set('Access-Control-Allow-Origin', '*'); // 允许所有域名访问
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // 允许的请求方法
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type'); // 允许的请求头
    res.headers.set('Access-Control-Allow-Credentials', 'true'); // 允许凭证

    if (req.method === 'OPTIONS') {
        // 处理预检请求
        const optionsRes = new Response(null, { status: 200 });
        optionsRes.headers.set('Access-Control-Allow-Origin', '*'); // 确保预检请求也返回此头部
        optionsRes.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        optionsRes.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        optionsRes.headers.set('Access-Control-Allow-Credentials', 'true');
        return optionsRes;
    }

    return res;
}

export const config = {
    matcher: '/api/:path*', // 只对 API 路由应用中间件
}; 