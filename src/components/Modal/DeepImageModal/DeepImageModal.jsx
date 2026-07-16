import React from "react";
import { default as BootstrapModal } from "react-bootstrap/Modal";
import { Button } from "@mui/material";
import { useForm } from "react-hook-form";

import Image from "../../DrawnUI/Image/Image";

const NAME = "deepImage";

/**
 * Modal for uploading/replacing the image painted over a deep image block.
 *
 * Reuses DrawnUI/Image, which is a react-hook-form Controller, so a local form
 * is spun up purely to satisfy its contract. Submit is driven by the footer
 * button (not RHF's handleSubmit), so Image's built-in required rule never
 * blocks it.
 *
 * @param {Object} props
 * @param {Object} props.workingArea - { id, image } of the block being edited
 * @param {Function} props.updateAreaPropertyById - Write the chosen URL back by id
 * @param {Function} props.handleCloseModal - Close the modal
 */
const DeepImageModal = ({ workingArea, updateAreaPropertyById, handleCloseModal }) => {
  // Seed only with an already-hosted URL; a data: crop is the raw scan, not a
  // chosen image, so start empty and let the author upload/paste.
  const seed =
    typeof workingArea?.image === "string" &&
    !workingArea.image.startsWith("data:")
      ? workingArea.image
      : "";

  const {
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { [NAME]: seed } });

  // Image writes via setValue, so watch rather than getValues — the Save button
  // and its disabled state must react to an upload finishing.
  const value = watch(NAME);

  const onSubmit = () => {
    updateAreaPropertyById(workingArea.id, {
      image: value,
      typeOfLabel: "image",
    });
    handleCloseModal();
  };

  return (
    <>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Block image</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <Image
          name={NAME}
          path={[NAME]}
          control={control}
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

export default DeepImageModal;
