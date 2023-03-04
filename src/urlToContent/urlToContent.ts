import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import { bilibili, isBilibili } from './bilibili';

export async function urlToContent(url: string) {
  if (isBilibili(url)) {
    return await bilibili(url);
  }
  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
    }
  });
  const html = res.data;
  const doc = new JSDOM(html, {
    url,
  });
  doc.window.document.querySelectorAll('pre').forEach(el => {
    el.parentNode?.removeChild(el);
  });
  const root = doc.window.document;

  // openai blog
  if (url.startsWith('https://openai.com/blog')) {
    const el = root.querySelector('#blog-details-introducing-chatgpt-and-whisper-apis > div:nth-child(5)');
    if (el) {
      el.parentNode?.removeChild(el);
    }
  }

  const reader = new Readability(root, {
    debug: !!process.env.DEBUG,
  });
  const parseResult = reader.parse()!;
  return {
    title: parseResult.title,
    content: parseResult.textContent,
    prompt: `Please summarize this article in chinese.`,
  };
}

// main
if (require.main === module) {
  (async () => {
    const url = 'https://openai.com/blog/introducing-chatgpt-and-whisper-apis';
    const article = await urlToContent(url);
    console.log(article);
  })().catch(e => {
    console.error(e);
  });
}
