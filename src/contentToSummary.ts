import { encoding_for_model } from '@dqbd/tiktoken';
import assert from "assert";
import axios from 'axios';
import { getEnv } from './env';

const CHATGPT_MODEL = 'gpt-3.5-turbo';
const PROMPT = `Please summarize this article in chinese.`;

const maxModelTokens = 4096;
const maxResponseTokens = 500;
const maxNumTokens = maxModelTokens - maxResponseTokens;
const tokenizer = encoding_for_model('text-davinci-003');
function getTokenLength(str: string) {
  return tokenizer.encode(str).length;
}

class ChatGPTAPI {
  private opts: { apiKey: string; completionParams: any };
  constructor(opts: { apiKey: string; completionParams: any}) {
    this.opts = opts;
  }
  sendMessage(message: string) {
    const { apiKey, completionParams } = this.opts;
    const url = `https://api.openai.com/v1/chat/completions`;
    const nextNumTokensEstimate = getTokenLength(message);
    const isValidPrompt = nextNumTokensEstimate <= maxNumTokens;
    assert(isValidPrompt, `Prompt is too long: ${nextNumTokensEstimate} > ${maxNumTokens} tokens`);
    const maxTokens = Math.max(
      1,
      Math.min(maxModelTokens - nextNumTokensEstimate, maxResponseTokens)
    );

    return axios.post(url, {
      model: CHATGPT_MODEL,
      temperature: 0.5,
      top_p: 0.8,
      presence_penalty: 1.0,
      ...completionParams,
      max_tokens: maxTokens,
      messages: [{
        "role": "system",
        content: message,
      }],
      stream: false,
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
    }).catch(e => {
      console.log(e);
    });
  }
}

export async function contentToSummary(opts: {
  content: string,
  prompt?: string,
}) {
  const env = getEnv();
  assert(env.OPENAI_API_KEY, "OPENAI_API_KEY is not set");
  const api = new ChatGPTAPI({
    apiKey: env.OPENAI_API_KEY,
    completionParams: {
      temperature: 0.5,
      top_p: 0.8,
    },
  });
  const prompt = opts.prompt || PROMPT;
  const res = await api.sendMessage(`${prompt}\n${opts.content}`);
  assert(res, `res is not set`);
  return res.data;
}

// main
if (require.main === module) {
  (async () => {
    const content = `ChatGPT and Whisper models are now available on our API, giving developers access to cutting-edge language (not just chat!) and speech-to-text capabilities. Through a series of system-wide optimizations, we’ve achieved 90% cost reduction for ChatGPT since December; we’re now passing through those savings to API users. Developers can now use our open-source Whisper large-v2 model in the API with much faster and cost-effective results. ChatGPT API users can expect continuous model improvements and the option to choose dedicated capacity for deeper control over the models. We’ve also listened closely to feedback from our developers and refined our API terms of service to better meet their needs.Early users of ChatGPT and Whisper APIsSnap Inc., the creator of Snapchat, introduced My AI for Snapchat+ this week.`;
    const summary = await contentToSummary({ content });
    console.log(summary);
  })().catch(e => {
    console.error(e);
  });
}
