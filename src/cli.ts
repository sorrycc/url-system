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
  let summary = cache.get(url);
  if (args.force || !summary) {
    const { content, prompt } = (await urlToContent(url as string));
    assert(content, 'content is not set');
    console.log('> got content');
    summary = await contentToSummary({
      content,
      prompt,
    });
    console.log('> got summary');
    if (!args.test) {
      cache.set(url, summary);
    }
  } else {
    console.log('> it\'s cached');
  }
  console.log(pangu.spacing(summary.choices[0].message.content));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

