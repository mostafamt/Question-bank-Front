import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  IconButton,
  CircularProgress,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Select from "../../Select/Select";
import PageGrid from "./components/PageGrid";
import useImportPages from "./hooks/useImportPages";

const ImportPagesModal = ({ open, handleCloseModal, bookId, chapterId, onPagesImported }) => {
  const {
    books,
    chapters,
    pages,
    isLoadingBooks,
    isLoadingChapters,
    isLoadingPages,
    selectedBook,
    setSelectedBook,
    selectedChapter,
    setSelectedChapter,
    selectedPages,
    isImporting,
    togglePage,
    handleConfirm,
  } = useImportPages({ open, onClose: handleCloseModal, bookId, chapterId, onPagesImported });

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      maxWidth="xl"
      fullWidth
      sx={{ "& .MuiDialog-container": { alignItems: "flex-start" } }}
      PaperProps={{ sx: { mt: 8 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Import Page
        <IconButton onClick={handleCloseModal}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider sx={{ borderColor: "#777" }} />
      <DialogContent>
        <Box sx={{ display: "flex", gap: 2, "& > *": { flex: 1 } }}>
          <Select
            label="Book"
            name="book"
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            loading={isLoadingBooks}
          >
            {books?.map((book) => (
              <option key={book._id} value={book._id}>
                {book.title}
              </option>
            ))}
          </Select>

          <Select
            label="Chapter"
            name="chapter"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            loading={isLoadingChapters}
            disabled={!selectedBook}
          >
            {chapters?.map((chapter) => (
              <option key={chapter._id} value={chapter._id}>
                {chapter.title}
              </option>
            ))}
          </Select>
        </Box>

        {selectedChapter && (
          <PageGrid
            pages={pages}
            isLoading={isLoadingPages}
            selectedPages={selectedPages}
            onToggle={togglePage}
          />
        )}
      </DialogContent>
      <Divider sx={{ borderColor: "#777" }} />
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button variant="outlined" onClick={handleCloseModal}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={selectedPages.length === 0 || isImporting}
          startIcon={
            isImporting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          Select
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportPagesModal;
