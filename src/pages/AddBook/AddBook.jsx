import React from "react";
import { useForm } from "react-hook-form";
import Select from "../../components/Select/Select";
import { getBooks, getChapters, copyChapter } from "../../api/bookapi";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button, CircularProgress, IconButton, Tooltip } from "@mui/material";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import DrawIcon from "@mui/icons-material/Draw";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { toast } from "react-toastify";
import styles from "./addBook.module.scss";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/store";
import { getTypes } from "../../services/api";

const AddBook = () => {
  const navigate = useNavigate();
  const { setFormState, setLanguage, openModal } = useStore();
  const queryClient = useQueryClient();
  const [loadingScan, setLoadingScan] = React.useState(false);
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
  } = useForm();

  const { data: books, isLoading: isLoadingBooks } = useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
  });

  const { data: chapters, isLoading: isLoadingChapters } = useQuery({
    queryKey: [`chapters-${watch("book")}`],
    queryFn: () => getChapters(watch("book")),
    enabled: !!watch("book"), // Disable auto-fetch
  });

  const handleRead = ({ book, chapter }) => {
    const chapterDetails = chapters.find((c) => c._id === chapter);
    const language = chapterDetails?.language || "en";
    setLanguage(language);
    navigate(`/read/book/${book}/chapter/${chapter}`, { state: { language } });
  };

  const handleAuthor = async ({ book, chapter }) => {
    setLoadingScan(true);
    try {
      const types = await getTypes();
      setFormState({ types });

      const chapterDetails = chapters.find((c) => c._id === chapter);
      const language = chapterDetails?.language || "en";
      setLanguage(language);

      navigate(`/book/${book}/chapter/${chapter}`, { state: { language } });
    } finally {
      setLoadingScan(false);
    }
  };

  const handleBookAuthor = async ({ book, chapter }) => {
    setLoadingScan(true);
    try {
      const types = await getTypes();
      setFormState({ types });

      const chapterDetails = chapters.find((c) => c._id === chapter);
      const language = chapterDetails?.language || "en";
      setLanguage(language);

      navigate(`/book-author/book/${book}/chapter/${chapter}`, {
        state: { language },
      });
    } finally {
      setLoadingScan(false);
    }
  };

  const { mutate: handleCopyChapter, isPending: isCopying } = useMutation({
    mutationFn: copyChapter,
    onSuccess: (data) => {
      const bookId = watch("book");
      queryClient.invalidateQueries([`chapters-${bookId}`]);
      setValue("chapter", data.chapterId);
      toast.success(`Chapter copied: "${data.title}"`);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to copy chapter");
    },
  });

  const chapterValue = watch("chapter");

  React.useEffect(() => {
    if (chapterValue === "__add_chapter__") {
      setValue("chapter", "");
      const bookId = watch("book");
      openModal("add-chapter", {
        bookId,
        onChapterCreated: (newChapter) => {
          queryClient.invalidateQueries([`chapters-${bookId}`]);
          setValue("chapter", newChapter._id);
        },
      });
    }
  }, [chapterValue]);

  const onSubmit = async (values, event) => {
    const submitterName = event?.nativeEvent?.submitter?.name;

    if (submitterName === "book-author") {
      handleBookAuthor(values);
    } else if (submitterName === "author") {
      await handleAuthor(values);
    } else {
      await handleRead(values);
    }
  };

  const renderButtonIcon = (type) => {
    // AutoStoriesIcon
    if (type === "author") {
      return loadingScan ? <CircularProgress size="1rem" /> : <DrawIcon />;
    } else if (type === "book-author") {
      return <AutoStoriesIcon />;
    } else {
      return <ImportContactsIcon />;
    }
  };

  return (
    <div className={styles["add-book"]}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset>
          <legend>Define Blocks</legend>
          <div>
            <div className={styles.row}>
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
              >
                {chapters?.map((chapter) => (
                  <option key={chapter._id} value={chapter._id}>
                    {chapter.title}
                  </option>
                ))}
                {watch("book") && (
                  <option value="__add_chapter__">+ Add Chapter</option>
                )}
              </Select>

              <Tooltip title="Copy chapter">
                <span>
                  <IconButton
                    onClick={() =>
                      handleCopyChapter({
                        bookId: watch("book"),
                        chapterId: watch("chapter"),
                      })
                    }
                    disabled={!watch("chapter") || isCopying}
                    size="small"
                  >
                    {isCopying ? (
                      <CircularProgress size="1.25rem" />
                    ) : (
                      <ContentCopyIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </div>

            <div className={styles.actions}>
              <Button
                variant="contained"
                type="submit"
                disabled={loadingScan}
                startIcon={renderButtonIcon("book-author")}
                name="book-author"
                sx={{ bgcolor: "#1565c0", "&:hover": { bgcolor: "#0d47a1" } }}
              >
                Book Author
              </Button>

              <Button
                variant="contained"
                type="submit"
                disabled={loadingScan}
                startIcon={renderButtonIcon("author")}
                name="author"
                sx={{ bgcolor: "#2e7d32", "&:hover": { bgcolor: "#1b5e20" } }}
              >
                Author
              </Button>

              <Button
                variant="contained"
                type="submit"
                startIcon={renderButtonIcon("read")}
                name="read"
                sx={{ bgcolor: "#e65100", "&:hover": { bgcolor: "#bf360c" } }}
              >
                Read
              </Button>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default AddBook;
