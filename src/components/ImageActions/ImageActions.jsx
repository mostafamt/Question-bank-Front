import React from "react";
import {
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import PublishIcon from "@mui/icons-material/Publish";

import styles from "./styles.module.scss";
import { useAppMode } from "../../utils/tabFiltering";
import { publishChapter } from "../../services/api";
import { LANGUAGE_CODES } from "../Studio/constants";

const DEGREE = 0.1;
// large | medium | small
const iconFontSize = "large";
// const text

const ImageActions = React.forwardRef((props, ref) => {
  const {
    imageScaleFactor,
    setImageScaleFactor,
    areas,
    setAreas,
    activePage,
    areasProperties,
    showVB,
    onClickToggleVirutalBlocks,
    onImageLoad,
    pages,
    onClickImage,
    chapterId,
    publishLanguage,
  } = props;

  const [oldAreas, setOldAreas] = React.useState(areas?.[activePage] || []);
  const currentPageAreasCount = areas?.[activePage]?.length;
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [publishMenuAnchor, setPublishMenuAnchor] = React.useState(null);

  // Re-baseline the zoom reference points whenever the active page changes,
  // or that page's areas array size changes — areas[activePage] starts empty
  // and is populated asynchronously after the page image loads (independent
  // of any activePage change), so relying on activePage alone still leaves a
  // window where oldAreas is stale/empty and indexing into it throws.
  React.useEffect(() => {
    setOldAreas(areas?.[activePage] || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePage, currentPageAreasCount]);

  const mode = useAppMode();
  const isReaderMode = mode === "reader";

  const onClickZoomIn = () => {
    setImageScaleFactor(imageScaleFactor + DEGREE);
    const newAreas = [...areas];
    newAreas[activePage] = areas[activePage].map((area, idx) => {
      const baseline = oldAreas[idx] || area;
      area.x = area.x + baseline.x * DEGREE;
      area.y = area.y + baseline.y * DEGREE;
      area.height = area.height + baseline.height * DEGREE;
      area.width = area.width + baseline.width * DEGREE;
      return area;
    });
    setAreas(newAreas);
    setTimeout(() => {
      onImageLoad();
    }, 1);
  };

  const onClickZoomOff = () => {
    // setImageScaleFactor(imageScaleFactor + DEGREE);
    // const newAreas = [...areas];
    // newAreas[activePage] = areas[activePage].map((area, idx) => {
    //   const { x, y, width, height } = areasProperties[activePage][idx];
    //   area.x = area.x + oldAreas[idx].x * DEGREE;
    //   area.y = area.y + oldAreas[idx].y * DEGREE;
    //   area.height = area.height + oldAreas[idx].height * DEGREE;
    //   area.width = area.width + oldAreas[idx].width * DEGREE;
    //   return area;
    // });
    // setAreas(newAreas);
    // setTimeout(() => {
    //   onImageLoad();
    // }, 1);
  };

  const onClickZoomOut = () => {
    setImageScaleFactor(imageScaleFactor - DEGREE);
    const newAreas = [...areas];
    newAreas[activePage] = areas[activePage].map((area, idx) => {
      const baseline = oldAreas[idx] || area;
      area.x = area.x - baseline.x * DEGREE;
      area.y = area.y - baseline.y * DEGREE;
      area.height = area.height - baseline.height * DEGREE;
      area.width = area.width - baseline.width * DEGREE;
      return area;
    });
    setAreas(newAreas);
    setTimeout(() => {
      onImageLoad();
    }, 1);
  };

  const onClickFirstPage = () => {
    onClickImage(0);
  };

  const onClickPreviousPage = () => {
    if (activePage - 1 >= 0) {
      onClickImage(activePage - 1);
    }
  };

  const onClickNextPage = () => {
    if (activePage + 1 < pages.length) {
      onClickImage(activePage + 1);
    }
  };

  const onClickLastPage = () => {
    onClickImage(pages.length - 1);
  };

  const handleOpenPublishMenu = (event) => {
    if (isPublishing) return;
    setPublishMenuAnchor(event.currentTarget);
  };

  const handleClosePublishMenu = () => setPublishMenuAnchor(null);

  const handlePublish = async (languageCode) => {
    handleClosePublishMenu();
    if (!chapterId || isPublishing) return;
    setIsPublishing(true);
    await publishChapter(chapterId, [languageCode]);
    setIsPublishing(false);
  };

  return (
    <div className={styles["image-actions"]} ref={ref}>
      <div>
        <Typography variant="caption" component="h5" sx={{ color: "#212529" }}>
          Page {activePage + 1} of {pages?.length}
        </Typography>
        <IconButton aria-label="first" onClick={onClickFirstPage}>
          <FirstPageIcon fontSize={iconFontSize} />
        </IconButton>
        <IconButton aria-label="previous" onClick={onClickPreviousPage}>
          <KeyboardArrowLeftIcon fontSize={iconFontSize} />
        </IconButton>
        <IconButton aria-label="next" onClick={onClickNextPage}>
          <KeyboardArrowRightIcon fontSize={iconFontSize} />
        </IconButton>
        <IconButton aria-label="last" onClick={onClickLastPage}>
          <LastPageIcon fontSize={iconFontSize} />
        </IconButton>
      </div>
      <div>
        <span>|</span>
      </div>

      <div>
        <IconButton aria-label="zoom-in" onClick={onClickZoomIn}>
          <ZoomInIcon fontSize={iconFontSize} />
        </IconButton>

        <IconButton aria-label="zoom-off" onClick={onClickZoomOff}>
          <SearchOffIcon fontSize={iconFontSize} />
        </IconButton>

        <IconButton aria-label="zoom-out" onClick={onClickZoomOut}>
          <ZoomOutIcon fontSize={iconFontSize} />
        </IconButton>
      </div>

      {!isReaderMode && (
        <>
          <div>
            <span>|</span>
          </div>

          <div>
            <IconButton
              aria-label="publish-chapter"
              aria-haspopup="true"
              aria-controls={publishMenuAnchor ? "publish-language-menu" : undefined}
              onClick={handleOpenPublishMenu}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <CircularProgress size={24} />
              ) : (
                <PublishIcon fontSize={iconFontSize} />
              )}
            </IconButton>
            <Menu
              id="publish-language-menu"
              anchorEl={publishMenuAnchor}
              open={Boolean(publishMenuAnchor)}
              onClose={handleClosePublishMenu}
            >
              <MenuItem
                selected={publishLanguage === LANGUAGE_CODES.ARABIC}
                onClick={() => handlePublish(LANGUAGE_CODES.ARABIC)}
              >
                Arabic
              </MenuItem>
              <MenuItem
                selected={publishLanguage === LANGUAGE_CODES.ENGLISH}
                onClick={() => handlePublish(LANGUAGE_CODES.ENGLISH)}
              >
                English
              </MenuItem>
            </Menu>
          </div>
        </>
      )}

      {isReaderMode && (
        <>
          <div>
            <span>|</span>
          </div>

          <div>
            <IconButton
              aria-label="visibility-icon"
              onClick={onClickToggleVirutalBlocks}
            >
              {showVB ? (
                <VisibilityOffIcon fontSize={iconFontSize} />
              ) : (
                <VisibilityIcon fontSize={iconFontSize} />
              )}
            </IconButton>
          </div>
        </>
      )}
    </div>
  );
});

export default ImageActions;
