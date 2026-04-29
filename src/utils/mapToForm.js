export function mapToForm(typeName, trialAreas, typeDefinitions) {
  const typeDef = typeDefinitions?.find((t) => t.typeName === typeName);
  if (!typeDef) throw new Error(`mapToForm: unknown type "${typeName}"`);

  const { labels, abstractParameter } = typeDef;
  if (!abstractParameter) throw new Error(`mapToForm: type "${typeName}" has no abstractParameter`);

  const sorted = [...trialAreas].sort((a, b) => a.order - b.order);

  const areasByField = {};
  for (const area of sorted) {
    if (!area.parameter) continue;
    const field = stripPrefix(area.parameter);
    areasByField[field] = [...(areasByField[field] ?? []), area];
  }

  const result = {};
  for (const [key, value] of Object.entries(abstractParameter)) {
    if (Array.isArray(value)) {
      const template = value[0] ?? {};
      const anchorField = findAnchorField(template, labels);
      const anchorAreas = anchorField ? (areasByField[anchorField] ?? []) : [];

      const items = anchorAreas.map((anchorArea) => {
        const item = {};
        for (const [templateKey, templateType] of Object.entries(template)) {
          if (templateKey === anchorField) {
            item[templateKey] = resolveValue(anchorArea, templateType);
          } else {
            const sibling = areasByField[templateKey]?.[0];
            item[templateKey] = sibling
              ? resolveValue(sibling, templateType)
              : defaultForType(templateType);
          }
        }
        return item;
      });

      const outputKey = key.replace(/\d+$/, String(items.length));
      result[outputKey] = items;
    } else {
      const areas = areasByField[key] ?? [];
      result[key] = areas[0] ? resolveValue(areas[0], value) : defaultForType(value);
    }
  }

  return result;
}

function stripPrefix(parameter) {
  return parameter.replace(/^[*#]+/, "");
}

function findAnchorField(template, labels) {
  const starredFields = labels
    .flatMap(Object.keys)
    .filter((k) => k.startsWith("*"))
    .map((k) => k.slice(1));

  return Object.keys(template).find((k) => starredFields.includes(k));
}

function resolveValue(area, templateType) {
  if (templateType === "Bool") return area.text === "true" || area.text === "1";
  return area.text ?? "";
}

function defaultForType(templateType) {
  if (templateType === "Bool") return false;
  return "";
}
