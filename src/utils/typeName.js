// The API spells these types both ways, e.g. "Smart Interactive Video" and
// "Interactive Smart Video". The result is only for comparing names: never
// display, store or send it.
const normalizeTypeName = (name) =>
  typeof name === "string"
    ? name.replace(/^Interactive Smart /, "Smart Interactive ")
    : name;

export const isSameTypeName = (first, second) =>
  normalizeTypeName(first) === normalizeTypeName(second);

export const findTypeByName = (types, name) =>
  types?.find((type) => type.typeName === name) ??
  types?.find((type) => isSameTypeName(type.typeName, name));
