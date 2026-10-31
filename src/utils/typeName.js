// Saved objects store these types by media name only, e.g. "PowerPoint" or "video"
const SMART_MEDIA = ["video", "pdf", "powerpoint"];

// The API spells these types several ways, e.g. "Smart Interactive Video",
// "Interactive Smart Video" and "video". The result is only for comparing
// names: never display, store or send it.
const normalizeTypeName = (name) => {
  if (typeof name !== "string") return name;
  const media = name
    .replace(/^(Smart Interactive|Interactive Smart) /, "")
    .toLowerCase();
  return SMART_MEDIA.includes(media)
    ? media
    : name.replace(/^Interactive Smart /, "Smart Interactive ");
};

export const isSameTypeName = (first, second) =>
  normalizeTypeName(first) === normalizeTypeName(second);

export const findTypeByName = (types, name) =>
  types?.find((type) => type.typeName === name) ??
  types?.find((type) => isSameTypeName(type.typeName, name));
