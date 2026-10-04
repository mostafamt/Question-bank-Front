/**
 * Tests for HTML sanitizing of authored (Quill) content
 */

import { sanitizeHtml, isEmptyHtml } from "../sanitize";

describe("sanitizeHtml", () => {
  it.each([
    ["null", null],
    ["undefined", undefined],
    ["empty string", ""],
    ["a number", 42],
  ])("returns an empty string for %s", (_label, input) => {
    expect(sanitizeHtml(input)).toBe("");
  });

  it("keeps Quill's formatting markup", () => {
    const html =
      "<p><strong>bold</strong> <em>italic</em> <u>under</u> <s>strike</s></p>";
    expect(sanitizeHtml(html)).toBe(html);
  });

  it("keeps ql-* classes, which carry font/size/align/indent", () => {
    const clean = sanitizeHtml('<p class="ql-align-center ql-indent-1">hi</p>');
    expect(clean).toContain("ql-align-center");
    expect(clean).toContain("ql-indent-1");
  });

  it("keeps lists, headers and blockquotes", () => {
    const html = "<h1>t</h1><blockquote>q</blockquote><ol><li>a</li></ol>";
    expect(sanitizeHtml(html)).toBe(html);
  });

  // Quill's video format emits an iframe, which DOMPurify drops by default.
  it("keeps a Quill video iframe", () => {
    const clean = sanitizeHtml(
      '<iframe class="ql-video" src="https://example.com/v" allowfullscreen></iframe>'
    );
    expect(clean).toContain("<iframe");
    expect(clean).toContain('src="https://example.com/v"');
  });

  it("strips script tags", () => {
    expect(sanitizeHtml('<p>hi</p><script>alert("x")</script>')).toBe(
      "<p>hi</p>"
    );
  });

  it("strips inline event handlers", () => {
    const clean = sanitizeHtml('<p onclick="alert(1)">hi</p>');
    expect(clean).not.toContain("onclick");
    expect(clean).toContain("hi");
  });

  it("strips javascript: urls", () => {
    const clean = sanitizeHtml('<a href="javascript:alert(1)">x</a>');
    expect(clean).not.toContain("javascript:");
  });

  it("strips an onerror image payload", () => {
    const clean = sanitizeHtml('<img src="x" onerror="alert(1)" />');
    expect(clean).not.toContain("onerror");
  });

  // srcdoc would let an iframe carry its own script past the src check.
  it("strips iframe srcdoc", () => {
    const clean = sanitizeHtml(
      '<iframe srcdoc="<script>alert(1)</script>"></iframe>'
    );
    expect(clean).not.toContain("srcdoc");
  });

  it("adds rel=noopener to target=_blank links", () => {
    const clean = sanitizeHtml('<a href="https://x.com" target="_blank">x</a>');
    expect(clean).toContain('rel="noopener noreferrer"');
  });
});

describe("isEmptyHtml", () => {
  it.each([
    ["a cleared Quill editor", "<p><br></p>"],
    ["empty paragraphs", "<p></p><p></p>"],
    ["whitespace only", "<p>   </p>"],
    ["nbsp only", "<p>&nbsp;</p>"],
    ["empty string", ""],
    ["undefined", undefined],
  ])("is true for %s", (_label, html) => {
    expect(isEmptyHtml(html)).toBe(true);
  });

  it.each([
    ["text", "<p>hi</p>"],
    ["an image with no text", '<p><img src="data:image/png;base64,x" /></p>'],
    ["a video with no text", '<iframe src="https://x.com/v"></iframe>'],
  ])("is false for %s", (_label, html) => {
    expect(isEmptyHtml(html)).toBe(false);
  });
});
