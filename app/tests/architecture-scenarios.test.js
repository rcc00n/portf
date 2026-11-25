import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArchitectureScenario } from '../src/site/architectureScenarios.js';

const products = ['CRM','Marketplace','E-commerce'];
const scales = ['MVP','Growth','Scale'];
const layers = ['frontend','backend','integrations','admin','database','analytics'];

test('all nine conceptual systems are connected and every workflow follows real routes', () => {
  for (const product of products) for (const scale of scales) {
    const scenario = buildArchitectureScenario(product,scale);
    const ids = scenario.nodes.map(node => node.id);
    assert.equal(new Set(ids).size, scale === 'MVP' ? 6 : 8);
    assert.equal(new Set(scenario.edges.map(edge => edge.id)).size, scenario.edges.length);
    for (const id of layers) assert.ok(ids.includes(id));
    for (const edge of scenario.edges) {
      assert.ok(ids.includes(edge.from) && ids.includes(edge.to));
      assert.notEqual(edge.from,edge.to);
      assert.equal(typeof edge.async,'boolean');
    }
    const seen = new Set(['frontend']);
    for (let n=0;n<ids.length;n++) for (const edge of scenario.edges) {
      if (seen.has(edge.from)) seen.add(edge.to);
      if (seen.has(edge.to)) seen.add(edge.from);
    }
    assert.equal(seen.size,ids.length,`${product}/${scale} has isolated nodes`);
    for (let index=0;index<scenario.steps.length;index++) {
      const step = scenario.steps[index];
      assert.ok(ids.includes(step.node));
      assert.ok(step.title && step.detail);
      if (!index) continue;
      const previous = scenario.steps[index-1].node;
      assert.ok(scenario.edges.some(edge =>
        (edge.from===previous && edge.to===step.node) ||
        (edge.to===previous && edge.from===step.node)),`${product}/${scale}: ${previous} → ${step.node}`);
    }
    if (scale !== 'MVP') assert.ok(scenario.steps.some(step => step.node==='queue'));
    if (scale === 'Growth') assert.ok(scenario.steps.some(step => step.node==='cache'));
    if (scale === 'Scale') assert.ok(scenario.steps.some(step => step.node==='replica'));
  }
});

test('product and scale selections change meaningful labels, decisions, layout and topology', () => {
  for (const scale of scales) {
    const scenarios = products.map(product => buildArchitectureScenario(product,scale));
    for (const select of [s=>s.title,s=>s.accent,s=>s.nodes.map(n=>n.title).join(),s=>s.edges.map(e=>e.id).join(),s=>s.nodes.map(n=>`${n.x},${n.y}`).join(),s=>s.nodes.map(n=>`${n.mobileX},${n.mobileY}`).join()]) {
      assert.equal(new Set(scenarios.map(select)).size,3,`${scale} product change must be visible`);
    }
  }
  for (const product of products) {
    const scenarios = scales.map(scale=>buildArchitectureScenario(product,scale));
    for (const select of [s=>s.decision,s=>s.tradeoff,s=>s.nodes.map(n=>n.id).join(),s=>s.edges.map(e=>e.id).join(),s=>s.nodes.find(n=>n.id==='backend').decision]) {
      assert.equal(new Set(scenarios.map(select)).size,3,`${product} scale change must be meaningful`);
    }
  }
});

test('queue, cache and read-model inspectors expose their own responsibilities and options', () => {
  const contracts = new Map();
  for (const product of products) for (const scale of ['Growth','Scale']) {
    const {nodes} = buildArchitectureScenario(product,scale);
    for (const node of nodes) {
      if (layers.includes(node.id)) {
        assert.equal(node.details,undefined,'base layers retain the existing preset detail contract');
        continue;
      }
      for (const key of ['responsibilities','interfaces','stack']) {
        assert.equal(node.details[key].length,3);
        assert.ok(node.details[key].every(value=>typeof value==='string' && value.length));
      }
      contracts.set(node.id,JSON.stringify(node.details));
    }
  }
  assert.equal(contracts.size,3);
  assert.equal(new Set(contracts.values()).size,3);
  const first = buildArchitectureScenario('CRM','Growth').nodes.find(node=>node.id==='cache');
  first.details.responsibilities[0]='Changed';
  const second = buildArchitectureScenario('CRM','Growth').nodes.find(node=>node.id==='cache');
  assert.notEqual(second.details.responsibilities[0],'Changed');
  assert.doesNotMatch(JSON.stringify(second.details),/migration|PITR/);
});

test('desktop and mobile placements keep all interactive surfaces inside the canvas without overlap', () => {
  for (const product of products) for (const scale of scales) {
    const {nodes} = buildArchitectureScenario(product,scale);
    for (const node of nodes) {
      assert.ok(layers.includes(node.layer));
      assert.ok(node.role && node.summary && node.decision && node.tradeoff);
      assert.ok(node.x>=.095 && node.x<=.905 && node.y>=.065 && node.y<=.935);
      assert.ok(node.mobileX>=.2 && node.mobileX<=.8 && node.mobileY>=.05 && node.mobileY<=.95);
    }
    for (let i=0;i<nodes.length;i++) for (const other of nodes.slice(i+1)) {
      const node = nodes[i];
      assert.ok(Math.abs(node.x-other.x)>=.19 || Math.abs(node.y-other.y)>=.13,`${product}/${scale} desktop overlap`);
      assert.ok(Math.abs(node.mobileX-other.mobileX)>=.4 || Math.abs(node.mobileY-other.mobileY)>=.1,`${product}/${scale} mobile overlap`);
    }
  }
});

test('unsupported values never become a silently selected CRM and outputs do not share mutable state', () => {
  for (const product of ['unknown','unsure','Not sure',null,undefined,'constructor']) {
    assert.throws(()=>buildArchitectureScenario(product,'MVP'),RangeError);
  }
  assert.throws(()=>buildArchitectureScenario('CRM','unknown'),RangeError);
  const first = buildArchitectureScenario('CRM','Growth');
  first.nodes[0].title='Changed';first.steps[0].title='Changed';first.edges[0].from='unknown';
  const second = buildArchitectureScenario('CRM','Growth');
  assert.notEqual(second.nodes[0].title,'Changed');
  assert.notEqual(second.steps[0].title,'Changed');
  assert.equal(second.edges[0].from,'frontend');
});
