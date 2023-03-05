import 'zx/globals';
import getGitRepoInfo from 'git-repo-info';

(async () => {
  const { branch } = getGitRepoInfo();
  await $`npm run doctor`;
  await $`npm run build`;
  await $`npm version patch`;
  await $`npm publish`;
  await $`git push origin ${branch} --tags`;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
