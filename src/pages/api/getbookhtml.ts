import { NextApiRequest, NextApiResponse } from 'next';
import EPub from 'epub';
import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';
import formidable from 'formidable';

// 配置 Next.js 来处理文件上传
export const config = {
    api: {
        bodyParser: false,
    },
};

interface PageContent {
    pageNumber: number;
    content: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {

    try {
        const filePath = path.join(process.cwd(), 'public', '传习志', 'index.epub');

        let pages = await splitEpubToPages(filePath); //去掉前三页

        pages = pages.filter((page, index) => index >= 3);

        return res.status(200).json({
            success: true,
            pages,
            totalPages: pages.length
        });
    } catch (error) {
        console.error('转换失败:', error);
        return res.status(500).json({
            success: false,
            message: '文件处理失败'
        });
    }
}

async function splitEpubToPages(epubPath: string): Promise<PageContent[]> {
    const epub = new EPub(epubPath);

    return new Promise((resolve, reject) => {
        epub.on('end', async () => {
            try {
                const pages: PageContent[] = [];
                let pageNumber = 1;

                for (let i = 0; i < epub.flow.length; i++) {
                    const chapter = epub.flow[i];

                    const content = await new Promise<string>((resolve, reject) => {
                        epub.getChapter(chapter.id, (err: Error, text: string) => {
                            if (err) reject(err);
                            else resolve(text);
                        });
                    });

                    const $ = cheerio.load(content);

                    $('script').remove();
                    $('style').remove();
                    $('[style]').removeAttr('style');

                    const paragraphs = $('p, div, h1, h2, h3, h4, h5, h6');
                    let currentPage = '';
                    let charCount = 0;

                    paragraphs.each((_, elem:any) => {
                        const text = $(elem).html() || '';

                        if (charCount + text.length > 1000) {
                            pages.push({
                                pageNumber: pageNumber++,
                                content: currentPage
                            });

                            currentPage = '';
                            charCount = 0;
                        }

                        currentPage += `<${elem.tagName}>${text}</${elem.tagName}>`;
                        charCount += text.length;
                    });

                    if (currentPage) {
                        pages.push({
                            pageNumber: pageNumber++,
                            content: currentPage
                        });
                    }
                }

                resolve(pages);
            } catch (error) {
                reject(error);
            }
        });

        epub.parse();
    });
}