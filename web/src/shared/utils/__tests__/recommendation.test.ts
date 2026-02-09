import { describe, it, expect } from 'vitest';
import { getRecommendation } from '../analysis';

describe('getRecommendation', () => {
  describe('APPLY threshold (>= 70%)', () => {
    it('should recommend APPLY for 70% score', () => {
      const result = getRecommendation(70, 0, 5);
      expect(result).toBe('apply');
    });

    it('should recommend APPLY for 78% score', () => {
      const result = getRecommendation(78, 1, 3);
      expect(result).toBe('apply');
    });

    it('should recommend APPLY for 90% score', () => {
      const result = getRecommendation(90, 0, 6);
      expect(result).toBe('apply');
    });

    it('should recommend APPLY for 100% score (perfect match)', () => {
      const result = getRecommendation(100, 0, 4);
      expect(result).toBe('apply');
    });

    it('should recommend APPLY even with few matched skills if score is high', () => {
      // Bug fix: Previously required 5+ matched skills
      // Now purely score-based
      const result = getRecommendation(75, 0, 2);
      expect(result).toBe('apply');
    });
  });

  describe('MAYBE threshold (50-69%)', () => {
    it('should recommend MAYBE for 50% score', () => {
      const result = getRecommendation(50, 2, 3);
      expect(result).toBe('maybe');
    });

    it('should recommend MAYBE for 60% score', () => {
      const result = getRecommendation(60, 1, 4);
      expect(result).toBe('maybe');
    });

    it('should recommend MAYBE for 69% score', () => {
      const result = getRecommendation(69, 2, 5);
      expect(result).toBe('maybe');
    });
  });

  describe('PASS threshold (< 50%)', () => {
    it('should recommend PASS for 17% score', () => {
      const result = getRecommendation(17, 3, 2);
      expect(result).toBe('pass');
    });

    it('should recommend PASS for 49% score', () => {
      const result = getRecommendation(49, 4, 3);
      expect(result).toBe('pass');
    });

    it('should recommend PASS for 0% score', () => {
      const result = getRecommendation(0, 5, 0);
      expect(result).toBe('pass');
    });
  });

  describe('Edge cases', () => {
    it('should handle score exactly at 70% boundary', () => {
      expect(getRecommendation(70, 0, 5)).toBe('apply');
      expect(getRecommendation(69.9, 0, 5)).toBe('maybe');
    });

    it('should handle score exactly at 50% boundary', () => {
      expect(getRecommendation(50, 2, 3)).toBe('maybe');
      expect(getRecommendation(49.9, 2, 3)).toBe('pass');
    });

    it('should work regardless of missing required count', () => {
      // Score is the primary indicator now
      expect(getRecommendation(80, 0, 5)).toBe('apply');
      expect(getRecommendation(80, 1, 5)).toBe('apply');
      expect(getRecommendation(80, 2, 5)).toBe('apply');
    });

    it('should work regardless of matched skills count', () => {
      // Bug that was found: 100% with 4 skills said "maybe"
      expect(getRecommendation(100, 0, 1)).toBe('apply');
      expect(getRecommendation(100, 0, 4)).toBe('apply');
      expect(getRecommendation(100, 0, 10)).toBe('apply');
    });
  });

  describe('Real-world test cases', () => {
    it('Job 1: Help Desk Support (17% score) should be PASS', () => {
      const result = getRecommendation(17, 3, 2);
      expect(result).toBe('pass');
    });

    it('Job 2: IT Project Assistant (78% score) should be APPLY', () => {
      const result = getRecommendation(78, 1, 3);
      expect(result).toBe('apply');
    });

    it('Job 3: Support Analyst (100% score) should be APPLY', () => {
      const result = getRecommendation(100, 0, 4);
      expect(result).toBe('apply');
    });

    it('Job 4: Service Desk Support (90% score) should be APPLY', () => {
      const result = getRecommendation(90, 0, 6);
      expect(result).toBe('apply');
    });
  });
});
