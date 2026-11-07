import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import Html from "./Html";
import { upload } from "../../../utils/upload";

jest.mock("../../../utils/upload", () => ({ upload: jest.fn() }));

const saved = "https://bucket/page.html";

// Like the edit form: the fields mount before the saved values arrive
const Form = ({ getSaved }) => {
  const { control, getValues, setValue } = useForm({
    defaultValues: getSaved,
  });

  return (
    <Html
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

describe("Html", () => {
  it("shows a saved page that arrives after it mounts", async () => {
    render(<Form getSaved={later({ file: saved })} />);

    const frame = await screen.findByTitle("file");

    expect(frame.src).toBe(saved);
    await waitFor(() =>
      expect(screen.getByLabelText("Add Url").value).toBe(saved)
    );
  });

  it("shows a newly picked file", async () => {
    render(<Form getSaved={later({ file: "" })} />);
    upload.mockResolvedValue("https://bucket/new.html");

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: { files: [new File(["<p>x</p>"], "new.html")] },
    });

    const frame = await screen.findByTitle("file");

    expect(frame.src).toBe("https://bucket/new.html");
    expect(screen.getByLabelText("Add Url").value).toBe(
      "https://bucket/new.html"
    );
  });

  it("shows a pasted url once the field loses focus", async () => {
    render(<Form getSaved={later({ file: "" })} />);
    await waitFor(() => expect(screen.queryByTitle("file")).toBeNull());

    const field = screen.getByLabelText("Add Url");
    fireEvent.change(field, { target: { value: saved } });
    expect(screen.queryByTitle("file")).toBeNull();
    fireEvent.blur(field);

    expect((await screen.findByTitle("file")).src).toBe(saved);
  });

  it("sandboxes the page away from the app's origin", async () => {
    render(<Form getSaved={later({ file: saved })} />);

    const frame = await screen.findByTitle("file");

    expect(frame.getAttribute("sandbox")).toBe("allow-scripts");
  });

  it("opens and closes the full screen viewer", async () => {
    render(<Form getSaved={later({ file: saved })} />);

    fireEvent.click(await screen.findByLabelText("view full screen"));
    expect(screen.getByTitle("file full screen").src).toBe(saved);

    fireEvent.click(screen.getByLabelText("close"));
    await waitFor(() =>
      expect(screen.queryByTitle("file full screen")).toBeNull()
    );
  });
});
