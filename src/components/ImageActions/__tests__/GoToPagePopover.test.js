import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import GoToPagePopover from "../GoToPagePopover";

const renderPopover = (props = {}) => {
  const anchor = document.createElement("button");
  document.body.appendChild(anchor);
  const handlers = { onClose: jest.fn(), onGoToPage: jest.fn() };
  render(
    <GoToPagePopover
      anchorEl={anchor}
      currentPage={2}
      pageCount={4}
      {...handlers}
      {...props}
    />
  );
  return handlers;
};

const input = () => screen.getByLabelText("Go to page");
const goButton = () => screen.getByRole("button", { name: "Go" });

describe("GoToPagePopover", () => {
  it("starts at the current page", () => {
    renderPopover();
    expect(input()).toHaveValue(2);
  });

  it("goes to the chosen page (0-based) and closes", () => {
    const { onClose, onGoToPage } = renderPopover();
    fireEvent.change(input(), { target: { value: "4" } });
    fireEvent.click(goButton());
    expect(onGoToPage).toHaveBeenCalledWith(3);
    expect(onClose).toHaveBeenCalled();
  });

  it("disables Go for pages out of range", () => {
    const { onGoToPage } = renderPopover();
    for (const value of ["0", "5", "1.5"]) {
      fireEvent.change(input(), { target: { value } });
      expect(goButton()).toBeDisabled();
    }
    fireEvent.submit(input().closest("form"));
    expect(onGoToPage).not.toHaveBeenCalled();
  });

  it("only closes when the current page is chosen", () => {
    const { onClose, onGoToPage } = renderPopover();
    fireEvent.click(goButton());
    expect(onClose).toHaveBeenCalled();
    expect(onGoToPage).not.toHaveBeenCalled();
  });
});
