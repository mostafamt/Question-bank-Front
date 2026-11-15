export const PPTX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.presentationml.presentation";

const AUDIO_RULE = {
  label: "Sound",
  extensions: ["mp3", "wav", "ogg", "webm", "m4a", "aac"],
  mimePrefixes: ["audio/"],
  // Browsers often report .webm / .ogg as video even when they only hold audio
  mimeTypes: ["video/webm", "video/ogg", "application/ogg"],
  maxMB: 20,
};

export const FILE_RULES = {
  image: {
    label: "Image",
    extensions: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
    mimePrefixes: ["image/"],
    mimeTypes: [],
    maxMB: 5,
  },
  video: {
    label: "Video",
    extensions: ["mp4", "webm", "ogg", "mov"],
    mimePrefixes: ["video/"],
    mimeTypes: ["application/ogg"],
    maxMB: 100,
  },
  audio: AUDIO_RULE,
  voice: AUDIO_RULE,
  html: {
    label: "HTML",
    extensions: ["html", "htm"],
    mimePrefixes: [],
    mimeTypes: ["text/html"],
    maxMB: 2,
  },
  pdf: {
    label: "PDF",
    extensions: ["pdf"],
    mimePrefixes: [],
    mimeTypes: ["application/pdf"],
    maxMB: 20,
  },
  ppt: {
    label: "PowerPoint",
    extensions: ["ppt", "pptx"],
    mimePrefixes: [],
    mimeTypes: ["application/vnd.ms-powerpoint", PPTX_MIME_TYPE],
    maxMB: 50,
  },
};

const getExtension = (fileName = "") => {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase();
};

// Value for <input type="file" accept="...">, e.g. ".pdf,application/pdf"
export const acceptFor = (type) => {
  const rule = FILE_RULES[type];
  if (!rule) return undefined;
  return [...rule.extensions.map((ext) => `.${ext}`), ...rule.mimeTypes].join(
    ","
  );
};

// Returns an error message, or null when the file can be uploaded.
// The `accept` attribute is only a hint to the picker, so this is the real check.
export const validateFile = (file, type) => {
  const rule = FILE_RULES[type];
  if (!file) return "Please choose a file";
  if (!rule) return null;

  const allowed = rule.extensions.map((ext) => `.${ext}`).join(", ");
  const typeError = `Only ${rule.label} files are allowed (${allowed})`;

  if (!rule.extensions.includes(getExtension(file.name))) return typeError;

  // Some systems report an empty type (e.g. .pptx on Windows): the extension decides then
  const mime = (file.type || "").split(";")[0].toLowerCase();
  const mimeMatches =
    !mime ||
    rule.mimeTypes.includes(mime) ||
    rule.mimePrefixes.some((prefix) => mime.startsWith(prefix));
  if (!mimeMatches) return typeError;

  if (file.size > rule.maxMB * 1024 * 1024) {
    return `File is too large (max ${rule.maxMB} MB)`;
  }

  return null;
};
