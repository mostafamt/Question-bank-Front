import React from "react";
import { useForm } from "react-hook-form";
import Select from "../../components/Select/Select";
import ChapterSelect from "../../components/ChapterSelect/ChapterSelect";
import {
  getBooks,
  getChapters,
  getChapterLanguages,
  copyChapter,
} from "../../api/bookapi";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Button,
  ButtonGroup,
  CircularProgress,
  ListItemIcon,
  Menu,
  MenuItem,
} from "@mui/material";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import DrawIcon from "@mui/icons-material/Draw";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CheckIcon from "@mui/icons-material/Check";
import { toast } from "react-toastify";
import styles from "./addBook.module.scss";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/store";
import { getTypes } from "../../services/api";

const DEFAULT_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "Arabic" },
];

const AddBook = () => {
  const navigate = useNavigate();
  const { setFormState, setLanguage, openModal } = useStore();
  const queryClient = useQueryClient();
  const [loadingScan, setLoadingScan] = React.useState(false);
  const [readLanguage, setReadLanguage] = React.useState("en");
  const [languageMenuAnchor, setLanguageMenuAnchor] = React.useState(null);
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
    enabled: !!watch("book"),
  });

  const chapterId = watch("chapter");

  const { data: languagesData } = useQuery({
    queryKey: [`chapter-languages-${chapterId}`],
    queryFn: () => getChapterLanguages(chapterId),
    enabled: !!chapterId,
  });

  const availableLanguages = languagesData?.languages?.length
    ? languagesData.languages
    : DEFAULT_LANGUAGES;

  React.useEffect(() => {
    const chapterDetails = chapters?.find((c) => c._id === chapterId);
    const preferred = availableLanguages.find(
      (l) => l.code === chapterDetails?.language
    );
    setReadLanguage((preferred || availableLanguages[0]).code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, languagesData]);

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

  const handleRead = ({ book, chapter }) => {
    setLanguage(readLanguage);
    navigate(`/read/book/${book}/chapter/${chapter}`, {
      state: { language: readLanguage },
    });
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

  const handleBlankChapter = () => {
    const bookId = watch("book");
    openModal("add-chapter", {
      bookId,
      onChapterCreated: (newChapter) => {
        queryClient.invalidateQueries([`chapters-${bookId}`]);
        setValue("chapter", newChapter._id);
      },
    });
  };

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

              {/* hidden input so react-hook-form tracks the chapter value */}
              <input type="hidden" {...register("chapter", { required: true })} />

              <ChapterSelect
                label="Chapter"
                chapters={chapters}
                value={watch("chapter")}
                loading={isLoadingChapters}
                disabled={!watch("book")}
                isCopying={isCopying}
                onSelect={(id) => setValue("chapter", id)}
                onBlankChapter={handleBlankChapter}
                onNewVersion={(chapterId) =>
                  handleCopyChapter({ bookId: watch("book"), chapterId })
                }
                error={errors?.chapter?.type}
              />
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

              <ButtonGroup variant="contained">
                <Button
                  type="submit"
                  startIcon={renderButtonIcon("read")}
                  name="read"
                  sx={{ bgcolor: "#e65100", "&:hover": { bgcolor: "#bf360c" } }}
                >
                  Read (
                  {availableLanguages.find((l) => l.code === readLanguage)
                    ?.label || readLanguage}
                  )
                </Button>
                <Button
                  type="button"
                  size="small"
                  onClick={(e) => setLanguageMenuAnchor(e.currentTarget)}
                  sx={{
                    bgcolor: "#e65100",
                    "&:hover": { bgcolor: "#bf360c" },
                    px: 0.5,
                  }}
                >
                  <ArrowDropDownIcon />
                </Button>
              </ButtonGroup>
              <Menu
                anchorEl={languageMenuAnchor}
                open={Boolean(languageMenuAnchor)}
                onClose={() => setLanguageMenuAnchor(null)}
              >
                {availableLanguages.map(({ code, label }) => (
                  <MenuItem
                    key={code}
                    selected={readLanguage === code}
                    onClick={() => {
                      setReadLanguage(code);
                      setLanguageMenuAnchor(null);
                    }}
                  >
                    {readLanguage === code && (
                      <ListItemIcon>
                        <CheckIcon fontSize="small" />
                      </ListItemIcon>
                    )}
                    {label}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default AddBook;
