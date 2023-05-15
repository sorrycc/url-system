import axios from "axios";
import { assert } from "console";

export async function translate(opts: { content: string }) {
  const res = await axios.post('https://wp-rss-fulltext.sorrycc.repl.co/api/deepl/v1/translate', {
    text: opts.content,
  });
  assert(res.data.code === 200 && res.data.data, 'translate failed');
  return res.data.data;
}

// translate({ content: 'hello' }).then(console.log).catch(console.error);
