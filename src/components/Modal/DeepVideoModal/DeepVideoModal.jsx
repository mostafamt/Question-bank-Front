import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { Button } from "@mui/material";
import { useForm } from "react-hook-form";

import Video from "../../DrawnUI/Video/Video";

const NAME = "deepVideo";

/**
 * Modal for uploading/replacing the video painted over a deep video block.
 *
 * Reuses DrawnUI/Video, which reads via getValues(name) and writes via
 * setValue(name, link). The component also manages a local `url` state, but
 * watch(NAME) correctly reflects uploads because Video calls setValue after
 * each upload completes.
 *
 * @param {Object} props
 * @param {Object} props.workingArea - { id, video } of the block being edited
 * @param {Function} props.updateAreaPropertyById - Write the chosen URL back by id
 * @param {Function} props.handleCloseModal - Close the modal
 */
const DeepVideoModal = ({ workingArea, updateAreaPropertyById, handleCloseModal }) => {
  const seed = typeof workingArea?.video === "string" ? workingArea.video : "";

  const {
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { [NAME]: seed } });

  const value = watch(NAME);

  const onSubmit = () => {
    updateAreaPropertyById(workingArea.id, {
      video: value,
      typeOfLabel: "video",
    });
    handleCloseModal();
  };

  return (
    <>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Block video</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <Video
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

export default DeepVideoModal;
