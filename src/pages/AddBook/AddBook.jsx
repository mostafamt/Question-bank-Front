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
import { CircularProgress } from "@mui/material";
import ImportContactsIcon from "@mui/icons-material/ImportContacts";
import DrawIcon from "@mui/icons-material/Draw";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import { toast } from "react-toastify";
import styles from "./addBook.module.scss";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/store";
import { getTypes } from "../../services/api";
import LanguageSplitButton from "./LanguageSplitButton";

const AddBook = () => {
  const navigate = useNavigate();
  const { setFormState, setLanguage, openModal } = useStore();
  const queryClient = useQueryClient();
  const [loadingScan, setLoadingScan] = React.useState(false);
  // Content language shared by the Read / Author / Teacher split buttons.
  const [selectedLanguage, setSelectedLanguage] = React.useState(null);
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

  const availableLanguages = languagesData?.languages ?? [];
  const hasLanguageOptions = availableLanguages.length > 0;

  React.useEffect(() => {
    if (!hasLanguageOptions) {
      setSelectedLanguage(null);
      return;
    }
    const chapterDetails = chapters?.find((c) => c._id === chapterId);
    const preferred = availableLanguages.find(
      (l) => l.code === chapterDetails?.language
    );
    setSelectedLanguage((preferred || availableLanguages[0]).code);
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

  const handleRead = ({ book, chapter }, language = selectedLanguage) => {
    // The read language only selects which language the reader fetches
    // content in — it must not touch the navbar's layout (RTL/LTR) language.
    // When the chapter has no language options, omit it entirely so the
    // reader fetches pages without a language filter.
    navigate(`/read/book/${book}/chapter/${chapter}`, {
      state: language ? { contentLanguage: language } : {},
    });
  };

  const handleReadLanguageSelect = (code) => {
    setSelectedLanguage(code);
    // Run through handleSubmit so book/chapter validation still applies,
    // then navigate straight to the reader in the chosen language.
    handleSubmit((values) => handleRead(values, code))();
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

  const handleBookAuthor = async (
    { book, chapter },
    contentLanguage = selectedLanguage
  ) => {
    setLoadingScan(true);
    try {
      const types = await getTypes();
      setFormState({ types });

      const chapterDetails = chapters.find((c) => c._id === chapter);
      const language = chapterDetails?.language || "en";
      setLanguage(language);

      // `language` drives the navbar layout (RTL/LTR); `contentLanguage`
      // only selects which language's pages are loaded. Omit it when the
      // chapter has no language options so all pages load as before.
      navigate(`/book-author/book/${book}/chapter/${chapter}`, {
        state: contentLanguage ? { language, contentLanguage } : { language },
      });
    } finally {
      setLoadingScan(false);
    }
  };

  const handleAuthorLanguageSelect = (code) => {
    setSelectedLanguage(code);
    handleSubmit((values) => handleBookAuthor(values, code))();
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
          <legend>Select SAieBooks</legend>
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
              <LanguageSplitButton
                label="Author"
                icon={renderButtonIcon("book-author")}
                color="#1565c0"
                hoverColor="#0d47a1"
                languages={availableLanguages}
                selectedLanguage={selectedLanguage}
                disabled={loadingScan}
                mainButtonProps={{ type: "submit", name: "book-author" }}
                onLanguageSelect={handleAuthorLanguageSelect}
              />

              {/* Teacher has no destination yet: its menu only updates the
                  shared language selection. */}
              <LanguageSplitButton
                label="Teacher"
                icon={renderButtonIcon("author")}
                color="#2e7d32"
                hoverColor="#1b5e20"
                languages={availableLanguages}
                selectedLanguage={selectedLanguage}
                onLanguageSelect={setSelectedLanguage}
              />

              <LanguageSplitButton
                label="Read"
                icon={renderButtonIcon("read")}
                color="#e65100"
                hoverColor="#bf360c"
                languages={availableLanguages}
                selectedLanguage={selectedLanguage}
                mainButtonProps={{ type: "submit", name: "read" }}
                onLanguageSelect={handleReadLanguageSelect}
              />
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default AddBook;
