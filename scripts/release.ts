import 'zx/globals';
import getGitRepoInfo from 'git-repo-info';

(async () => {
  const { branch } = getGitRepoInfo();
  await $`npm run build`;
  await $`npm version patch`;
  // const newVersion = require('../package.json').version;
  await $`npm publish`;

  // commit and tag and push
  // await $`git commit -am "release: ${newVersion}"`;
  // await $`git tag v${newVersion}`;
  await $`git push origin ${branch} --tags`;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
