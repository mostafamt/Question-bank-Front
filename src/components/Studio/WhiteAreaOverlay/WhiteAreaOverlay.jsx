/**
 * @file WhiteAreaOverlay.jsx
 * @description Renders white background overlays for deleted deep block areas
 *
 * When deep blocks are deleted, this component displays white rectangles at their
 * original coordinates so they appear empty/white in page snapshots. This ensures
 * the snapshot captures the intended visual state without showing the underlying
 * page content in those areas.
 */

import React from 'react';
import PropTypes from 'prop-types';
import CloseIcon from '@mui/icons-material/Close';

/**
 * WhiteAreaOverlay Component
 *
 * Renders white rectangles for deleted deep block areas to obscure the underlying
 * page content during snapshot capture. Manually-drawn white-out rectangles
 * (source: 'manual') additionally get a delete button so they can be undone
 * before submit; deep-block-derived ones (source: 'deep-block') stay
 * non-interactive, matching existing behavior.
 *
 * @param {Array} deletedAreas - Array of deleted deep block / white-out areas
 *   Structure: [{ id, x, y, width, height, unit, source }, ...]
 * @param {boolean} [visible=true] - Whether to show the white overlays
 * @param {number} [opacity=1] - Opacity of white areas (0-1)
 * @param {Function} [onRemove] - Called with an area's id when its delete button is clicked
 *
 * @returns {React.ReactNode} White area overlay elements
 */
const WhiteAreaOverlay = ({ deletedAreas = [], visible = true, opacity = 1, onRemove }) => {
  if (!visible || !Array.isArray(deletedAreas) || deletedAreas.length === 0) {
    return null;
  }

  return deletedAreas.map((area) => {
    if (!area) return null;

    const { id, x, y, width, height, unit = 'percentage', source } = area;

    // Validate coordinates
    if (typeof x !== 'number' || typeof y !== 'number' ||
        typeof width !== 'number' || typeof height !== 'number') {
      console.warn(`Invalid white area coordinates for area ${id}:`, area);
      return null;
    }

    // Build style based on unit (percentage or pixels)
    const isPercentage = unit === 'percentage';
    const positionUnit = isPercentage ? '%' : 'px';
    const isRemovable = source === 'manual' && typeof onRemove === 'function';

    const style = {
      position: 'absolute',
      top: `${y}${positionUnit}`,
      left: `${x}${positionUnit}`,
      width: `${width}${positionUnit}`,
      height: `${height}${positionUnit}`,
      backgroundColor: '#ffffff',
      opacity: opacity,
      border: '1px dashed #e0e0e0',
      pointerEvents: 'none', // Don't interfere with area selection
      zIndex: 100, // High z-index to appear above other elements during snapshot
      boxSizing: 'border-box', // Include border in dimensions
      margin: 0,
      padding: 0,
    };

    return (
      <div
        key={id}
        data-testid={`white-area-${id}`}
        data-area-id={id}
        style={style}
        title={isRemovable ? 'White-out area' : 'Deleted deep block area'}
        className="white-area-overlay"
      >
        {isRemovable && (
          <button
            type="button"
            className="white-area-delete-btn"
            title="Remove white-out area"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              width: 20,
              height: 20,
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              cursor: 'pointer',
              pointerEvents: 'auto', // Overrides parent's 'none' so it's clickable
              zIndex: 101,
            }}
          >
            <CloseIcon style={{ fontSize: 14 }} />
          </button>
        )}
      </div>
    );
  });
};

WhiteAreaOverlay.propTypes = {
  deletedAreas: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
      unit: PropTypes.oneOf(['percentage', 'px']),
      source: PropTypes.oneOf(['deep-block', 'manual']),
    })
  ),
  visible: PropTypes.bool,
  opacity: PropTypes.number,
  onRemove: PropTypes.func,
};

export default React.memo(WhiteAreaOverlay);
