import axios from 'axios';
import { getEnv } from './env';
import assert from 'assert';

const BASE_URL = 'https://bard.google.com';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36';

export async function ask(opts: { message: string }) {
  const psid = getEnv().BARD_PSID;
  assert(psid, 'BARD_PSID is not set in .env');
  assert(opts.message, 'message is required');
  const headers = {
    Host: 'bard.google.com',
    'X-Same-Domain': '1',
    'User-Agent': USER_AGENT,
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    Origin: BASE_URL,
    Referer: BASE_URL + '/',
    Cookie: `__Secure-1PSID=${psid}`,
  };
  const session = axios.create({
    headers,
    withCredentials: true,
  });
  const resp1 = await session.get(BASE_URL, { timeout: 10000 });
  const SNlM0e = resp1.data.match(/"SNlM0e":"(.*?)"/)[1];
  // console.log('SNlM0e', SNlM0e);
  const messageStruct = [
    [opts.message],
    null,
    [/*conversationId*/ '', /*responseId*/ '', /*choiceId*/ ''],
  ];
  const resp2 = await session.post(
    BASE_URL +
      '/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate',
    new URLSearchParams({
      'f.req': JSON.stringify([null, JSON.stringify(messageStruct)]),
      at: SNlM0e,
    }).toString(),
    {
      params: {
        bl: 'boq_assistant-bard-web-server_20230315.04_p2',
        _reqid: Math.floor(Math.random() * 10000),
        rt: 'c',
      },
      timeout: 10000,
    },
  );
  // console.log('resp2.data', resp2.data);
  const chatData = JSON.parse(resp2.data.split('\n')[3])[0][2];
  if (!chatData) {
    console.log(resp2.data);
    throw new Error('chatData is empty');
  }
  const jsonChatData = JSON.parse(chatData);
  // console.log('jsonChatData', jsonChatData);
  const results = {
    content: jsonChatData[0][0],
    conversationId: jsonChatData[1][0],
    responseId: jsonChatData[1][1],
    factualityQueries: jsonChatData[3],
    textQuery: jsonChatData[2]?.[0] || '',
    choices: jsonChatData[4].map((i: any) => ({ id: i[0], content: i[1] })),
  };
  return results;
}

export async function summary(opts: { url: string }) {
  assert(opts.url, 'url is required');
  const message = `Please summary this article shortly. ${opts.url}`;
  return await ask({ message });
}

// ask({ message: 'What is the meaning of life?' }).then(res => {
//   console.log(res.content);
// }).catch((err) => {
//   console.error(err);
//   process.exit(1);
// });

// summary({ url: 'https://rome.tools/blog/2023/05/10/rome12_1/' }).then(res => {
//   console.log(res.content);
// }).catch((err) => {
//   console.error(err);
//   process.exit(1);
// });
