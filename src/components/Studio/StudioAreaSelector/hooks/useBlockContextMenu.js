import { useCallback, useEffect, useState } from "react";
import { useStore } from "../../../../store/store";
import { DELETED } from "../../../../utils/ocr";
import { determineModalForArea } from "../../services/modal.service";
import { findAreaIndexAtPoint } from "../utils/hitTest";
import {
  BLOCK_ACTIONS,
  SIMPLE_ITEM,
  getBlockActions,
} from "../utils/blockActions";

/**
 * @file useBlockContextMenu.js
 * @description State and handlers for the right-click menu on page blocks.
 * One `onContextMenu` on the page container finds the block under the cursor
 * (see utils/hitTest.js), so every render mode works the same way.
 * Plan: docs/2026-10-17/BLOCK_CONTEXT_MENU_PLAN.md
 */

/**
 * @param {Object} params
 * @param {boolean} params.enabled - Menu allowed in the current render mode
 * @param {boolean} params.isReaderMode
 * @param {boolean} params.canShowInList - The block list is on screen
 * @param {Object[][]} params.areas
 * @param {Object[][]} params.areasProperties
 * @param {number} params.activePage
 * @param {React.RefObject<HTMLImageElement>} params.imageRef - The page image
 * @param {Function} [params.onPlayBlock] - Reader: (area, areaProps) => void
 * @param {Function} [params.onClickDeleteArea] - Studio: (id) => void
 * @param {Function} [params.updateAreaPropertyById] - Studio: (id, patch) => void
 */
const useBlockContextMenu = ({
  enabled,
  isReaderMode,
  canShowInList,
  areas,
  areasProperties,
  activePage,
  imageRef,
  onPlayBlock,
  onClickDeleteArea,
  updateAreaPropertyById,
}) => {
  const openModal = useStore((s) => s.openModal);
  // { anchorPosition, area, areaProps, actions }
  const [menu, setMenu] = useState(null);

  const closeMenu = useCallback(() => setMenu(null), []);

  // The menu belongs to a block on this page.
  useEffect(() => {
    setMenu(null);
  }, [activePage]);

  const onContextMenu = useCallback(
    (event) => {
      if (!enabled) return;
      const image = imageRef?.current;
      if (!image) return;

      // Keyboard (Menu key / Shift+F10) reports 0,0 — use the focused element instead.
      let { clientX, clientY } = event;
      if (clientX === 0 && clientY === 0 && event.target !== event.currentTarget) {
        const rect = event.target.getBoundingClientRect();
        clientX = rect.left + rect.width / 2;
        clientY = rect.top + rect.height / 2;
      }

      const imageRect = image.getBoundingClientRect();
      const pageAreas = areas[activePage] || [];
      const pageProps = areasProperties[activePage] || [];

      const idx = findAreaIndexAtPoint(
        pageAreas,
        { x: clientX - imageRect.left, y: clientY - imageRect.top },
        { width: imageRect.width, height: imageRect.height },
        (i) =>
          pageProps[i]?.status !== DELETED &&
          (!isReaderMode || Boolean(pageProps[i]?.blockId))
      );
      if (idx === -1) return; // empty page: keep the browser's menu

      const areaProps = pageProps[idx];
      const actions = getBlockActions(areaProps, { isReaderMode, canShowInList });
      if (!actions.length) return;

      event.preventDefault();
      setMenu({
        anchorPosition: { top: clientY, left: clientX },
        area: pageAreas[idx],
        areaProps,
        actions,
      });
    },
    [enabled, imageRef, areas, areasProperties, activePage, isReaderMode, canShowInList]
  );

  // The area-drawing library starts a draw/move on any pointerdown and never
  // checks the button, so right-clicks must not reach it.
  const onPointerDownCapture = useCallback((event) => {
    if (event.button === 2) event.stopPropagation();
  }, []);

  const onSelectAction = useCallback(
    (action) => {
      if (!menu) return;
      const { area, areaProps } = menu;
      setMenu(null);

      if (isReaderMode) {
        if (action === BLOCK_ACTIONS.PLAY) onPlayBlock?.(area, areaProps);
        return;
      }

      switch (action) {
        case BLOCK_ACTIONS.PLAY:
          openModal("play-object", { workingArea: areaProps });
          break;
        case BLOCK_ACTIONS.EDIT:
          openModal(areaProps.type !== SIMPLE_ITEM ? "auto-ui" : "quill", {
            workingArea: areaProps,
            updateAreaPropertyById,
          });
          break;
        case BLOCK_ACTIONS.SHOW_IN_LIST:
          updateAreaPropertyById?.(areaProps.id, { open: true });
          // Wait for the row to expand before scrolling to it.
          requestAnimationFrame(() => {
            document
              .querySelector(`[data-area-id="${CSS.escape(String(areaProps.id))}"]`)
              ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
          });
          break;
        case BLOCK_ACTIONS.DELETE:
          onClickDeleteArea?.(areaProps.id);
          break;
        default:
          break;
      }
    },
    [menu, isReaderMode, onPlayBlock, openModal, updateAreaPropertyById, onClickDeleteArea]
  );

  const areaProps = menu?.areaProps;
  const title = areaProps
    ? [areaProps.label, areaProps.type].filter(Boolean).join(" — ") ||
      "New block"
    : "";
  const labels =
    isReaderMode && areaProps && !determineModalForArea(areaProps).isComplex
      ? { [BLOCK_ACTIONS.PLAY]: "View" }
      : undefined;

  return {
    menuProps: {
      anchorPosition: menu?.anchorPosition || null,
      title,
      actions: menu?.actions || [],
      labels,
      onSelect: onSelectAction,
      onClose: closeMenu,
    },
    onContextMenu,
    onPointerDownCapture,
  };
};

export default useBlockContextMenu;
