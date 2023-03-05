import yParser from 'yargs-parser';
import { urlToContent } from './urlToContent/urlToContent';
import assert from 'assert';
import path from 'path';
// @ts-ignore
import pangu from 'pangu';
import { Cache } from './cache';
import { contentToSummary } from './contentToSummary';

async function main() {
  const cache = new Cache({
    filePath: path.join(__dirname, '../data/cache.json'),
  });
  const args = yParser(process.argv.slice(2), {});
  console.log('> args', JSON.stringify(args));
  const url = args._[0] as string;
  assert(url, 'url is not set');
  let result = cache.get(url);
  if (args.force || !result) {
    const { content, prompt, title } = (await urlToContent(url as string));
    assert(content, 'content is not set');
    console.log('> got content');
    const summary_raw = await contentToSummary({
      content,
      prompt,
    });
    const summary = pangu.spacing(summary_raw.choices[0].message.content).trim();
    console.log('> got summary');
    if (!args.test) {
      cache.set(url, {
        title,
        content,
        summary,
        summary_raw,
        created_at: new Date().getTime(),
      });
    }
  } else {
    console.log('> it\'s cached');
  }
  console.log(result.summary);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

