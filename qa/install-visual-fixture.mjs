import fs from 'node:fs/promises';
import path from 'node:path';

if (process.env.CI !== 'true' || process.env.QA_VISUAL_FIXTURES !== '1') {
  throw new Error('Visual fixture installation is restricted to the isolated CI build');
}
const root = await fs.realpath(process.cwd());
const app = await fs.realpath(path.join(root, 'app'));
if (app !== path.join(root, 'app')) throw new Error('Unexpected app path');
const target = path.join(app, 'qa-plus-fixture');
await fs.mkdir(target);
await fs.copyFile(path.join(root, 'qa/fixtures/PlusFixture.tsx'), path.join(target, 'page.tsx'), fs.constants.COPYFILE_EXCL);
console.log('Installed isolated Plus rendering fixture; production route source is unchanged.');
