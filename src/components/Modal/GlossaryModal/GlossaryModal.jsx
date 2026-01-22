import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { Button, TextField, Box } from "@mui/material";

/**
 * GlossaryModal Component
 * Modal for adding or editing glossary terms and definitions
 *
 * @param {Object} props
 * @param {string} props.term - Initial term value (for editing)
 * @param {string} props.definition - Initial definition value (for editing)
 * @param {Function} props.onSubmit - Submit handler (term, definition) => void
 * @param {Function} props.handleCloseModal - Close modal callback
 * @param {string} props.title - Modal title (optional, defaults to "Add Glossary Term")
 */
const GlossaryModal = (props) => {
  const {
    term: initialTerm = "",
    definition: initialDefinition = "",
    onSubmit,
    handleCloseModal,
    title = "Add Glossary Term",
  } = props;

  // Local state for form values
  const [term, setTerm] = React.useState(initialTerm);
  const [definition, setDefinition] = React.useState(initialDefinition);

  // Validation state
  const [errors, setErrors] = React.useState({
    term: false,
    definition: false,
  });

  /**
   * Validate form fields
   */
  const validate = () => {
    const newErrors = {
      term: !term.trim(),
      definition: !definition.trim(),
    };
    setErrors(newErrors);
    return !newErrors.term && !newErrors.definition;
  };

  /**
   * Handle submit
   */
  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    if (onSubmit) {
      onSubmit(term.trim(), definition.trim());
    }

    // Close modal
    if (handleCloseModal) {
      handleCloseModal();
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    if (handleCloseModal) {
      handleCloseModal();
    }
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && event.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body>
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
          onKeyPress={handleKeyPress}
        >
          <TextField
            label="Term"
            variant="outlined"
            fullWidth
            value={term}
            onChange={(e) => {
              setTerm(e.target.value);
              if (errors.term) {
                setErrors((prev) => ({ ...prev, term: false }));
              }
            }}
            error={errors.term}
            helperText={errors.term ? "Term is required" : ""}
            autoFocus
            required
          />

          <TextField
            label="Definition"
            variant="outlined"
            fullWidth
            multiline
            rows={4}
            value={definition}
            onChange={(e) => {
              setDefinition(e.target.value);
              if (errors.definition) {
                setErrors((prev) => ({ ...prev, definition: false }));
              }
            }}
            error={errors.definition}
            helperText={errors.definition ? "Definition is required" : ""}
            required
          />
        </Box>
      </BootstrapModal.Body>

      <BootstrapModal.Footer
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          {initialTerm ? "Update" : "Add"}
        </Button>
      </BootstrapModal.Footer>
    </>
  );
};

export default GlossaryModal;
