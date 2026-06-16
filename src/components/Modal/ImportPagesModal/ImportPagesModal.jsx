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
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBooks, getChapters, getChapterPages, importPages } from "../../../api/bookapi";
import Select from "../../Select/Select";
import { toast } from "react-toastify";

const ImportPagesModal = ({ open, handleCloseModal }) => {
  const {
    register,
    formState: { errors },
    watch,
  } = useForm();

  const [selectedPages, setSelectedPages] = React.useState([]);
  const [isImporting, setIsImporting] = React.useState(false);
  const queryClient = useQueryClient();
  const { bookId, chapterId } = useParams();

  const selectedBook = watch("book");
  const selectedChapter = watch("chapter");

  const togglePage = (pageId) => {
    setSelectedPages((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId]
    );
  };

  const { data: books, isLoading: isLoadingBooks } = useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
  });

  const { data: chapters, isLoading: isLoadingChapters } = useQuery({
    queryKey: [`chapters-${selectedBook}`],
    queryFn: () => getChapters(selectedBook),
    enabled: !!selectedBook,
  });

  const { data: pages, isLoading: isLoadingPages } = useQuery({
    queryKey: [`pages-${selectedChapter}`],
    queryFn: () => getChapterPages(selectedChapter),
    enabled: !!selectedChapter,
  });

  React.useEffect(() => {
    setSelectedPages([]);
  }, [selectedBook, selectedChapter]);

  const handleConfirm = async () => {
    setIsImporting(true);
    try {
      await importPages({ pageIds: selectedPages, chapterId: selectedChapter });
      await queryClient.invalidateQueries({ queryKey: [`book-${bookId}-chapter-${chapterId}`] });
      toast.success("Pages imported successfully");
      handleCloseModal();
    } catch (error) {
      toast.error("Failed to import pages");
    } finally {
      setIsImporting(false);
    }
  };

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
            register={register}
            errors={errors}
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
            register={register}
            errors={errors}
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
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {selectedPages.length} page{selectedPages.length !== 1 ? "s" : ""}{" "}
              selected
            </Typography>
            {isLoadingPages ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: 1.5,
                  maxHeight: 400,
                  overflowY: "auto",
                }}
              >
                {pages?.map((page, idx) => {
                  const pageId = page._id || idx;
                  const isSelected = selectedPages.includes(pageId);
                  return (
                    <Box
                      key={pageId}
                      onClick={() => togglePage(pageId)}
                      sx={{ position: "relative", cursor: "pointer" }}
                    >
                      <Box
                        component="img"
                        src={page.url}
                        alt={`Page ${idx + 1}`}
                        sx={{
                          width: "100%",
                          aspectRatio: "3/4",
                          objectFit: "cover",
                          borderRadius: 1,
                          border: "2px solid",
                          borderColor: isSelected
                            ? "primary.main"
                            : "transparent",
                          "&:hover": { borderColor: "primary.main" },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          position: "absolute",
                          bottom: 4,
                          left: 0,
                          right: 0,
                          textAlign: "center",
                          bgcolor: "rgba(0,0,0,0.5)",
                          color: "white",
                          py: 0.25,
                        }}
                      >
                        {idx}
                      </Typography>
                      {isSelected && (
                        <CheckCircleIcon
                          color="primary"
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "white",
                            borderRadius: "50%",
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
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
          startIcon={isImporting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportPagesModal;
