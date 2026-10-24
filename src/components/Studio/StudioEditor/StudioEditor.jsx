import React from "react";
import ImageActions from "../../ImageActions/ImageActions";
/** @jsxImportSource @emotion/react */

import styles from "./studioEditor.module.scss";
import StudioAreaSelector from "../StudioAreaSelector/StudioAreaSelector";
import usePinchZoom from "../hooks/usePinchZoom";

const StudioEditor = React.memo(
  React.forwardRef((props, ref) => {
    const {
      areasProperties,
      activePage,
      imageScaleFactor,
      setImageScaleFactor,
      areas,
      setAreas,
      pages,
      onImageLoad,
      showVB,
      onClickToggleVirutalBlocks,
      onClickImage,
      showBlocksStyling,
      chapterId,
      publishLanguage,
      pageContainerRef,
    } = props;

    const studioEditorSelectorRef = React.useRef(null);
    const imageActionsRef = React.useRef(null);
    const editorRef = React.useRef(null);

    usePinchZoom({
      scrollRef: editorRef,
      contentRef: pageContainerRef,
      scale: imageScaleFactor,
      setScale: setImageScaleFactor,
      onZoomed: onImageLoad,
    });

    React.useImperativeHandle(ref, () => {
      return {
        studioEditorSelectorRef: studioEditorSelectorRef,
        imageActionsRef: imageActionsRef,
      };
    });

    return (
      <div className={styles["studio-editor"]} ref={editorRef}>
        <ImageActions
          imageScaleFactor={imageScaleFactor}
          setImageScaleFactor={setImageScaleFactor}
          areas={areas}
          setAreas={setAreas}
          activePage={activePage}
          areasProperties={areasProperties}
          onImageLoad={onImageLoad}
          ref={imageActionsRef}
          pages={pages}
          onClickImage={onClickImage}
          showVB={showVB}
          onClickToggleVirutalBlocks={onClickToggleVirutalBlocks}
          chapterId={chapterId}
          publishLanguage={publishLanguage}
        />
        <StudioAreaSelector
          {...props}
          showVB={showVB}
          showBlocksStyling={showBlocksStyling}
          ref={studioEditorSelectorRef}
        />
      </div>
    );
  })
);

export default StudioEditor;
