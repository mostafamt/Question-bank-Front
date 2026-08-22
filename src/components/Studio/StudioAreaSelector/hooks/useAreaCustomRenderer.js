import React, { useCallback } from "react";
import styles from "../studioAreaSelector.module.scss";
import {
  getDeepBlockText,
  getDeepBlockImage,
  getDeepBlockAudio,
  getDeepBlockVideo,
  getDeepBlockObject,
} from "../../services/deepHandlers.service";
import DeepBlockContent from "../../DeepBlockContent/DeepBlockContent";
import DeepBlockImage from "../../DeepBlockContent/DeepBlockImage";
import DeepBlockAudio from "../../DeepBlockContent/DeepBlockAudio";
import DeepBlockVideo from "../../DeepBlockContent/DeepBlockVideo";
import DeepBlockObject from "../../DeepBlockContent/DeepBlockObject";

/**
 * @file useAreaCustomRenderer.js
 * @description The AreaSelector-compatible `customAreaRenderer` used by both
 * the interactive edit mode (via the third-party AreaSelector library) and
 * BlockOverlayLayer (readOnly / view-and-play). Paints an area's label plus
 * whichever deep-block content (text/image/audio/video/object) it has.
 * Extracted from StudioAreaSelector, including its onClickExistedArea
 * dependency, which is only ever used here. The one debug console.log inside
 * the original callback was dropped as part of the extraction (see the
 * refactoring plan's dead/debug code list) — no other logic changed.
 */

/**
 * @param {Object} params
 * @param {number} params.activePage
 * @param {string} params.activeRightTabId
 * @param {Object} params.compositeBlocks
 * @param {Object[][]} params.areasProperties
 * @param {Function} params.setAreasProperties
 * @param {boolean} params.readOnly
 * @param {Function} [params.onAreaClick]
 * @param {boolean} params.isReaderMode
 * @param {boolean} params.showBlocksStyling
 * @returns {Function} customRender(areaProps) -> ReactNode
 */
const useAreaCustomRenderer = ({
  activePage,
  activeRightTabId,
  compositeBlocks,
  areasProperties,
  setAreasProperties,
  readOnly,
  onAreaClick,
  isReaderMode,
  showBlocksStyling,
}) => {
  const showBlocksStylingRef = React.useRef(showBlocksStyling);

  React.useEffect(() => {
    showBlocksStylingRef.current = showBlocksStyling;
  }, [showBlocksStyling]);

  const onClickExistedArea = useCallback(
    (areaProps) => {
      setAreasProperties((prevAreasProperties) => {
        const newAreasProperties = [...prevAreasProperties];
        const idx = areaProps.areaNumber - 1;
        newAreasProperties[activePage][idx].open =
          !newAreasProperties[activePage][idx].open;
        return newAreasProperties;
      });
    },
    [activePage, setAreasProperties]
  );

  const customRender = useCallback(
    (areaProps) => {
      if (!areaProps.isChanging) {
        const isCompositeBlocksTab = activeRightTabId === "composite-blocks";
        const areaIndex = areaProps.areaNumber - 1;
        const isInteractiveMode =
          isReaderMode || (!showBlocksStylingRef.current && !readOnly);

        let areaType, areaLabel, deepText, deepImage, deepAudio, deepVideo, deepObjectId;

        if (isCompositeBlocksTab) {
          const area = compositeBlocks.areas?.[areaIndex];
          areaType = area?.type;
          areaLabel = compositeBlocks?.type;
        } else {
          const area = areasProperties[activePage]?.[areaIndex];
          areaType = area?.type;
          areaLabel = area?.label;
          deepText = getDeepBlockText(area);
          deepImage = getDeepBlockImage(area);
          deepAudio = getDeepBlockAudio(area);
          deepVideo = getDeepBlockVideo(area);
          deepObjectId = getDeepBlockObject(area);
        }

        if (areaType) {
          const handleWrapperClick = (e) => {
            // Don't interfere with interactive media controls in view-and-play mode
            if (isInteractiveMode && e.target.closest("video, audio, iframe")) {
              e.stopPropagation();
              return;
            }

            if (readOnly && onAreaClick) {
              onAreaClick(areaProps);
            } else {
              onClickExistedArea(areaProps);
            }
          };

          // Only pass interactive to media components in reader mode
          // In edit mode, don't pass interactive to prevent re-renders when toggling styling
          const mediaInteractive = isReaderMode ? isInteractiveMode : false;

          return (
            <div
              key={areaProps.areaNumber}
              onClick={handleWrapperClick}
              style={{
                cursor: readOnly ? "pointer" : "default",
                pointerEvents: isInteractiveMode ? "auto" : undefined,
              }}
            >
              <div className={styles.type}>
                {areaType} - {areaLabel}
              </div>
              {deepText ? <DeepBlockContent html={deepText} /> : null}
              {deepImage ? <DeepBlockImage src={deepImage} /> : null}
              {deepAudio ? (
                <DeepBlockAudio src={deepAudio} interactive={mediaInteractive} />
              ) : null}
              {deepVideo ? (
                <DeepBlockVideo src={deepVideo} interactive={mediaInteractive} />
              ) : null}
              {deepObjectId ? (
                <DeepBlockObject objectId={deepObjectId} interactive={mediaInteractive} />
              ) : null}
            </div>
          );
        }
      }
    },
    [
      onClickExistedArea,
      activePage,
      activeRightTabId,
      compositeBlocks,
      areasProperties,
      readOnly,
      onAreaClick,
      isReaderMode,
    ]
  );

  return customRender;
};

export default useAreaCustomRenderer;
