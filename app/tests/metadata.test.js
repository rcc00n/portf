import test from 'node:test';
import assert from 'node:assert/strict';
import { contract, getMetaForPath, metaTags, renderMetadataHead, fontPaths } from '../src/utils/seo.js';

test('canonical route contract is explicit and query/hash/slash variants normalize', () => {
  assert.equal(Object.keys(contract.routes).length, 12);
  for (const path of Object.keys(contract.routes)) {
    if (path === '/work/renter') continue;
    const meta = getMetaForPath(path + '/?product=unknown#summary');
    assert.equal(meta.canonical, path);
    assert.equal(meta.title, contract.routes[path].title);
  }
  assert.equal(getMetaForPath('/work/random').canonical, null);
  assert.equal(getMetaForPath('/prototype/control-plates').noindex, true);
});
test('case metadata requires exact published CMS identity and never guesses social rights', () => {
  for (const project of [null, {slug:'renter',is_published:false}, {slug:'random',is_published:true}]) {
    assert.equal(getMetaForPath('/work/renter',project).canonical, null);
  }
  const project = {slug:'renter',is_published:true,title:'Reviewed case',blurb:'CMS description'};
  const meta = getMetaForPath('/work/renter',project);
  assert.equal(meta.title,'Reviewed case — RACCN Code');
  assert.equal(meta.description,project.blurb);
  assert.equal(meta.image,contract.image);
  assert.equal(getMetaForPath('/work/renter',null,'error').canonical,null);
});
test('social/noindex/head rendering stays complete, safe and conservatively preloaded', () => {
  const meta = getMetaForPath('/systems/demo');
  assert.equal(metaTags(meta,'https://example.test').robots,'noindex, follow');
  assert.equal(metaTags(meta,'https://example.test')['og:url'],'https://example.test/systems/demo');
  const html=renderMetadataHead({...meta,title:'</title><script>bad</script>'});
  assert.ok(!html.includes('<script>bad'));
  assert.equal(fontPaths('/').length,3);
  assert.equal(fontPaths('/start').length,3);
  assert.equal(fontPaths('/work').length,2);
  assert.equal(metaTags(getMetaForPath('/404'),contract.origin)['og:url'],null);
});

test('migrated evidence, fonts, licences and social preview preserve exact approved bytes', async () => {
  const { readFileSync, existsSync } = await import('node:fs');
  const { createHash } = await import('node:crypto');
  const manifest=JSON.parse(readFileSync(new URL('./production-assets.json',import.meta.url)));
  for (const [path,entry] of Object.entries(manifest)) {
    const data=readFileSync(new URL('../../'+path,import.meta.url));
    assert.equal(createHash('sha256').update(data).digest('hex'),entry.sha256,path);
  }
  const image=readFileSync(new URL('../public/social/raccn-code.png',import.meta.url));
  assert.deepEqual([image.readUInt32BE(16),image.readUInt32BE(20)],[1200,630]);
  assert.equal(existsSync(new URL('../public/prototype/fonts',import.meta.url)),false);
});
