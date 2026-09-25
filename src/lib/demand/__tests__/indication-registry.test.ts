import { describe, it, expect } from 'vitest';
import {
  SOLIDUS_TO_TERRAIN,
  UNMAPPED_SOLIDUS_KEYS,
  MAPPING_COVERAGE,
  resolveIndicationKey,
  getSuggestionsFor,
  getUnmappedRecord,
  listUnmapped,
  listMapped,
  normaliseKey,
  humaniseKey,
  solidusKeyForTerrainName,
} from '@/lib/demand/indication-registry';
import { INDICATION_DATA } from '@/lib/data/indication-map';

describe('demand indication registry', () => {
  describe('table integrity', () => {
    it('every mapped Terrain name exists verbatim in INDICATION_DATA', () => {
      const names = new Set(INDICATION_DATA.map((i) => i.name));
      const missing = SOLIDUS_TO_TERRAIN.filter((m) => !names.has(m.terrainName)).map((m) => m.terrainName);
      expect(missing).toEqual([]);
    });

    it('no Solidus key is both mapped and unmapped, and no key is duplicated', () => {
      const mapped = SOLIDUS_TO_TERRAIN.map((m) => m.solidusKey);
      const unmapped = UNMAPPED_SOLIDUS_KEYS.map((u) => u.solidusKey);
      expect(new Set(mapped).size).toBe(mapped.length);
      expect(new Set(unmapped).size).toBe(unmapped.length);
      expect(mapped.filter((k) => unmapped.includes(k))).toEqual([]);
    });

    it('covers the 271 Solidus epidemiology keys (178 mapped, 93 unmapped)', () => {
      expect(MAPPING_COVERAGE.totalKeys).toBe(271);
      expect(MAPPING_COVERAGE.mappedKeys).toBe(178);
      expect(MAPPING_COVERAGE.unmappedKeys).toBe(93);
      expect(MAPPING_COVERAGE.exactKeys + MAPPING_COVERAGE.proxyKeys).toBe(MAPPING_COVERAGE.mappedKeys);
    });

    it('every proxy mapping carries a note', () => {
      const bare = SOLIDUS_TO_TERRAIN.filter((m) => m.match === 'proxy' && !m.note);
      expect(bare).toEqual([]);
    });
  });

  describe('resolveIndicationKey', () => {
    it("maps alzheimers → Alzheimer's Disease", () => {
      const r = resolveIndicationKey('alzheimers');
      expect(r?.indication.name).toBe("Alzheimer's Disease");
      expect(r?.solidusKey).toBe('alzheimers');
      expect(r?.resolvedBy).toBe('solidus_key');
      expect(r?.match).toBe('exact');
    });

    it('maps lung_nsclc → Non-Small Cell Lung Cancer', () => {
      const r = resolveIndicationKey('lung_nsclc');
      expect(r?.indication.name).toBe('Non-Small Cell Lung Cancer');
      expect(r?.solidusKey).toBe('lung_nsclc');
      expect(r?.indication.therapy_area).toBe('oncology');
    });

    it('maps nashMash → MASH/NASH', () => {
      const r = resolveIndicationKey('nashMash');
      expect(r?.indication.name).toBe('Metabolic Dysfunction-Associated Steatohepatitis');
      expect(r?.indication.synonyms).toContain('NASH');
      expect(r?.solidusKey).toBe('nashMash');
    });

    it("maps parkinsons → Parkinson's Disease", () => {
      expect(resolveIndicationKey('parkinsons')?.indication.name).toBe("Parkinson's Disease");
    });

    it('is case- and punctuation-insensitive on Solidus keys', () => {
      expect(resolveIndicationKey('LUNG_NSCLC')?.solidusKey).toBe('lung_nsclc');
      expect(resolveIndicationKey('lung-nsclc')?.solidusKey).toBe('lung_nsclc');
      expect(resolveIndicationKey('nash mash')?.solidusKey).toBe('nashMash');
    });

    it('resolves registry aliases to the canonical Solidus key', () => {
      const r = resolveIndicationKey('fabryDisease');
      expect(r?.indication.name).toBe('Fabry Disease');
      expect(r?.solidusKey).toBe('fabry');
      expect(r?.resolvedBy).toBe('solidus_alias');
      expect(r?.solidusAliases).toEqual(expect.arrayContaining(['fabry', 'fabryDisease']));
    });

    it('resolves Terrain names and synonyms back to the Solidus key', () => {
      const byName = resolveIndicationKey("Alzheimer's Disease");
      expect(byName?.solidusKey).toBe('alzheimers');
      expect(byName?.resolvedBy).toBe('terrain_name');

      const bySyn = resolveIndicationKey('NSCLC');
      expect(bySyn?.solidusKey).toBe('lung_nsclc');
      expect(bySyn?.resolvedBy).toBe('terrain_synonym');
    });

    it('returns null solidusKey for Terrain indications Solidus does not key', () => {
      const r = resolveIndicationKey('Hyperuricemia');
      expect(r?.indication.name).toBe('Hyperuricemia');
      expect(r?.solidusKey).toBeNull();
      expect(r?.match).toBeNull();
    });

    it('flags proxy mappings with a note', () => {
      const r = resolveIndicationKey('mpn');
      expect(r?.indication.name).toBe('Myelofibrosis');
      expect(r?.match).toBe('proxy');
      expect(r?.note).toMatch(/umbrella/i);
    });

    it('returns undefined for an explicitly unmapped key and for garbage', () => {
      expect(resolveIndicationKey('thymoma')).toBeUndefined();
      expect(resolveIndicationKey('all')).toBeUndefined();
      expect(resolveIndicationKey('')).toBeUndefined();
      expect(resolveIndicationKey('zzzz-not-a-disease-qqq')).toBeUndefined();
    });
  });

  describe('suggestions for unmapped keys', () => {
    it('returns up to 3 nearest Terrain indications for an unmapped Solidus key', () => {
      const s = getSuggestionsFor('thymoma');
      expect(s.length).toBeGreaterThan(0);
      expect(s.length).toBeLessThanOrEqual(3);
      expect(getUnmappedRecord('thymoma')?.reason).toMatch(/Terrain/);
    });

    it('suggests lung cancers for a near-miss slug', () => {
      const s = getSuggestionsFor('lung_nsclcx').map((i) => i.name);
      expect(s[0]).toBe('Non-Small Cell Lung Cancer');
    });

    it('never returns duplicates', () => {
      const s = getSuggestionsFor('breast cancer prevention').map((i) => i.name);
      expect(new Set(s).size).toBe(s.length);
    });
  });

  describe('lists and helpers', () => {
    it('listUnmapped returns the unmapped table', () => {
      expect(listUnmapped().length).toBe(UNMAPPED_SOLIDUS_KEYS.length);
      expect(listUnmapped().some((u) => u.solidusKey === 'all')).toBe(true);
    });

    it('listMapped returns therapy areas from Terrain', () => {
      const m = listMapped().find((x) => x.solidusKey === 'alzheimers');
      expect(m?.therapyArea).toBe('neurology');
      expect(m?.terrainName).toBe("Alzheimer's Disease");
    });

    it('solidusKeyForTerrainName prefers the canonical (non-alias) key', () => {
      expect(solidusKeyForTerrainName('Fabry Disease')).toBe('fabry');
      expect(solidusKeyForTerrainName('Multiple Sclerosis')).toBe('ms');
      expect(solidusKeyForTerrainName('Hyperuricemia')).toBeUndefined();
    });

    it('normaliseKey / humaniseKey', () => {
      expect(normaliseKey('Lung_NSCLC ')).toBe('lungnsclc');
      expect(humaniseKey('nashMash')).toBe('nash mash');
      expect(humaniseKey('lung_nsclc')).toBe('lung nsclc');
    });
  });
});
