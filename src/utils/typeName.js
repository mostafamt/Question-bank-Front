// Some saved objects store a smart type by media name only, e.g. "video" or
// "PowerPoint" (24 objects on 2026-11-07). Drop this once the backend renames them.
const SMART_MEDIA = {
  video: "Interactive Smart Video",
  pdf: "Interactive Smart PDF",
  powerpoint: "Interactive Smart PowerPoint",
};

// Only for comparing names: never display, store or send the result
const toFullTypeName = (name) =>
  typeof name === "string" ? SMART_MEDIA[name.toLowerCase()] ?? name : name;

export const isSameTypeName = (first, second) =>
  toFullTypeName(first) === toFullTypeName(second);

const findByName = (types, name) =>
  types?.find((type) => type.typeName === name) ??
  types?.find((type) => isSameTypeName(type.typeName, name));

// A category can share its name with a type, e.g. "Simulation Object".
// Only the type has an abstractParameter, so look among those first.
export const findTypeByName = (types, name) =>
  findByName(
    types?.filter((type) => type.abstractParameter),
    name
  ) ?? findByName(types, name);
