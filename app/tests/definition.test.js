import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { beforeEach, test } from 'node:test';
import * as definition from '../src/site/definition.js';
import { buildEstimate } from '../src/pages/engineering/estimateData.js';
import { migrationDestination } from '../src/site/routeMigration.js';

beforeEach(() => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    clear: () => values.clear(),
  };
});

const aliases = ['unsure', 'unknown', 'not sure', 'Not sure'];
for (const alias of aliases) {
  test(`URL ${alias} remains unknown through a share link and inquiry`, () => {
    const result = definition.loadDefinition(`?product=${encodeURIComponent(alias)}&complexity=medium`);
    assert.equal(result.inputs.product, 'unsure');
    assert.equal(result.inputs.complexity, 'Balanced');
    const shared = definition.definitionSearch(result.selected);
    assert.equal(new URLSearchParams(shared).get('product'), 'unsure');
    assert.equal(new URLSearchParams(shared).get('team'), null);
    assert.equal(definition.loadDefinition(`?${shared}`).inputs.product, 'unsure');
    assert.deepEqual(definition.inquiryQualification(result.selected, result.qualification).projectType,
      {value: 'unsure', label: 'Not sure'});
  });

  test(`legacy qualification ${alias} remains unknown`, () => {
    definition.saveStorage('qualificationGate', {projectType: alias, complexity: 'medium'});
    const result = definition.loadDefinition();
    assert.equal(result.inputs.product, 'unsure');
    assert.equal(result.qualification.projectType, 'unsure');
    assert.equal(result.inputs.complexity, 'Balanced');
  });

  test(`saved estimate ${alias} remains unknown`, () => {
    definition.saveStorage('estimateSnapshot', {product: alias, complexity: 'Advanced'});
    assert.equal(definition.loadDefinition().inputs.product, 'unsure');
  });
}

test('legacy estimate fallback must not overwrite explicit unknown qualification', () => {
  definition.saveStorage('qualificationGate', {projectType: 'unsure', complexity: 'medium'});
  definition.saveStorage('estimateSnapshot', {product: 'CRM', complexity: 'Advanced', team: 'Small'});
  const result = definition.loadDefinition();
  assert.equal(result.inputs.product, 'unsure');
  assert.equal(result.inputs.complexity, 'Advanced');
  assert.equal(result.inputs.team, 'Small');
  assert.equal(definition.loadDefinition('?product=saas').inputs.product, 'SaaS');
});

test('valid query > saved estimate > qualification > example precedence is preserved', () => {
  definition.saveStorage('qualificationGate', {projectType: 'saas', complexity: 'medium'});
  definition.saveStorage('estimateSnapshot', {product: 'Marketplace', team: 'Small'});
  assert.deepEqual(definition.loadDefinition('?product=commerce&team=Expanded').inputs,
    {product: 'E-commerce', complexity: 'Balanced', team: 'Expanded', integrations: 'Standard'});
});

test('81 original estimator combinations retain complete ranges, notes and block tags', () => {
  const fixture = JSON.parse(readFileSync(new URL('./fixtures/estimator-legacy.json', import.meta.url), 'utf8'));
  assert.equal(fixture.cases.length, 81);
  for (const {inputs, expected} of fixture.cases) assert.deepEqual(buildEstimate(inputs), expected, JSON.stringify(inputs));
});

test('SaaS keeps its corrected weight and dedicated system evidence', () => {
  assert.equal(definition.loadDefinition('?product=saas').inputs.product, 'SaaS');
  for (const complexity of ['Lean', 'Balanced', 'Advanced']) {
    for (const team of ['Small', 'Core', 'Expanded']) {
      for (const integrations of ['None', 'Standard', 'Heavy']) {
        const inputs = {product: 'SaaS', complexity, team, integrations};
        const estimate = buildEstimate(inputs);
        const crm = buildEstimate({...inputs, product: 'CRM'});
        assert.deepEqual(estimate.timeline, crm.timeline);
        assert.deepEqual(estimate.budget, crm.budget);
        assert.ok(estimate.blocks.find(block => block.id === 'backend').tags.includes('Tenant boundaries'));
        assert.ok(!estimate.blocks.find(block => block.id === 'backend').tags.includes('Workflow engine'));
      }
    }
  }
});

test('legacy redirects preserve unknown project query values', () => {
  for (const product of aliases) {
    const destination = migrationDestination('/contact', `?product=${encodeURIComponent(product)}`);
    assert.equal(new URL(destination, 'http://localhost').searchParams.get('product'), product);
    assert.equal(new URL(destination, 'http://localhost').searchParams.get('definition'), '1');
  }
});

test('unknown summary labels CRM only as an example and leaves visitor state untouched', () => {
  const result = definition.loadDefinition('?product=unknown&complexity=medium');
  const before = structuredClone(result);
  const summary = definition.buildDefinitionSummary(result.selected);
  assert.equal(summary.productLabel, 'Not sure');
  assert.equal(summary.scopeLabel, 'Balanced scope.');
  assert.equal(summary.illustrative, true);
  assert.match(summary.assumptionNote, /Example assumptions: CRM product/);
  assert.match(summary.assumptionNote, /not submitted as your choices/);
  assert.deepEqual(summary.estimate, buildEstimate({...definition.defaults, complexity:'Balanced'}));
  assert.deepEqual(result, before);
  assert.match(definition.definitionChoiceLabel(result.selected), /^Not sure/);
  assert.equal(definition.definitionSource(result.selected), 'site-start:unsure/Balanced/unspecified/unspecified');
});

test('sample defaults never become selected values through optional planning or sharing', () => {
  definition.saveStorage('qualificationGate', {budget:'10_25k'});
  const result = definition.loadDefinition();
  assert.equal(result.hasInputs, true);
  assert.deepEqual(result.selected, {});
  assert.equal(definition.definitionSearch(result.selected), '');
  assert.deepEqual(definition.inquiryQualification(result.selected, result.qualification),
    {budget:{value:'10_25k',label:'$10k–25k'}});
  assert.equal(definition.buildDefinitionSummary(result.selected).productLabel, 'Product not specified');
  assert.equal(definition.definitionSource(result.selected), 'site-start:unspecified/unspecified/unspecified/unspecified');
});

test('new snapshots persist only actual choices, including explicit uncertainty', () => {
  const selected = {product:'unsure', integrations:'Heavy'};
  assert.equal(definition.saveDefinition(selected), true);
  const stored = JSON.parse(localStorage.getItem('estimateSnapshot'));
  assert.equal(stored.version, 2);
  assert.equal(stored.product, 'unsure');
  assert.ok(!Object.hasOwn(stored, 'complexity'));
  assert.ok(!Object.hasOwn(stored, 'team'));
  assert.deepEqual(definition.loadDefinition().selected, selected);
});

test('an explicit new choice can resolve old uncertainty and can become unknown again', () => {
  definition.saveStorage('qualificationGate', {projectType:'unknown'});
  definition.saveDefinition({product:'SaaS'});
  assert.equal(definition.loadDefinition().inputs.product, 'SaaS');
  definition.saveDefinition({product:'unsure'});
  assert.equal(definition.loadDefinition().inputs.product, 'unsure');
});

test('all selected valid fields produce the original indicative estimate without hidden assumptions', () => {
  const choices = {product:'Marketplace',complexity:'Advanced',team:'Small',integrations:'Heavy'};
  const summary = definition.buildDefinitionSummary(choices);
  assert.equal(summary.illustrative, false);
  assert.equal(summary.assumptionNote, '');
  assert.deepEqual(summary.estimate, buildEstimate(choices));
});

test('malformed/blocked storage and invalid input cannot turn defaults into visitor intent', () => {
  localStorage.setItem('qualificationGate', '{invalid');
  localStorage.setItem('estimateSnapshot', 'null');
  const result = definition.loadDefinition('?product=unsupported&complexity=invalid');
  assert.deepEqual(result.selected, {});
  assert.equal(result.hasInputs, false);
  assert.equal(definition.inquiryQualification(result.selected), null);
  globalThis.localStorage = {getItem:()=>{throw new Error('blocked');},setItem:()=>{throw new Error('blocked');}};
  assert.equal(definition.loadDefinition('?product=unknown').inputs.product, 'unsure');
  assert.equal(definition.saveDefinition({product:'unsure'}), false);
});
