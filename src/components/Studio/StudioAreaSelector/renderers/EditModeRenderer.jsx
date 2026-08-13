import React from "react";
import { AreaSelector } from "@bmunozg/react-image-area";
import WhiteAreaOverlay from "../../WhiteAreaOverlay";
import PageImage from "../shared/PageImage";

/**
 * @file EditModeRenderer.jsx
 * @description Interactive drawing/resizing mode backed by the third-party
 * `AreaSelector` library. `renderedAreas`/`wrapperStyle`/`areaPropsConfig` are
 * computed by the orchestrator (simple useMemos, not extracted into a hook).
 * Extracted verbatim from StudioAreaSelector's editing-tab branch.
 */

/**
 * @param {Object} props
 * @param {Object[]} props.renderedAreas
 * @param {Function} props.onChangeHandler
 * @param {Object} props.wrapperStyle
 * @param {Function} props.customRender - customAreaRenderer for the library
 * @param {Object} props.areaPropsConfig
 * @param {Object[][]} props.deletedDeepBlockAreas
 * @param {number} props.activePage
 * @param {Object[]} props.pages
 * @param {number} props.imageScaleFactor
 * @param {Function} [props.onImageLoad]
 * @param {Function} props.getImageSource - () => string
 * @param {boolean} [props.isWhiteOutMode] - When armed, dragging on the page draws a white-out rectangle instead of a real block area
 * @param {Function} [props.onAddWhiteOverlay] - (area) => void, commits a finished white-out drag
 * @param {Function} [props.onRemoveWhiteOverlay] - (id) => void, removes a manual white-out rectangle
 */
const EditModeRenderer = React.forwardRef(
  (
    {
      renderedAreas,
      onChangeHandler,
      wrapperStyle,
      customRender,
      areaPropsConfig,
      deletedDeepBlockAreas,
      activePage,
      pages,
      imageScaleFactor,
      onImageLoad,
      getImageSource,
      isWhiteOutMode,
      onAddWhiteOverlay,
      onRemoveWhiteOverlay,
    },
    ref
  ) => {
    // White-out drawing is handled entirely outside the AreaSelector library:
    // a transparent capture layer (rendered only while armed) tracks its own
    // drag with pointer events and reports the finished rectangle via
    // onAddWhiteOverlay. It never reads from or writes to `renderedAreas` /
    // the library's `areas` prop, so it can't desync the library's internal
    // area list (which previously crashed with "Cannot read properties of
    // undefined (reading 'unit')" when a drawn-then-discarded area shrank
    // the controlled `areas` array out from under the library mid-drag).
    // Pointer events (not mouse events) are required here: the library's own
    // new-area-draw handler is a bubble-phase `onPointerDown` on its wrapper,
    // which this capture layer is nested inside of — mousedown/pointerdown
    // are independent native events for the same click, so only stopping
    // propagation on the matching event type keeps the library's handler
    // from also firing and creating a real block area.
    const dragCatcherRef = React.useRef(null);
    const dragStartRef = React.useRef(null);
    // Mirrors `draftRect` state for synchronous reads in handleDragEnd — kept
    // as a ref (not read back out of the state updater) because commit is a
    // side effect, and React 18 StrictMode double-invokes state updaters in
    // dev to catch impure ones, which would have double-committed here.
    const draftRectValueRef = React.useRef(null);
    const [draftRect, setDraftRect] = React.useState(null);

    const getPercentPoint = React.useCallback((clientX, clientY) => {
      const el = dragCatcherRef.current;
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      const clamp = (value) => Math.min(100, Math.max(0, value));
      return {
        x: clamp(((clientX - rect.left) / rect.width) * 100),
        y: clamp(((clientY - rect.top) / rect.height) * 100),
      };
    }, []);

    const handleDragStart = (e) => {
      // The library starts its own new-area draw from a bubble-phase
      // `onPointerDown` on its wrapper (which our drag-catcher sits inside
      // of, since it's passed in as an AreaSelector child). Native
      // mousedown/pointerdown are independent event types dispatched
      // separately for the same click, so stopping one does NOT stop the
      // other — this must be a pointer event (matching the library's own
      // listener type) and must call stopPropagation for the library's
      // handler further up the tree to never see it.
      e.preventDefault();
      e.stopPropagation();

      const start = getPercentPoint(e.clientX, e.clientY);
      dragStartRef.current = start;
      const initialRect = { x: start.x, y: start.y, width: 0, height: 0 };
      draftRectValueRef.current = initialRect;
      setDraftRect(initialRect);

      const handleDragMove = (moveEvent) => {
        const current = getPercentPoint(moveEvent.clientX, moveEvent.clientY);
        const startPoint = dragStartRef.current;
        const nextRect = {
          x: Math.min(startPoint.x, current.x),
          y: Math.min(startPoint.y, current.y),
          width: Math.abs(current.x - startPoint.x),
          height: Math.abs(current.y - startPoint.y),
        };
        draftRectValueRef.current = nextRect;
        setDraftRect(nextRect);
      };

      const handleDragEnd = () => {
        window.removeEventListener("pointermove", handleDragMove, true);
        window.removeEventListener("pointerup", handleDragEnd, true);
        dragStartRef.current = null;

        const finalRect = draftRectValueRef.current;
        draftRectValueRef.current = null;
        setDraftRect(null);

        // Ignore accidental clicks/near-zero drags.
        if (finalRect && finalRect.width > 0.5 && finalRect.height > 0.5 && onAddWhiteOverlay) {
          onAddWhiteOverlay({
            x: finalRect.x,
            y: finalRect.y,
            width: finalRect.width,
            height: finalRect.height,
            unit: "percentage",
          });
        }
      };

      // Capture phase, not bubble: the library keeps its own always-on
      // document-level pointermove/pointerup listeners (registered with
      // {capture:true}) for its own drag handling, and they call
      // stopPropagation — which silently swallows the event before it can
      // ever bubble back up to a plain (bubble-phase) window listener.
      // Registering here as capture:true runs our handler during the
      // capture pass, before the event reaches document, so it can't be
      // suppressed by anything further down the tree.
      window.addEventListener("pointermove", handleDragMove, true);
      window.addEventListener("pointerup", handleDragEnd, true);
    };

    return (
      <AreaSelector
        areas={renderedAreas}
        onChange={onChangeHandler}
        wrapperStyle={wrapperStyle}
        customAreaRenderer={customRender}
        areaProps={areaPropsConfig}
        unit="percentage"
      >
        <PageImage
          ref={ref}
          src={getImageSource()}
          alt={pages[activePage]?.url || pages[activePage]}
          scaleFactor={imageScaleFactor}
          onLoad={onImageLoad}
        />
        <WhiteAreaOverlay
          deletedAreas={deletedDeepBlockAreas[activePage]}
          visible={true}
          onRemove={onRemoveWhiteOverlay}
        />
        {isWhiteOutMode && (
          <div
            ref={dragCatcherRef}
            onPointerDown={handleDragStart}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 200,
              cursor: "crosshair",
            }}
          >
            {draftRect && (
              <div
                style={{
                  position: "absolute",
                  top: `${draftRect.y}%`,
                  left: `${draftRect.x}%`,
                  width: `${draftRect.width}%`,
                  height: `${draftRect.height}%`,
                  backgroundColor: "#ffffff",
                  border: "1px dashed #999",
                  boxSizing: "border-box",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>
        )}
      </AreaSelector>
    );
  }
);

EditModeRenderer.displayName = "EditModeRenderer";

export default EditModeRenderer;
