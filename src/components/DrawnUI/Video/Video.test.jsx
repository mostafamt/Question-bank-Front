import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import Video from "./Video";
import { upload } from "../../../utils/upload";

jest.mock("../../../utils/upload", () => ({ upload: jest.fn() }));

const saved = "https://bucket/clip.mp4";

// Like the edit form: the fields mount before the saved values arrive
const Form = ({ getSaved }) => {
  const {
    control,
    getValues,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: getSaved,
  });

  return (
    <Video
      name="file"
      path={["file"]}
      errors={errors}
      control={control}
      getValues={getValues}
      setValue={setValue}
      setError={setError}
      clearErrors={clearErrors}
    />
  );
};

const later = (value) => () =>
  new Promise((resolve) => setTimeout(() => resolve(value), 50));

describe("Video", () => {
  it("shows a saved video that arrives after it mounts", async () => {
    render(<Form getSaved={later({ file: saved })} />);

    await waitFor(() =>
      expect(screen.getByLabelText("Add Url").value).toBe(saved)
    );
    expect(document.querySelector("video source").src).toBe(saved);
  });

  it("rejects a file that is not a video without uploading it", async () => {
    render(<Form getSaved={later({ file: "" })} />);
    upload.mockClear();

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: { files: [new File(["x"], "song.mp3", { type: "audio/mpeg" })] },
    });

    await screen.findByText(/Only Video files are allowed/);
    expect(upload).not.toHaveBeenCalled();
  });

  it("uploads a video file", async () => {
    render(<Form getSaved={later({ file: "" })} />);
    upload.mockResolvedValue("https://bucket/new.mp4");

    const input = document.querySelector('input[type="file"]');
    fireEvent.change(input, {
      target: { files: [new File(["x"], "new.mp4", { type: "video/mp4" })] },
    });

    await waitFor(() =>
      expect(screen.getByLabelText("Add Url").value).toBe(
        "https://bucket/new.mp4"
      )
    );
  });
});
