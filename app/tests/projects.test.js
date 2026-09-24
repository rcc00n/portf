import assert from 'node:assert/strict';
import { test } from 'node:test';
import { casePath, imageAlt, loadHomepageProjects, presentProject, publishedProjects, selectHomepageProjects, selectProjectEvidence } from '../src/projects/catalog.js';

const project = (slug, overrides={}) => ({id:1,slug,title:slug,is_published:true,order:0,featured_order:0,featured_placement:'',impact:'CMS type',blurb:'CMS copy',url:'',links:[],media:[],...overrides});

test('published flags and explicit placements replace seed/title matching', () => {
  const data=[project('hidden',{is_published:false,featured_placement:'supporting'}),project('unrelated',{title:'Bad Guy Renter WorldDoc motorcycle doctor finder',featured_placement:''}),project('chosen',{featured_placement:'supporting'})];
  assert.deepEqual(selectHomepageProjects(data).map(p=>p.slug),['chosen']);
  assert.deepEqual(selectProjectEvidence(data).archive.map(p=>p.slug),['unrelated']);
  assert.deepEqual(selectHomepageProjects([]),[]);
  assert.equal(selectProjectEvidence([]).lead,null);
});

test('public and featured ordering use explicit independent CMS fields', () => {
  const data=[project('later',{id:2,order:4,featured_placement:'supporting',featured_order:1}),project('earlier',{id:3,order:1,featured_placement:'supporting',featured_order:3}),project('tie',{id:4,order:1})];
  assert.deepEqual(publishedProjects(data).map(p=>p.slug),['earlier','tie','later']);
  assert.deepEqual(selectHomepageProjects(data).map(p=>p.slug),['later','earlier']);
});

test('CMS media, alt, title, copy and links flow into featured evidence without unrelated fallbacks', () => {
  const record=project('worlddoc',{title:'CMS identity',featured_placement:'supporting',media:[{id:1,order:0,url:'https://media.example.org/new.png',alt:'CMS meaningful alt'}],links:[{label:'Live',href:'https://example.org/live'}]});
  const view=presentProject(record);
  assert.equal(view.image,record.media[0].url);
  assert.equal(view.imageAlt,'CMS meaningful alt');
  assert.equal(view.title,'CMS identity');
  assert.equal(view.href,'https://example.org/live');
  const missing=presentProject(project('worlddoc',{blurb:'',impact:''}));
  assert.equal(missing.image,undefined);
  assert.equal(missing.href,'');
  assert.equal(missing.blurb,'');
  assert.equal(missing.type,'');
  assert.equal(imageAlt(record,{alt:''}), 'CMS identity — project image 1');
});

test('only approved case identity receives a public case route', () => {
  assert.equal(casePath(project('renter',{title:'New public name'})),'/work/renter');
  for(const slug of ['renter-copy','constructor','not-a-real-case'])assert.equal(casePath(project(slug,{title:'Renter'})),null);
});

test('empty API is success; failure and malformed response throw instead of restoring seeds', async () => {
  const original=globalThis.fetch;
  try {
    globalThis.fetch=async()=>({ok:true,json:async()=>[]});
    assert.deepEqual(await loadHomepageProjects(),[]);
    globalThis.fetch=async()=>({ok:false,status:503});
    await assert.rejects(loadHomepageProjects(),/503/);
    for(const data of [{projects:[]},[{}],[project('bad',{media:[{}]})]]){
      globalThis.fetch=async()=>({ok:true,json:async()=>data});
      await assert.rejects(loadHomepageProjects(),/Invalid/);
    }
    globalThis.fetch=async()=>({ok:true,json:async()=>[project('hidden',{is_published:false}),project('live')]});
    assert.deepEqual((await loadHomepageProjects()).map(p=>p.slug),['live']);
  }finally{globalThis.fetch=original;}
});
