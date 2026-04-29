export function mapToForm(typeName, trialAreas, typeDefinitions) {
  const typeDef = typeDefinitions?.find((t) => t.typeName === typeName);
  if (!typeDef) throw new Error(`mapToForm: unknown type "${typeName}"`);

  const { labels, abstractParameter } = typeDef;
  if (!abstractParameter)
    throw new Error(`mapToForm: type "${typeName}" has no abstractParameter`);

  const sorted = [...trialAreas].sort((a, b) => a.order - b.order);

  const areasByField = {};
  for (const area of sorted) {
    if (!area.parameter || area.parameter === "Select a parameter") continue;
    const field = stripPrefix(area.parameter);
    areasByField[field] = [...(areasByField[field] ?? []), area];
  }

  const result = {};
  for (const [key, value] of Object.entries(abstractParameter)) {
    if (Array.isArray(value)) {
      const template = value[0] ?? {};
      const anchorField = findAnchorField(template, labels, areasByField);
      const anchorAreas = anchorField ? areasByField[anchorField] ?? [] : [];

      const items = anchorAreas.map((anchorArea, i) => {
        const item = {};
        for (const [templateKey, templateType] of Object.entries(template)) {
          if (templateKey === anchorField) {
            item[templateKey] = resolveValue(anchorArea, templateType);
          } else {
            const siblings =
              areasByField[templateKey] ??
              lookupAreas(areasByField, templateKey);
            const sibling = siblings[i] ?? siblings[0];
            item[templateKey] = sibling
              ? resolveValue(sibling, templateType)
              : defaultForType(templateType);
          }
        }
        return item;
      });

      const baseName = key.replace(/\s*\d+$/, "");
      const outputKey = `${baseName} ${items.length}`;
      result[outputKey] = items;
    } else {
      const areas = areasByField[key] ?? lookupAreas(areasByField, key);
      result[key] = areas[0]
        ? resolveValue(areas[0], value)
        : defaultForType(value);
    }
  }

  return result;
}

function stripPrefix(parameter) {
  return parameter.replace(/^[*#?]+/, "");
}

function normalizeKey(k) {
  return k.replace(/_/g, "").toLowerCase();
}

function lookupAreas(areasByField, key) {
  const norm = normalizeKey(key);
  for (const [k, v] of Object.entries(areasByField)) {
    if (normalizeKey(k) === norm) return v;
  }
  return [];
}

function findAnchorField(template, labels, areasByField) {
  // Primary: find a template key that labels mark as repeatable (*-prefixed)
  if (Array.isArray(labels) && labels.length > 0) {
    const starredFields = labels
      .flatMap(Object.keys)
      .filter((k) => k.startsWith("*"))
      .map((k) => k.slice(1));

    const found = Object.keys(template).find((k) => starredFields.includes(k));
    if (found) return found;
  }

  // Fallback: the template key whose matching areas count is highest (the repeating field)
  let bestKey = null;
  let bestCount = 0;
  for (const k of Object.keys(template)) {
    const count = (areasByField[k] ?? lookupAreas(areasByField, k)).length;
    if (count > bestCount) {
      bestCount = count;
      bestKey = k;
    }
  }
  return bestKey;
}

function resolveValue(area, templateType) {
  if (templateType === "Bool") return area.text === "true" || area.text === "1";
  return area.text ?? "";
}

function defaultForType(templateType) {
  if (templateType === "Bool") return false;
  return "";
}
