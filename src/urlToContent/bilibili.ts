import assert from 'assert';
import axios from 'axios';

const re = /^https:\/\/www\.bilibili\.com\/video\/(.+?)(\/|$)/;

export async function bilibili(url: string) {
  const match = url.match(re);
  assert(match, `url ${url} does not match ${re}`);
  const bvid = match[1];
  const infoUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
  const { data: infoData } = await axios.get(infoUrl);
  const list = infoData.data.subtitle.list;
  assert(list.length, `subtitle not found`);
  const { data: subtitleData } = await axios.get(list[0].subtitle_url);
  const content = subtitleData.body.map((item: any) => {
    return `${item.from}: ${item.content}`;
  });
  return {
    content: content.join('\n'),
    prompt: `我希望你是一名专业的视频内容编辑，帮我总结视频的内容精华。请你将视频字幕文本进行总结，然后以无序列表的方式返回，不要超过5条。记得不要重复句子，确保所有的句子都足够精简，清晰完整，祝你好运！`,
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
