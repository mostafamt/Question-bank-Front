import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  IconButton,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { createChapter } from "../../../api/bookapi";
import { domainList, subDomainList } from "../../../config";
import VisuallyHiddenInput from "../../VisuallyHiddenInput/VisuallyHiddenInput";

const COGNITIVE_OPTIONS = [
  { value: "remember", label: "Remember" },
  { value: "understand", label: "Understand" },
  { value: "apply", label: "Apply" },
  { value: "analyze", label: "Analyze" },
  { value: "evaluate", label: "Evaluate" },
  { value: "create", label: "Create" },
];


const INITIAL_FORM = {
  title: "",
  description: "",
  language: "en",
  depth: "",
  cognitive: "",
  topicName: "",
  domainId: "",
  domainName: "",
  subDomainId: "",
  subDomainName: "",
  file: null,
};


const ChapterForm = ({ form, setForm, titleError, setTitleError, disabled }) => {
  const subDomains = form.domainId ? subDomainList[form.domainId] || [] : [];

  const handleDomainChange = (e) => {
    const id = e.target.value;
    const domain = domainList.find((d) => d.id === id);
    setForm({ domainId: id, domainName: domain?.name || "", subDomainId: "", subDomainName: "" });
  };

  const handleSubDomainChange = (e) => {
    const id = e.target.value;
    const sub = subDomains.find((s) => s.id === id);
    setForm({ subDomainId: id, subDomainName: sub?.name || "" });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
      <TextField
        label="Title"
        value={form.title}
        onChange={(e) => {
          setForm({ title: e.target.value });
          if (e.target.value.trim()) setTitleError("");
        }}
        error={!!titleError}
        helperText={titleError}
        disabled={disabled}
        fullWidth
        autoFocus
        required
      />
      <TextField
        label="Description"
        value={form.description}
        onChange={(e) => setForm({ description: e.target.value })}
        disabled={disabled}
        fullWidth
        multiline
        rows={3}
      />
      <Box sx={{ display: "flex", gap: 2 }}>
        <FormControl fullWidth disabled={disabled}>
          <InputLabel>Language</InputLabel>
          <Select
            value={form.language}
            label="Language"
            onChange={(e) => setForm({ language: e.target.value })}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ar">Arabic</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Depth"
          type="number"
          value={form.depth}
          onChange={(e) => setForm({ depth: e.target.value })}
          disabled={disabled}
          fullWidth
          inputProps={{ min: 0 }}
        />
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <FormControl fullWidth disabled={disabled}>
          <InputLabel>Cognitive</InputLabel>
          <Select
            value={form.cognitive}
            label="Cognitive"
            onChange={(e) => setForm({ cognitive: e.target.value })}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {COGNITIVE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Topic Name"
          value={form.topicName}
          onChange={(e) => setForm({ topicName: e.target.value })}
          disabled={disabled}
          fullWidth
        />
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <FormControl fullWidth disabled={disabled}>
          <InputLabel>Domain</InputLabel>
          <Select value={form.domainId} label="Domain" onChange={handleDomainChange}>
            <MenuItem value=""><em>None</em></MenuItem>
            {domainList.map((d) => (
              <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth disabled={disabled || !form.domainId}>
          <InputLabel>Sub Domain</InputLabel>
          <Select value={form.subDomainId} label="Sub Domain" onChange={handleSubDomainChange}>
            <MenuItem value=""><em>None</em></MenuItem>
            {subDomains.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Button component="label" variant="outlined" disabled={disabled}>
          {form.file ? "Replace PDF" : "Upload PDF"}
          <VisuallyHiddenInput
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              if (selected && selected.type !== "application/pdf") {
                toast.error("Please select a PDF file");
                e.target.value = "";
                return;
              }
              setForm({ file: selected });
              e.target.value = "";
            }}
          />
        </Button>
        {form.file && (
          <>
            <Typography variant="body2" noWrap sx={{ flex: 1 }}>
              {form.file.name}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setForm({ file: null })}
              disabled={disabled}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );
};


const AddChapterModal = ({ open, handleCloseModal, bookId, onChapterCreated }) => {
  const [form, setFormRaw] = useState(INITIAL_FORM);
  const [titleError, setTitleError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setForm = (patch) => setFormRaw((prev) => ({ ...prev, ...patch }));

  const reset = () => {
    setFormRaw(INITIAL_FORM);
    setTitleError("");
  };

  const handleClose = () => {
    reset();
    handleCloseModal();
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setTitleError("Title is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        bookId,
        title: form.title.trim(),
        language: form.language,
        ...(form.description && { description: form.description }),
        ...(form.domainId && { domainId: form.domainId, domainName: form.domainName }),
        ...(form.subDomainId && {
          subDomainId: form.subDomainId,
          subDomainName: form.subDomainName,
        }),
        ...(form.cognitive && { cognitive: form.cognitive }),
        ...(form.topicName && { topicName: form.topicName }),
        ...(form.depth !== "" && { depth: Number(form.depth) }),
        ...(form.file && { file: form.file }),
      };

      const newChapter = await createChapter(payload);
      toast.success("Chapter created");
      handleClose();
      onChapterCreated?.({
        _id: newChapter.chapterId ?? newChapter._id,
        ...newChapter,
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to create chapter"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={{ "& .MuiDialog-container": { alignItems: "flex-start" } }}
      PaperProps={{ sx: { mt: 8 } }}
    >
      <DialogTitle
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        Add Chapter
        <IconButton onClick={handleClose} disabled={isSubmitting}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Divider sx={{ borderColor: "#777" }} />
      <DialogContent>
        <ChapterForm
          form={form}
          setForm={setForm}
          titleError={titleError}
          setTitleError={setTitleError}
          disabled={isSubmitting}
        />
      </DialogContent>
      <Divider sx={{ borderColor: "#777" }} />
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button variant="outlined" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddChapterModal;
