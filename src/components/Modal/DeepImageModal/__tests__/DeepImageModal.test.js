/**
 * Tests for the deep image modal
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import DeepImageModal from "../DeepImageModal";

// DrawnUI/Image pulls in the upload pipeline (axios/toast); stub it down to the
// URL TextField, which is the least brittle way to drive a value without a real
// file upload. The real ValidationMessage is still rendered with the passed
// path/errors so the modal must hand it an array (a string throws on forEach) —
// this guards the path={[NAME]} contract the real Image depends on.
jest.mock("../../../DrawnUI/Image/Image", () => (props) => {
  const ValidationMessage =
    require("../../../ValidationMessage/ValidationMessage").default;
  const { setValue, getValues, name, path, errors } = props;
  return (
    <>
      <input
        aria-label="image-url"
        value={getValues(name) || ""}
        onChange={(e) => setValue(name, e.target.value)}
      />
      <ValidationMessage path={path} errors={errors} />
    </>
  );
});

const setup = (workingArea = { id: "area-1", image: "" }) => {
  const updateAreaPropertyById = jest.fn();
  const handleCloseModal = jest.fn();
  render(
    <DeepImageModal
      workingArea={workingArea}
      updateAreaPropertyById={updateAreaPropertyById}
      handleCloseModal={handleCloseModal}
    />
  );
  return { updateAreaPropertyById, handleCloseModal };
};

describe("DeepImageModal", () => {
  it("seeds the field from a hosted-url workingArea image", () => {
    setup({ id: "area-1", image: "https://cdn.example.com/x.png" });

    expect(screen.getByLabelText("image-url").value).toBe(
      "https://cdn.example.com/x.png"
    );
  });

  it("starts empty when the seed is a data: crop", () => {
    setup({ id: "area-1", image: "data:image/png;base64,xxx" });

    expect(screen.getByLabelText("image-url").value).toBe("");
  });

  it("disables Save until an image is chosen", () => {
    setup();

    const save = screen.getByRole("button", { name: "Save" });
    expect(save.disabled).toBe(true);

    fireEvent.change(screen.getByLabelText("image-url"), {
      target: { value: "https://x.com/a.png" },
    });

    expect(save.disabled).toBe(false);
  });

  it("writes the chosen url back by id and closes on Save", () => {
    const { updateAreaPropertyById, handleCloseModal } = setup({
      id: "area-7",
      image: "",
    });

    fireEvent.change(screen.getByLabelText("image-url"), {
      target: { value: "https://x.com/a.png" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(updateAreaPropertyById).toHaveBeenCalledWith("area-7", {
      image: "https://x.com/a.png",
      typeOfLabel: "image",
    });
    expect(handleCloseModal).toHaveBeenCalledTimes(1);
  });

  it("closes without writing on Cancel", () => {
    const { updateAreaPropertyById, handleCloseModal } = setup();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(updateAreaPropertyById).not.toHaveBeenCalled();
    expect(handleCloseModal).toHaveBeenCalledTimes(1);
  });
});
