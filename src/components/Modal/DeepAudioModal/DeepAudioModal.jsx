import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { Button } from "@mui/material";
import { useForm } from "react-hook-form";

import Sound from "../../DrawnUI/Sound/Sound";

const NAME = "deepAudio";

/**
 * Modal for uploading/replacing the audio painted over a deep audio block.
 *
 * Reuses DrawnUI/Sound, which reads via getValues(name) and writes via
 * setValue(name, link), so a local react-hook-form instance satisfies its
 * contract without wiring a full form submit.
 *
 * @param {Object} props
 * @param {Object} props.workingArea - { id, audio } of the block being edited
 * @param {Function} props.updateAreaPropertyById - Write the chosen URL back by id
 * @param {Function} props.handleCloseModal - Close the modal
 */
const DeepAudioModal = ({ workingArea, updateAreaPropertyById, handleCloseModal }) => {
  const seed = typeof workingArea?.audio === "string" ? workingArea.audio : "";

  const {
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { [NAME]: seed } });

  const value = watch(NAME);

  const onSubmit = () => {
    updateAreaPropertyById(workingArea.id, {
      audio: value,
      typeOfLabel: "audio",
    });
    handleCloseModal();
  };

  return (
    <>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Block audio</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <Sound
          name={NAME}
          path={[NAME]}
          setValue={setValue}
          getValues={getValues}
          errors={errors}
        />
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <Button color="secondary" onClick={handleCloseModal}>
          Cancel
        </Button>
        <Button variant="contained" disabled={!value} onClick={onSubmit}>
          Save
        </Button>
      </BootstrapModal.Footer>
    </>
  );
};

export default DeepAudioModal;
