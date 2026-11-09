import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Tooltip,
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
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CheckIcon from "@mui/icons-material/Check";

import styles from "./styles.module.scss";
import { useAppMode } from "../../utils/tabFiltering";
import usePageBookmarks from "../Studio/hooks/usePageBookmarks";
import ReaderAudioControls, {
  ReaderAudioControlsCompact,
} from "../ReaderAudioControls/ReaderAudioControls";
import GoToPagePopover from "./GoToPagePopover";
import { useOcrLanguages } from "../Studio/LanguageSwitcher/LanguageSwitcher";
import useBreakpoint from "../../hooks/useBreakpoint";
import { getLanguages, publishChapter } from "../../services/api";

const DEGREE = 0.1;
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
    // OCR language (author): shown in the phone ⋮ menu, where the Studio's
    // separate OCR language select is hidden
    ocrLanguage,
    setOcrLanguage,
  } = props;

  const [oldAreas, setOldAreas] = React.useState(areas?.[activePage] || []);
  const currentPageAreasCount = areas?.[activePage]?.length;
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [publishMenuAnchor, setPublishMenuAnchor] = React.useState(null);
  const [languages, setLanguages] = React.useState([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = React.useState(false);
  // Below desktop: "Page X of Y" opens a go-to-page box; phone: ⋮ menu
  const [goToPageAnchor, setGoToPageAnchor] = React.useState(null);
  const [overflowAnchor, setOverflowAnchor] = React.useState(null);
  const overflowButtonRef = React.useRef(null);
  const { isPhone, isDesktop } = useBreakpoint();

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
  // large | medium | small — the reader toolbar also holds the bookmark and
  // audio controls in a narrower column, so its icons are one size down.
  // Below desktop the editor column is narrower still.
  const iconFontSize = isPhone
    ? "small"
    : !isDesktop
    ? "medium"
    : isReaderMode
    ? "medium"
    : "large";

  const { isBookmarked, toggleBookmark } = usePageBookmarks();
  const activePageId = pages?.[activePage]?._id;
  const isActivePageBookmarked = isBookmarked(activePageId);
  const showOcrLanguages = isPhone && !isReaderMode && Boolean(setOcrLanguage);
  const ocrLanguages = useOcrLanguages({ enabled: showOcrLanguages });

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

  const openPublishMenu = (anchorEl) => {
    if (isPublishing) return;
    setPublishMenuAnchor(anchorEl);
    setIsLoadingLanguages(true);
    getLanguages()
      .then(setLanguages)
      .finally(() => setIsLoadingLanguages(false));
  };

  const handleOpenPublishMenu = (event) => openPublishMenu(event.currentTarget);

  const handleClosePublishMenu = () => setPublishMenuAnchor(null);

  const handlePublish = async (languageCode) => {
    handleClosePublishMenu();
    if (!chapterId || isPublishing) return;
    setIsPublishing(true);
    await publishChapter(chapterId, [languageCode]);
    setIsPublishing(false);
  };

  const closeOverflow = () => setOverflowAnchor(null);
  // Run a ⋮ menu action after closing the menu
  const fromOverflow = (action) => () => {
    closeOverflow();
    action();
  };

  const pageCount = pages?.length ?? 0;

  const separator = isDesktop ? (
    <div>
      <span>|</span>
    </div>
  ) : (
    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />
  );

  const pageIndicator = isDesktop ? (
    <Typography variant="caption" component="h5" sx={{ color: "#212529" }}>
      Page {activePage + 1} of {pageCount}
    </Typography>
  ) : (
    <Tooltip title="Go to page">
      <Button
        size="small"
        aria-haspopup="dialog"
        onClick={(event) => setGoToPageAnchor(event.currentTarget)}
        sx={{
          minWidth: 0,
          px: 0.5,
          color: "#212529",
          fontSize: "0.75rem",
          textTransform: "none",
          whiteSpace: "nowrap",
        }}
      >
        {isPhone
          ? `${activePage + 1} / ${pageCount}`
          : `Page ${activePage + 1} of ${pageCount}`}
      </Button>
    </Tooltip>
  );

  const goToPagePopover = (
    <GoToPagePopover
      anchorEl={goToPageAnchor}
      onClose={() => setGoToPageAnchor(null)}
      currentPage={activePage + 1}
      pageCount={pageCount}
      onGoToPage={onClickImage}
    />
  );

  const publishMenu = (
    <Menu
      id="publish-language-menu"
      anchorEl={publishMenuAnchor}
      open={Boolean(publishMenuAnchor)}
      onClose={handleClosePublishMenu}
    >
      {isLoadingLanguages ? (
        <MenuItem disabled sx={{ justifyContent: "center" }}>
          <CircularProgress size={20} />
        </MenuItem>
      ) : (
        languages.map((language) => (
          <MenuItem
            key={language.code}
            selected={publishLanguage === language.code}
            onClick={() => handlePublish(language.code)}
          >
            {language.label}
          </MenuItem>
        ))
      )}
    </Menu>
  );

  const toolButton = (label, Icon, onClick) => (
    <Tooltip title={label}>
      <IconButton aria-label={label} onClick={onClick} size="small">
        <Icon fontSize={iconFontSize} />
      </IconButton>
    </Tooltip>
  );

  // Phone: one row with the frequent actions; the rest go in the ⋮ menu
  if (isPhone) {
    return (
      <div
        className={`${styles["image-actions"]} ${styles.compact}`}
        ref={ref}
      >
        {toolButton("Previous page", KeyboardArrowLeftIcon, onClickPreviousPage)}
        {pageIndicator}
        {toolButton("Next page", KeyboardArrowRightIcon, onClickNextPage)}
        {separator}
        {toolButton("Zoom in", ZoomInIcon, onClickZoomIn)}
        {toolButton("Zoom out", ZoomOutIcon, onClickZoomOut)}
        {isReaderMode && <ReaderAudioControlsCompact />}
        <Box sx={{ flex: 1 }} />
        <Tooltip title="More actions">
          <IconButton
            ref={overflowButtonRef}
            size="small"
            aria-label="More actions"
            aria-haspopup="true"
            aria-controls={overflowAnchor ? "toolbar-overflow-menu" : undefined}
            onClick={(event) => setOverflowAnchor(event.currentTarget)}
          >
            {isPublishing ? (
              <CircularProgress size={18} />
            ) : (
              <MoreVertIcon fontSize={iconFontSize} />
            )}
          </IconButton>
        </Tooltip>
        <Menu
          id="toolbar-overflow-menu"
          anchorEl={overflowAnchor}
          open={Boolean(overflowAnchor)}
          onClose={closeOverflow}
        >
          <MenuItem onClick={fromOverflow(onClickFirstPage)}>
            <ListItemIcon>
              <FirstPageIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>First page</ListItemText>
          </MenuItem>
          <MenuItem onClick={fromOverflow(onClickLastPage)}>
            <ListItemIcon>
              <LastPageIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Last page</ListItemText>
          </MenuItem>
          <MenuItem onClick={fromOverflow(onClickZoomOff)}>
            <ListItemIcon>
              <SearchOffIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Reset zoom</ListItemText>
          </MenuItem>
          {isReaderMode && (
            <MenuItem onClick={fromOverflow(onClickToggleVirutalBlocks)}>
              <ListItemIcon>
                {showVB ? (
                  <VisibilityOffIcon fontSize="small" />
                ) : (
                  <VisibilityIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText>
                {showVB ? "Hide virtual blocks" : "Show virtual blocks"}
              </ListItemText>
            </MenuItem>
          )}
          {isReaderMode && (
            <MenuItem
              disabled={!activePageId}
              onClick={fromOverflow(() => toggleBookmark(activePageId))}
            >
              <ListItemIcon>
                {isActivePageBookmarked ? (
                  <BookmarkIcon fontSize="small" />
                ) : (
                  <BookmarkBorderIcon fontSize="small" />
                )}
              </ListItemIcon>
              <ListItemText>
                {isActivePageBookmarked ? "Remove bookmark" : "Bookmark this page"}
              </ListItemText>
            </MenuItem>
          )}
          {!isReaderMode && (
            <MenuItem
              disabled={isPublishing}
              onClick={fromOverflow(() =>
                openPublishMenu(overflowButtonRef.current)
              )}
            >
              <ListItemIcon>
                <PublishIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                {isPublishing ? "Publishing…" : "Publish chapter"}
              </ListItemText>
            </MenuItem>
          )}
          {showOcrLanguages && <Divider />}
          {showOcrLanguages && (
            <ListSubheader sx={{ lineHeight: "2rem" }}>OCR language</ListSubheader>
          )}
          {showOcrLanguages &&
            ocrLanguages.map((language) => (
              <MenuItem
                key={language.code}
                selected={ocrLanguage === language.value}
                onClick={fromOverflow(() => setOcrLanguage(language.value))}
              >
                <ListItemText inset>{language.label}</ListItemText>
                {ocrLanguage === language.value && (
                  <CheckIcon fontSize="small" sx={{ ml: 2 }} />
                )}
              </MenuItem>
            ))}
        </Menu>
        {publishMenu}
        {goToPagePopover}
      </div>
    );
  }

  return (
    <div className={styles["image-actions"]} ref={ref}>
      <div>
        {pageIndicator}
        <Tooltip title="First page">
          <IconButton aria-label="First page" onClick={onClickFirstPage}>
            <FirstPageIcon fontSize={iconFontSize} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Previous page">
          <IconButton aria-label="Previous page" onClick={onClickPreviousPage}>
            <KeyboardArrowLeftIcon fontSize={iconFontSize} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Next page">
          <IconButton aria-label="Next page" onClick={onClickNextPage}>
            <KeyboardArrowRightIcon fontSize={iconFontSize} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Last page">
          <IconButton aria-label="Last page" onClick={onClickLastPage}>
            <LastPageIcon fontSize={iconFontSize} />
          </IconButton>
        </Tooltip>
      </div>
      {separator}

      <div>
        <Tooltip title="Zoom in">
          <IconButton aria-label="Zoom in" onClick={onClickZoomIn}>
            <ZoomInIcon fontSize={iconFontSize} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Reset zoom">
          <IconButton aria-label="Reset zoom" onClick={onClickZoomOff}>
            <SearchOffIcon fontSize={iconFontSize} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Zoom out">
          <IconButton aria-label="Zoom out" onClick={onClickZoomOut}>
            <ZoomOutIcon fontSize={iconFontSize} />
          </IconButton>
        </Tooltip>
      </div>

      {!isReaderMode && (
        <>
          {separator}

          <div>
            <Tooltip title={isPublishing ? "Publishing…" : "Publish chapter"}>
              <span>
                <IconButton
                  aria-label={isPublishing ? "Publishing…" : "Publish chapter"}
                  aria-haspopup="true"
                  aria-controls={
                    publishMenuAnchor ? "publish-language-menu" : undefined
                  }
                  onClick={handleOpenPublishMenu}
                  disabled={isPublishing}
                >
                  {isPublishing ? (
                    <CircularProgress size={24} />
                  ) : (
                    <PublishIcon fontSize={iconFontSize} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
            {publishMenu}
          </div>
        </>
      )}

      {isReaderMode && (
        <>
          {separator}

          <div>
            <Tooltip
              title={showVB ? "Hide virtual blocks" : "Show virtual blocks"}
            >
              <IconButton
                aria-label={showVB ? "Hide virtual blocks" : "Show virtual blocks"}
                onClick={onClickToggleVirutalBlocks}
              >
                {showVB ? (
                  <VisibilityOffIcon fontSize={iconFontSize} />
                ) : (
                  <VisibilityIcon fontSize={iconFontSize} />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip
              title={
                isActivePageBookmarked ? "Remove bookmark" : "Bookmark this page"
              }
            >
              <span>
                <IconButton
                  aria-label="toggle-bookmark"
                  aria-pressed={isActivePageBookmarked}
                  onClick={() => toggleBookmark(activePageId)}
                  disabled={!activePageId}
                >
                  {isActivePageBookmarked ? (
                    <BookmarkIcon fontSize={iconFontSize} />
                  ) : (
                    <BookmarkBorderIcon fontSize={iconFontSize} />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </div>

          {separator}

          <div>
            {/* Below desktop the full pill would wrap the toolbar */}
            {isDesktop ? <ReaderAudioControls /> : <ReaderAudioControlsCompact />}
          </div>
        </>
      )}
      {!isDesktop && goToPagePopover}
    </div>
  );
});

export default ImageActions;
