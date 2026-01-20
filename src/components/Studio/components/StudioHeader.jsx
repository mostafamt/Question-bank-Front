/**
 * @file StudioHeader.jsx
 * @description Header section of Studio containing sticky toolbar and language switcher
 */

import React from "react";
import StudioStickyToolbar from "../StudioStickyToolbar/StudioStickyToolbar";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

/**
 * Studio Header Component
 * Contains the sticky toolbar and language switcher
 *
 * @param {Object} props - Component props
 * @param {boolean} props.showStickyToolbar - Whether to show sticky toolbar
 * @param {number} props.imageScaleFactor - Current zoom level
 * @param {Function} props.setImageScaleFactor - Zoom level setter
 * @param {Object[][]} props.areas - Areas array
 * @param {Function} props.setAreas - Areas setter
 * @param {number} props.activePageIndex - Active page index
 * @param {Object[][]} props.areasProperties - Areas properties
 * @param {boolean} props.showVB - Show virtual blocks
 * @param {Function} props.onClickToggleVirtualBlocks - Toggle virtual blocks
 * @param {Function} props.onImageLoad - Image load handler
 * @param {Object[]} props.pages - Pages array
 * @param {Function} props.onClickImage - Image click handler
 * @param {string} props.language - Current OCR language
 * @param {Function} props.setLanguage - Language setter
 */
const StudioHeader = ({
  showStickyToolbar,
  imageScaleFactor,
  setImageScaleFactor,
  areas,
  setAreas,
  activePageIndex,
  areasProperties,
  showVB,
  onClickToggleVirtualBlocks,
  onImageLoad,
  pages,
  onClickImage,
  language,
  setLanguage,
}) => {
  return (
    <>
      <StudioStickyToolbar
        show={showStickyToolbar}
        imageScaleFactor={imageScaleFactor}
        setImageScaleFactor={setImageScaleFactor}
        areas={areas}
        setAreas={setAreas}
        activePage={activePageIndex}
        areasProperties={areasProperties}
        showVB={showVB}
        onClickToggleVirutalBlocks={onClickToggleVirtualBlocks}
        onImageLoad={onImageLoad}
        pages={pages}
        onClickImage={onClickImage}
      />
      <LanguageSwitcher language={language} setLanguage={setLanguage} />
    </>
  );
};

export default React.memo(StudioHeader);
