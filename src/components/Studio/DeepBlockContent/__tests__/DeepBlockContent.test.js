/**
 * Tests for rendering a deep block's authored text over its area
 */

import React from "react";
import { render, screen } from "@testing-library/react";

import DeepBlockContent from "../DeepBlockContent";

describe("DeepBlockContent", () => {
  it("renders authored html", () => {
    const { container } = render(
      <DeepBlockContent html="<p><strong>hello</strong></p>" />
    );

    expect(screen.getByText("hello").tagName).toBe("STRONG");
    expect(container.querySelector("p")).not.toBeNull();
  });

  it("renders the text but not the payload of unsafe html", () => {
    const { container } = render(
      <DeepBlockContent html='<p onclick="alert(1)">hi</p><script>alert(1)</script>' />
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.innerHTML).not.toContain("onclick");
    expect(screen.getByText("hi")).toBeDefined();
  });

  it("renders nothing when the html sanitizes away entirely", () => {
    const { container } = render(
      <DeepBlockContent html="<script>alert(1)</script>" />
    );

    expect(container.innerHTML).toBe("");
  });

  it.each([
    ["empty", ""],
    ["undefined", undefined],
    ["a cleared editor", "<p><br></p>"],
  ])("renders nothing for %s html", (_label, html) => {
    const { container } = render(<DeepBlockContent html={html} />);

    expect(container.innerHTML).toBe("");
  });
});
