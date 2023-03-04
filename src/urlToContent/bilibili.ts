import assert from 'assert';
import axios from 'axios';
import { getEnv } from '../env';

const re = /^https:\/\/www\.bilibili\.com\/video\/(.+?)(\/|$)/;

// ref:
// https://github.com/JimmyLv/BiliGPT/blob/823e01d/utils/3rd/bilibili.ts
export async function bilibili(url: string) {
  const match = url.match(re);
  assert(match, `url ${url} does not match ${re}`);
  const bvid = match[1];
  const infoUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
  const env = getEnv();
  assert(env.BILIBILI_SESSION_DATA, 'BILIBILI_SESSION_DATA is not set');
  const { data: infoData } = await axios.get(infoUrl, {
    headers: {
      Cookie: `SESSDATA=${env.BILIBILI_SESSION_DATA}`,
    },
  });
  const list = infoData.data.subtitle.list;
  const title = infoData.data.title;
  assert(list.length, `subtitle not found for ${infoUrl}`);
  const { data: subtitleData } = await axios.get(list[0].subtitle_url);
  const content = subtitleData.body.map((item: any) => {
    return `${item.from}: ${item.content}`;
  });
  return {
    title,
    content: content.join('\n'),
    prompt: `Please summarize this article in chinese, then list less then 5 takeaways in chinese.`,
  };
}

export function isBilibili(url: string) {
  return /^https:\/\/www\.bilibili\.com\/video\/(.+?)\//.test(url);
}

if (require.main === module) {
  (async () => {
    const url = 'https://www.bilibili.com/video/BV1EW411u7th';
    console.log(await bilibili(url));
  })().catch(e => {
    console.error(e);
  });
}

/*
// https://github.com/AdvMaple/bilibili-subtitle-download-plugin/blob/feature/download.user.js
cid=38442945
aid=21376839

// https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/video/info.md
https://api.bilibili.com/x/web-interface/view?aid=779229662

// TODO: 基于 https://github.com/yt-dlp/yt-dlp
https://comment.bilibili.com/38442945.xml

https://api.bilibili.com/x/player/v2?cid=38442945&aid=21376839
https://api.bilibili.tv/intl/gateway/web/v2/subtitle?s_locale=vi_VN&platform=web&episode_id=38442945&spm_id=bstar-web.pgc-video-detail.0.0&from_spm_id=bstar-web.homepage.top-list.all
*/
