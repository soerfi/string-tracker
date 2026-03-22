import { test } from 'node:test';
import * as assert from 'node:assert';
import { calculateDeadDate, calculateHealthPercentage, getHealthStatus } from './decay';

test('calculateDeadDate calculates correctly with standard inputs', () => {
  const stringDate = new Date('2026-03-22T00:00:00Z');
  const baseLifeHours = 12;
  const skillMultiplier = 1.0;
  const freq = 4; // 12 * 1 / 4 = 3 weeks = 21 days
  
  const deadDate = calculateDeadDate(stringDate, baseLifeHours, skillMultiplier, freq);
  assert.strictEqual(deadDate.toISOString(), '2026-04-12T00:00:00.000Z');
});

test('calculateHealthPercentage clamps values', () => {
  const start = new Date('2026-03-01T00:00:00Z');
  const dead = new Date('2026-03-11T00:00:00Z'); // 10 days
  
  const p1 = calculateHealthPercentage(start, dead, new Date('2026-03-06T00:00:00Z'));
  assert.strictEqual(p1, 50);
  
  const p2 = calculateHealthPercentage(start, dead, new Date('2026-04-01T00:00:00Z'));
  assert.strictEqual(p2, 0); // Way over
  
  const p3 = calculateHealthPercentage(start, dead, new Date('2026-02-01T00:00:00Z'));
  assert.strictEqual(p3, 100); // Future date
});

test('getHealthStatus logic', () => {
  assert.strictEqual(getHealthStatus(100), 'Peak');
  assert.strictEqual(getHealthStatus(60), 'Peak');
  assert.strictEqual(getHealthStatus(59), 'Losing Snapback');
  assert.strictEqual(getHealthStatus(20), 'Losing Snapback');
  assert.strictEqual(getHealthStatus(19), 'Dead');
  assert.strictEqual(getHealthStatus(0), 'Dead');
});
