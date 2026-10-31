import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import Pdf from "./Pdf";
import { fileToImages } from "../../../services/api";
import { upload } from "../../../utils/upload";

jest.mock("../../../services/api", () => ({ fileToImages: jest.fn() }));
jest.mock("../../../utils/upload", () => ({ upload: jest.fn() }));

const saved = {
  url: "https://bucket/deck.pptx",
  pages: ["https://images/1.png", "https://images/2.png"],
};

// Like the edit form: the fields mount before the saved values arrive
const Form = ({ getSaved }) => {
  const { control, getValues, setValue } = useForm({
    defaultValues: getSaved,
  });

  return (
    <Pdf
      name="file"
      path={["file"]}
      errors={{}}
      control={control}
      getValues={getValues}
      setValue={setValue}
    />
  );
};

const later = (value) => () =>
  new Promise((resolve) => setTimeout(() => resolve(value), 50));

describe("Pdf", () => {
  it("shows saved pages that arrive after it mounts", async () => {
    render(<Form getSaved={later({ file: saved })} />);

    const image = await screen.findByAltText("Page 1");

    expect(image.src).toBe(saved.pages[0]);
    screen.getByText("Page 1 / 2");
    await waitFor(() =>
      expect(screen.getByLabelText("Add Url").value).toBe(saved.url)
    );
  });

  it("shows pages from a newly picked file", async () => {
    render(<Form getSaved={later({ file: "" })} />);
    upload.mockResolvedValue("https://bucket/new.pdf");
    fileToImages.mockResolvedValue(["https://images/new.png"]);

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: { files: [new File(["x"], "new.pdf")] },
    });

    const image = await screen.findByAltText("Page 1");

    expect(image.src).toBe("https://images/new.png");
    expect(screen.getByLabelText("Add Url").value).toBe(
      "https://bucket/new.pdf"
    );
  });
});
