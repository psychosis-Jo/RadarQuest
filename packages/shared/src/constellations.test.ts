import { describe, it, expect } from 'vitest';
import {
  ALL_CONSTELLATIONS,
  STUB_CONSTELLATION_IDS,
  ALL_IAU_IDS,
  getConstellationById,
  getConstellationsByTier,
  tierForStarCount,
  pickConstellationForBoss,
  pickConstellationForBossDetailed,
  TIER_RANGES
} from './constellations';

describe('constellations data integrity', () => {
  it('has curated + stub = 88 IAU constellations', () => {
    expect(ALL_CONSTELLATIONS.length + STUB_CONSTELLATION_IDS.length).toBe(88);
  });

  it('all curated constellations have valid star coordinates and lines', () => {
    for (const c of ALL_CONSTELLATIONS) {
      for (const [a, b] of c.lines) {
        expect(a, `line in ${c.id}`).toBeGreaterThanOrEqual(0);
        expect(b, `line in ${c.id}`).toBeGreaterThanOrEqual(0);
        expect(a, `line in ${c.id}`).toBeLessThan(c.stars.length);
        expect(b, `line in ${c.id}`).toBeLessThan(c.stars.length);
      }
      for (const s of c.stars) {
        expect(s.x, `${c.id} star x`).toBeGreaterThanOrEqual(0);
        expect(s.x, `${c.id} star x`).toBeLessThanOrEqual(1);
        expect(s.y, `${c.id} star y`).toBeGreaterThanOrEqual(0);
        expect(s.y, `${c.id} star y`).toBeLessThanOrEqual(1);
      }
    }
  });

  it('tier assignment matches star count', () => {
    for (const c of ALL_CONSTELLATIONS) {
      const n = c.stars.length;
      const range = TIER_RANGES[c.tier];
      expect(
        n >= range.min && n <= range.max,
        `${c.id}: ${n} stars should be in tier ${c.tier} (${range.min}-${range.max})`
      ).toBe(true);
    }
  });

  it('all 88 IDs are unique', () => {
    const ids = new Set(ALL_IAU_IDS);
    expect(ids.size).toBe(88);
  });
});

describe('tierForStarCount', () => {
  it('maps to tier 1 for 1-4 stars', () => {
    expect(tierForStarCount(1)).toBe(1);
    expect(tierForStarCount(2)).toBe(1);
    expect(tierForStarCount(4)).toBe(1);
  });
  it('maps to tier 2 for 5-8 stars', () => {
    expect(tierForStarCount(5)).toBe(2);
    expect(tierForStarCount(7)).toBe(2);
    expect(tierForStarCount(8)).toBe(2);
  });
  it('maps to tier 3 for 9+ stars', () => {
    expect(tierForStarCount(9)).toBe(3);
    expect(tierForStarCount(20)).toBe(3);
  });
});

describe('pickConstellationForBoss', () => {
  it('picks an exact-match constellation when available', () => {
    // 7 stars → medium tier; pick should be tier 2
    const pick = pickConstellationForBoss(7);
    expect(pick).not.toBeNull();
    expect(pick!.tier).toBe(2);
  });

  it('excludes already-used IDs', () => {
    // Use all tier-2 constellations
    const tier2Ids = getConstellationsByTier(2).map(c => c.id);
    const pick = pickConstellationForBoss(7, tier2Ids);
    expect(pick).not.toBeNull();
    // Should fall back to tier 1 or 3
    expect([1, 3]).toContain(pick!.tier);
    expect(tier2Ids).not.toContain(pick!.id);
  });

  it('returns null when all 33 curated are used', () => {
    const allIds = ALL_CONSTELLATIONS.map(c => c.id);
    const pick = pickConstellationForBoss(5, allIds);
    expect(pick).toBeNull();
  });

  it('detailed result includes diff and tier info', () => {
    const result = pickConstellationForBossDetailed(5);
    expect(result).not.toBeNull();
    expect(result!.starDiff).toBeGreaterThanOrEqual(0);
    expect(result!.isPreferredTier).toBe(true);
  });
});

describe('known constellation data', () => {
  it('Orion has 7 main stars', () => {
    const orion = getConstellationById('orion');
    expect(orion).toBeDefined();
    expect(orion!.stars).toHaveLength(7);
    expect(orion!.name_zh).toBe('猎户座');
  });

  it('Ursa Major has Big Dipper pattern (7 stars in bowl + handle)', () => {
    const uma = getConstellationById('ursa_major');
    expect(uma).toBeDefined();
    expect(uma!.stars).toHaveLength(7);
  });

  it('Crux (Southern Cross) is a 4-star small constellation', () => {
    const crux = getConstellationById('crux');
    expect(crux).toBeDefined();
    expect(crux!.tier).toBe(1);
    expect(crux!.stars).toHaveLength(4);
  });
});
