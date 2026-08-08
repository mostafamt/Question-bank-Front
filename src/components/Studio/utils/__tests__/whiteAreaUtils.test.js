/**
 * @file whiteAreaUtils.test.js
 * @description Tests for white area utility functions
 */

import {
  hasDeletedDeepBlocks,
  getWhiteAreaElements,
  countDeletedDeepBlocks,
  getDeletedBlocksForPage,
  calculateDeletedAreaCoverage,
  findDeletedAreaAtPoint,
} from '../whiteAreaUtils';

describe('whiteAreaUtils', () => {
  describe('hasDeletedDeepBlocks', () => {
    it('returns false when deletedDeepBlockAreas is empty', () => {
      const deletedAreas = [[], []];
      expect(hasDeletedDeepBlocks(deletedAreas, 0)).toBe(false);
    });

    it('returns true when page has deleted blocks', () => {
      const deletedAreas = [
        [{ id: 'area-1', x: 10, y: 20, width: 100, height: 150, unit: 'percentage' }],
        [],
      ];
      expect(hasDeletedDeepBlocks(deletedAreas, 0)).toBe(true);
      expect(hasDeletedDeepBlocks(deletedAreas, 1)).toBe(false);
    });

    it('returns false for invalid inputs', () => {
      expect(hasDeletedDeepBlocks(null, 0)).toBe(false);
      expect(hasDeletedDeepBlocks(undefined, 0)).toBe(false);
      expect(hasDeletedDeepBlocks([], 0)).toBe(false);
    });
  });

  describe('countDeletedDeepBlocks', () => {
    it('counts deleted blocks correctly', () => {
      const deletedAreas = [
        [
          { id: 'area-1', x: 10, y: 20, width: 100, height: 150, unit: 'percentage' },
          { id: 'area-2', x: 30, y: 40, width: 80, height: 120, unit: 'percentage' },
        ],
        [{ id: 'area-3', x: 50, y: 60, width: 100, height: 100, unit: 'percentage' }],
      ];

      expect(countDeletedDeepBlocks(deletedAreas, 0)).toBe(2);
      expect(countDeletedDeepBlocks(deletedAreas, 1)).toBe(1);
    });

    it('returns 0 for pages without deleted blocks', () => {
      const deletedAreas = [[], []];
      expect(countDeletedDeepBlocks(deletedAreas, 0)).toBe(0);
    });
  });

  describe('getDeletedBlocksForPage', () => {
    it('returns deleted blocks for a page', () => {
      const area1 = { id: 'area-1', x: 10, y: 20, width: 100, height: 150, unit: 'percentage' };
      const area2 = { id: 'area-2', x: 30, y: 40, width: 80, height: 120, unit: 'percentage' };
      const deletedAreas = [[area1, area2], []];

      const blocks = getDeletedBlocksForPage(deletedAreas, 0);
      expect(blocks).toEqual([area1, area2]);
    });

    it('returns empty array for pages without blocks', () => {
      const deletedAreas = [[], []];
      expect(getDeletedBlocksForPage(deletedAreas, 0)).toEqual([]);
    });
  });

  describe('calculateDeletedAreaCoverage', () => {
    it('calculates coverage for single area', () => {
      const deletedAreas = [
        [{ id: 'area-1', x: 0, y: 0, width: 50, height: 50, unit: 'percentage' }],
        [],
      ];

      // Coverage = (50 * 50) / (100 * 100) * 100 = 25%
      const coverage = calculateDeletedAreaCoverage(deletedAreas, 0);
      expect(coverage).toBe(25);
    });

    it('calculates coverage for multiple areas', () => {
      const deletedAreas = [
        [
          { id: 'area-1', x: 0, y: 0, width: 50, height: 50, unit: 'percentage' },
          { id: 'area-2', x: 50, y: 0, width: 50, height: 50, unit: 'percentage' },
        ],
        [],
      ];

      // Coverage = (50*50 + 50*50) / 10000 * 100 = 50%
      const coverage = calculateDeletedAreaCoverage(deletedAreas, 0);
      expect(coverage).toBe(50);
    });

    it('caps coverage at 100%', () => {
      const deletedAreas = [
        [
          { id: 'area-1', x: 0, y: 0, width: 150, height: 150, unit: 'percentage' },
        ],
        [],
      ];

      const coverage = calculateDeletedAreaCoverage(deletedAreas, 0);
      expect(coverage).toBe(100);
    });

    it('returns 0 for pages without deleted blocks', () => {
      const deletedAreas = [[], []];
      expect(calculateDeletedAreaCoverage(deletedAreas, 0)).toBe(0);
    });
  });

  describe('findDeletedAreaAtPoint', () => {
    it('finds area containing point', () => {
      const area = { id: 'area-1', x: 10, y: 20, width: 50, height: 60, unit: 'percentage' };
      const deletedAreas = [[area], []];

      const found = findDeletedAreaAtPoint(deletedAreas, 0, 30, 40);
      expect(found).toEqual(area);
    });

    it('returns null when point not in any area', () => {
      const area = { id: 'area-1', x: 10, y: 20, width: 50, height: 60, unit: 'percentage' };
      const deletedAreas = [[area], []];

      const found = findDeletedAreaAtPoint(deletedAreas, 0, 5, 5);
      expect(found).toBeNull();
    });

    it('finds area at boundaries', () => {
      const area = { id: 'area-1', x: 10, y: 20, width: 50, height: 60, unit: 'percentage' };
      const deletedAreas = [[area], []];

      // Check corners and edges
      expect(findDeletedAreaAtPoint(deletedAreas, 0, 10, 20)).toEqual(area); // Top-left
      expect(findDeletedAreaAtPoint(deletedAreas, 0, 60, 80)).toEqual(area); // Bottom-right
      expect(findDeletedAreaAtPoint(deletedAreas, 0, 10, 50)).toEqual(area); // Left edge
      expect(findDeletedAreaAtPoint(deletedAreas, 0, 35, 20)).toEqual(area); // Top edge
    });

    it('returns first area when multiple overlap at point', () => {
      const area1 = { id: 'area-1', x: 10, y: 20, width: 50, height: 60, unit: 'percentage' };
      const area2 = { id: 'area-2', x: 30, y: 40, width: 50, height: 60, unit: 'percentage' };
      const deletedAreas = [[area1, area2], []];

      const found = findDeletedAreaAtPoint(deletedAreas, 0, 40, 50);
      expect(found).toEqual(area1); // First match
    });

    it('returns null for empty page', () => {
      const deletedAreas = [[], []];
      const found = findDeletedAreaAtPoint(deletedAreas, 0, 30, 40);
      expect(found).toBeNull();
    });
  });

  describe('getWhiteAreaElements', () => {
    it('returns empty array when container is null', () => {
      const elements = getWhiteAreaElements(null);
      expect(elements).toEqual([]);
    });

    it('returns white area elements from container', () => {
      // Create a mock DOM structure
      const container = document.createElement('div');
      const whiteArea1 = document.createElement('div');
      whiteArea1.className = 'white-area-overlay';
      whiteArea1.setAttribute('data-area-id', 'area-1');

      const whiteArea2 = document.createElement('div');
      whiteArea2.className = 'white-area-overlay';
      whiteArea2.setAttribute('data-area-id', 'area-2');

      const otherElement = document.createElement('div');

      container.appendChild(whiteArea1);
      container.appendChild(whiteArea2);
      container.appendChild(otherElement);

      const elements = getWhiteAreaElements(container);
      expect(elements).toHaveLength(2);
      expect(elements[0]).toBe(whiteArea1);
      expect(elements[1]).toBe(whiteArea2);
    });

    it('finds white areas nested in container', () => {
      const container = document.createElement('div');
      const nested = document.createElement('div');
      const whiteArea = document.createElement('div');
      whiteArea.className = 'white-area-overlay';

      nested.appendChild(whiteArea);
      container.appendChild(nested);

      const elements = getWhiteAreaElements(container);
      expect(elements).toHaveLength(1);
      expect(elements[0]).toBe(whiteArea);
    });
  });
});
