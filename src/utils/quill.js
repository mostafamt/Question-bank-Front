import QuillEditor from 'react-quill';
import { getFontOptions } from './fontConfig';

// Register Quill Font format with whitelist to properly handle font selection
const Font = QuillEditor.Quill.import('formats/font');
Font.whitelist = getFontOptions();
QuillEditor.Quill.register(Font, true);

/**
 * Quill modules configuration
 * Includes toolbar with font dropdown and other formatting options
 *
 * The font format is built-in to Quill, so we just need to specify
 * which fonts are available in the toolbar. The CSS classes (.ql-font-*)
 * are automatically applied and styled by our SCSS files.
 */
export const quillModules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: getFontOptions() }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    [{ direction: "rtl" }, { align: [] }],
    ["link", "image", "video"],
    ["clean"],
  ],
  clipboard: {
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};

/**
 * Quill formats - defines which formatting options are available
 * Must include all formats used in toolbar
 */
export const quillFormats = [
  'header',
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'indent',
  'direction',
  'align',
  'link',
  'image',
  'video',
];
