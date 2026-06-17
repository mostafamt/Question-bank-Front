import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getBooks,
  getChapters,
  getChapterPages,
  importPages,
  submitPages,
} from "../../../../api/bookapi";

const useImportPages = ({ open, onClose, bookId, chapterId }) => {
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedChapter, setSelectedChapter] = useState("");
  const [selectedPages, setSelectedPages] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  const queryClient = useQueryClient();

  const { data: books, isLoading: isLoadingBooks } = useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
  });

  const { data: chapters, isLoading: isLoadingChapters } = useQuery({
    queryKey: ["chapters", selectedBook],
    queryFn: () => getChapters(selectedBook),
    enabled: !!selectedBook,
  });

  const { data: pages, isLoading: isLoadingPages } = useQuery({
    queryKey: ["pages", selectedChapter],
    queryFn: () => getChapterPages(selectedChapter),
    enabled: !!selectedChapter,
  });

  useEffect(() => {
    setSelectedPages([]);
  }, [selectedBook, selectedChapter]);

  useEffect(() => {
    if (!open) {
      setSelectedPages([]);
      setSelectedBook("");
      setSelectedChapter("");
    }
  }, [open]);

  const togglePage = (pageId) => {
    setSelectedPages((prev) =>
      prev.includes(pageId)
        ? prev.filter((id) => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleConfirm = async () => {
    setIsImporting(true);
    try {
      const { pageIds: newPageIds } = await importPages({
        pageIds: selectedPages,
        chapterId: selectedChapter,
      });

      const existingPages = await getChapterPages(chapterId);
      const existingPageIds = existingPages.map((p) => p._id);

      await submitPages({
        pageIds: [...existingPageIds, ...newPageIds],
        chapterId,
      });

      await queryClient.invalidateQueries({
        queryKey: [`book-${bookId}-chapter-${chapterId}`],
      });
      toast.success("Pages imported successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to import pages");
    } finally {
      setIsImporting(false);
    }
  };

  return {
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
  };
};

export default useImportPages;
