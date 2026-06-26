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
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import { createChapter } from "../../../api/bookapi";
import { domainList, subDomainList } from "../../../config";

const COGNITIVE_OPTIONS = [
  { value: "remember", label: "Remember" },
  { value: "understand", label: "Understand" },
  { value: "apply", label: "Apply" },
  { value: "analyze", label: "Analyze" },
  { value: "evaluate", label: "Evaluate" },
  { value: "create", label: "Create" },
];

const STEPS = ["Basic Info", "Domain & Content", "Table of Contents"];

const INITIAL_FORM = {
  title: "",
  description: "",
  language: "en",
  depth: "",
  cognitive: "",
  topicName: "",
  pdfUrl: "",
  domainId: "",
  domainName: "",
  subDomainId: "",
  subDomainName: "",
};

function flatToTree(items) {
  const root = [];
  const stack = [];
  for (const item of items) {
    const node = { title: item.title, depth: item.depth, children: [] };
    while (stack.length && stack[stack.length - 1].depth >= item.depth) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  }
  return root;
}

const StepBasicInfo = ({ form, setForm, titleError, setTitleError, disabled }) => (
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
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
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
    <TextField
      label="PDF URL"
      value={form.pdfUrl}
      onChange={(e) => setForm({ pdfUrl: e.target.value })}
      disabled={disabled}
      fullWidth
    />
  </Box>
);

const StepDomainContent = ({ form, setForm, disabled }) => {
  const subDomains = form.domainId ? subDomainList[form.domainId] || [] : [];

  const handleDomainChange = (e) => {
    const id = e.target.value;
    const domain = domainList.find((d) => d.id === id);
    setForm({
      domainId: id,
      domainName: domain?.name || "",
      subDomainId: "",
      subDomainName: "",
    });
  };

  const handleSubDomainChange = (e) => {
    const id = e.target.value;
    const sub = subDomains.find((s) => s.id === id);
    setForm({ subDomainId: id, subDomainName: sub?.name || "" });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel>Domain</InputLabel>
        <Select value={form.domainId} label="Domain" onChange={handleDomainChange}>
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {domainList.map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth disabled={disabled || !form.domainId}>
        <InputLabel>Sub Domain</InputLabel>
        <Select value={form.subDomainId} label="Sub Domain" onChange={handleSubDomainChange}>
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {subDomains.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

const StepToc = ({ tocItems, setTocItems, disabled }) => {
  const addItem = () =>
    setTocItems((prev) => [...prev, { title: "", depth: 0 }]);

  const removeItem = (i) =>
    setTocItems((prev) => prev.filter((_, idx) => idx !== i));

  const updateItem = (i, patch) =>
    setTocItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
      {tocItems.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ py: 4, textAlign: "center" }}
        >
          No TOC items yet. Click "+ Add Item" to start.
        </Typography>
      )}
      {tocItems.map((item, i) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            pl: item.depth * 3,
          }}
        >
          <TextField
            label="Title"
            value={item.title}
            onChange={(e) => updateItem(i, { title: e.target.value })}
            disabled={disabled}
            size="small"
            fullWidth
          />
          <FormControl size="small" sx={{ minWidth: 100 }} disabled={disabled}>
            <InputLabel>Depth</InputLabel>
            <Select
              value={item.depth}
              label="Depth"
              onChange={(e) => updateItem(i, { depth: e.target.value })}
            >
              {[0, 1, 2, 3].map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            onClick={() => removeItem(i)}
            disabled={disabled}
            size="small"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
      <Button
        startIcon={<AddIcon />}
        onClick={addItem}
        disabled={disabled}
        sx={{ alignSelf: "flex-start", mt: 1 }}
      >
        Add Item
      </Button>
    </Box>
  );
};

const AddChapterModal = ({ open, handleCloseModal, bookId, onChapterCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setFormRaw] = useState(INITIAL_FORM);
  const [tocItems, setTocItems] = useState([]);
  const [titleError, setTitleError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setForm = (patch) => setFormRaw((prev) => ({ ...prev, ...patch }));

  const reset = () => {
    setActiveStep(0);
    setFormRaw(INITIAL_FORM);
    setTocItems([]);
    setTitleError("");
  };

  const handleClose = () => {
    reset();
    handleCloseModal();
  };

  const handleNext = () => {
    if (activeStep === 0 && !form.title.trim()) {
      setTitleError("Title is required");
      return;
    }
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  const handleSubmit = async () => {
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
        ...(form.pdfUrl && { pdfUrl: form.pdfUrl }),
        ...(form.cognitive && { cognitive: form.cognitive }),
        ...(form.topicName && { topicName: form.topicName }),
        ...(form.depth !== "" && { depth: Number(form.depth) }),
        ...(tocItems.length && { toc: flatToTree(tocItems) }),
      };

      const newChapter = await createChapter(payload);
      toast.success("Chapter created");
      handleClose();
      onChapterCreated?.(newChapter);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Failed to create chapter"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = activeStep === STEPS.length - 1;

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
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <StepBasicInfo
            form={form}
            setForm={setForm}
            titleError={titleError}
            setTitleError={setTitleError}
            disabled={isSubmitting}
          />
        )}
        {activeStep === 1 && (
          <StepDomainContent form={form} setForm={setForm} disabled={isSubmitting} />
        )}
        {activeStep === 2 && (
          <StepToc tocItems={tocItems} setTocItems={setTocItems} disabled={isSubmitting} />
        )}
      </DialogContent>
      <Divider sx={{ borderColor: "#777" }} />
      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          onClick={activeStep === 0 ? handleClose : handleBack}
          disabled={isSubmitting}
        >
          {activeStep === 0 ? "Cancel" : "Back"}
        </Button>
        <Button
          variant="contained"
          onClick={isLastStep ? handleSubmit : handleNext}
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {isLastStep ? "Save" : "Next"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddChapterModal;
