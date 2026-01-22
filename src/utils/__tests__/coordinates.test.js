/**
 * Tests for coordinate conversion utilities
 */

import {
  validateDimensions,
  convertPercentageToPixels,
  convertPixelsToPercentage,
  preserveMetadata,
  createAreaWithMetadata,
  normalizeArea,
} from "../coordinates";

describe("validateDimensions", () => {
  it("should validate correct dimensions", () => {
    const dimensions = { clientWidth: 800, clientHeight: 600 };
    const result = validateDimensions(dimensions);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("should reject null dimensions", () => {
    const result = validateDimensions(null);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Dimensions object is required");
  });

  it("should reject undefined dimensions", () => {
    const result = validateDimensions(undefined);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Dimensions object is required");
  });

  it("should reject missing clientWidth", () => {
    const dimensions = { clientHeight: 600 };
    const result = validateDimensions(dimensions);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Invalid or missing clientWidth");
  });

  it("should reject missing clientHeight", () => {
    const dimensions = { clientWidth: 800 };
    const result = validateDimensions(dimensions);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Invalid or missing clientHeight");
  });

  it("should reject zero clientWidth", () => {
    const dimensions = { clientWidth: 0, clientHeight: 600 };
    const result = validateDimensions(dimensions);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Invalid or missing clientWidth");
  });

  it("should reject zero clientHeight", () => {
    const dimensions = { clientWidth: 800, clientHeight: 0 };
    const result = validateDimensions(dimensions);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Invalid or missing clientHeight");
  });

  it("should reject negative dimensions", () => {
    const dimensions = { clientWidth: -800, clientHeight: -600 };
    const result = validateDimensions(dimensions);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Invalid or missing clientWidth");
    expect(result.errors).toContain("Invalid or missing clientHeight");
  });

  it("should accept dimensions with naturalWidth and naturalHeight", () => {
    const dimensions = {
      clientWidth: 800,
      clientHeight: 600,
      naturalWidth: 1600,
      naturalHeight: 1200,
    };
    const result = validateDimensions(dimensions);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});

describe("convertPercentageToPixels", () => {
  const dimensions = { clientWidth: 800, clientHeight: 600 };

  it("should convert percentage to pixels correctly", () => {
    const area = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
      _unit: "percentage",
    };

    const result = convertPercentageToPixels(area, dimensions);

    expect(result.x).toBe(400); // 50% of 800
    expect(result.y).toBe(300); // 50% of 600
    expect(result.width).toBe(200); // 25% of 800
    expect(result.height).toBe(150); // 25% of 600
    expect(result.unit).toBe("px");
    expect(result.isChanging).toBe(true);
    expect(result.isNew).toBe(true);
  });

  it("should use stored percentage coordinates if available", () => {
    const area = {
      x: 10,
      y: 10,
      width: 10,
      height: 10,
      _percentX: 50,
      _percentY: 50,
      _percentWidth: 25,
      _percentHeight: 25,
      _unit: "percentage",
    };

    const result = convertPercentageToPixels(area, dimensions);

    // Should use _percent values, not x/y/width/height
    expect(result.x).toBe(400);
    expect(result.y).toBe(300);
    expect(result.width).toBe(200);
    expect(result.height).toBe(150);
  });

  it("should handle 0% coordinates", () => {
    const area = {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      _unit: "percentage",
    };

    const result = convertPercentageToPixels(area, dimensions);

    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
  });

  it("should handle 100% dimensions", () => {
    const area = {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      _unit: "percentage",
    };

    const result = convertPercentageToPixels(area, dimensions);

    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.width).toBe(800);
    expect(result.height).toBe(600);
  });

  it("should throw error for invalid dimensions", () => {
    const area = { x: 50, y: 50, width: 25, height: 25 };
    const invalidDimensions = { clientWidth: 0, clientHeight: 0 };

    expect(() => {
      convertPercentageToPixels(area, invalidDimensions);
    }).toThrow("Invalid dimensions");
  });

  it("should handle fractional percentages", () => {
    const area = {
      x: 12.5,
      y: 33.33,
      width: 16.67,
      height: 8.5,
      _unit: "percentage",
    };

    const result = convertPercentageToPixels(area, dimensions);

    expect(result.x).toBeCloseTo(100); // 12.5% of 800
    expect(result.y).toBeCloseTo(199.98); // 33.33% of 600
    expect(result.width).toBeCloseTo(133.36); // 16.67% of 800
    expect(result.height).toBeCloseTo(51); // 8.5% of 600
  });
});

describe("convertPixelsToPercentage", () => {
  const dimensions = { clientWidth: 800, clientHeight: 600 };

  it("should convert pixels to percentage correctly", () => {
    const area = {
      x: 400,
      y: 300,
      width: 200,
      height: 150,
      unit: "px",
    };

    const result = convertPixelsToPercentage(area, dimensions);

    expect(result.x).toBe(50);
    expect(result.y).toBe(50);
    expect(result.width).toBe(25);
    expect(result.height).toBe(25);
    expect(result.unit).toBe("%");
  });

  it("should handle 0 pixel coordinates", () => {
    const area = {
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      unit: "px",
    };

    const result = convertPixelsToPercentage(area, dimensions);

    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.width).toBe(100);
    expect(result.height).toBe(100);
  });

  it("should preserve isChanging and isNew properties", () => {
    const area = {
      x: 400,
      y: 300,
      width: 200,
      height: 150,
      unit: "px",
      isChanging: false,
      isNew: false,
    };

    const result = convertPixelsToPercentage(area, dimensions);

    expect(result.isChanging).toBe(false);
    expect(result.isNew).toBe(false);
  });

  it("should set default values for missing properties", () => {
    const area = {
      x: 400,
      y: 300,
      width: 200,
      height: 150,
    };

    const result = convertPixelsToPercentage(area, dimensions);

    expect(result.isChanging).toBe(true);
    expect(result.isNew).toBe(true);
  });

  it("should throw error for invalid dimensions", () => {
    const area = { x: 400, y: 300, width: 200, height: 150 };
    const invalidDimensions = { clientWidth: 0, clientHeight: 0 };

    expect(() => {
      convertPixelsToPercentage(area, invalidDimensions);
    }).toThrow("Invalid dimensions");
  });
});

describe("preserveMetadata", () => {
  it("should preserve all metadata from original area", () => {
    const originalArea = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
      _unit: "percentage",
      _updated: false,
      _percentX: 50,
      _percentY: 50,
      _percentWidth: 25,
      _percentHeight: 25,
    };

    const convertedArea = {
      x: 400,
      y: 300,
      width: 200,
      height: 150,
      unit: "px",
      isChanging: true,
      isNew: true,
    };

    const result = preserveMetadata(originalArea, convertedArea);

    expect(result.x).toBe(400);
    expect(result.y).toBe(300);
    expect(result.width).toBe(200);
    expect(result.height).toBe(150);
    expect(result._unit).toBe("percentage");
    expect(result._updated).toBe(true);
    expect(result._percentX).toBe(50);
    expect(result._percentY).toBe(50);
    expect(result._percentWidth).toBe(25);
    expect(result._percentHeight).toBe(25);
  });

  it("should calculate percentage coordinates from original if not stored", () => {
    const originalArea = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
      _unit: "percentage",
    };

    const convertedArea = {
      x: 400,
      y: 300,
      width: 200,
      height: 150,
      unit: "px",
    };

    const result = preserveMetadata(originalArea, convertedArea);

    expect(result._percentX).toBe(50);
    expect(result._percentY).toBe(50);
    expect(result._percentWidth).toBe(25);
    expect(result._percentHeight).toBe(25);
  });

  it("should set _updated to true", () => {
    const originalArea = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
      _updated: false,
    };

    const convertedArea = {
      x: 400,
      y: 300,
      width: 200,
      height: 150,
    };

    const result = preserveMetadata(originalArea, convertedArea);

    expect(result._updated).toBe(true);
  });

  it("should default _unit to percentage if not present", () => {
    const originalArea = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
    };

    const convertedArea = {
      x: 400,
      y: 300,
      width: 200,
      height: 150,
    };

    const result = preserveMetadata(originalArea, convertedArea);

    expect(result._unit).toBe("percentage");
  });
});

describe("createAreaWithMetadata", () => {
  it("should create area with default metadata", () => {
    const area = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
    };

    const result = createAreaWithMetadata(area);

    expect(result.x).toBe(50);
    expect(result.y).toBe(50);
    expect(result.width).toBe(25);
    expect(result.height).toBe(25);
    expect(result.unit).toBe("%");
    expect(result.isChanging).toBe(true);
    expect(result.isNew).toBe(true);
    expect(result._unit).toBe("percentage");
    expect(result._updated).toBe(false);
    expect(result._percentX).toBe(50);
    expect(result._percentY).toBe(50);
    expect(result._percentWidth).toBe(25);
    expect(result._percentHeight).toBe(25);
  });

  it("should use provided metadata", () => {
    const area = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
    };

    const metadata = {
      _unit: "px",
      _updated: true,
      _percentX: 60,
      _percentY: 60,
      _percentWidth: 30,
      _percentHeight: 30,
    };

    const result = createAreaWithMetadata(area, metadata);

    expect(result._unit).toBe("px");
    expect(result._updated).toBe(true);
    expect(result._percentX).toBe(60);
    expect(result._percentY).toBe(60);
    expect(result._percentWidth).toBe(30);
    expect(result._percentHeight).toBe(30);
  });

  it("should preserve existing unit from area", () => {
    const area = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
      unit: "px",
    };

    const result = createAreaWithMetadata(area);

    expect(result.unit).toBe("px");
  });

  it("should preserve existing isChanging and isNew", () => {
    const area = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
      isChanging: false,
      isNew: false,
    };

    const result = createAreaWithMetadata(area);

    expect(result.isChanging).toBe(false);
    expect(result.isNew).toBe(false);
  });
});

describe("normalizeArea", () => {
  it("should normalize area with all fields", () => {
    const area = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
      unit: "%",
      isChanging: true,
      isNew: true,
      _unit: "percentage",
      _updated: true,
      _percentX: 50,
      _percentY: 50,
      _percentWidth: 25,
      _percentHeight: 25,
    };

    const result = normalizeArea(area);

    expect(result).toEqual(area);
  });

  it("should add default values for missing fields", () => {
    const area = {
      x: 50,
      y: 50,
    };

    const result = normalizeArea(area);

    expect(result.x).toBe(50);
    expect(result.y).toBe(50);
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
    expect(result.unit).toBe("px");
    expect(result.isChanging).toBe(true);
    expect(result.isNew).toBe(true);
    expect(result._updated).toBe(false);
  });

  it("should handle empty object", () => {
    const area = {};

    const result = normalizeArea(area);

    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.width).toBe(0);
    expect(result.height).toBe(0);
    expect(result.unit).toBe("px");
    expect(result.isChanging).toBe(true);
    expect(result.isNew).toBe(true);
  });

  it("should preserve metadata if present", () => {
    const area = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
      _unit: "percentage",
      _percentX: 50,
    };

    const result = normalizeArea(area);

    expect(result._unit).toBe("percentage");
    expect(result._percentX).toBe(50);
  });
});

describe("Integration tests", () => {
  it("should convert percentage to pixels and back", () => {
    const dimensions = { clientWidth: 800, clientHeight: 600 };
    const originalArea = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
      _unit: "percentage",
    };

    const pixelArea = convertPercentageToPixels(originalArea, dimensions);
    const percentArea = convertPixelsToPercentage(pixelArea, dimensions);

    expect(percentArea.x).toBe(originalArea.x);
    expect(percentArea.y).toBe(originalArea.y);
    expect(percentArea.width).toBe(originalArea.width);
    expect(percentArea.height).toBe(originalArea.height);
  });

  it("should preserve metadata through conversion", () => {
    const dimensions = { clientWidth: 800, clientHeight: 600 };
    const originalArea = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
      _unit: "percentage",
      _percentX: 50,
      _percentY: 50,
      _percentWidth: 25,
      _percentHeight: 25,
    };

    const pixelArea = convertPercentageToPixels(originalArea, dimensions);
    const withMetadata = preserveMetadata(originalArea, pixelArea);

    expect(withMetadata._percentX).toBe(50);
    expect(withMetadata._percentY).toBe(50);
    expect(withMetadata._percentWidth).toBe(25);
    expect(withMetadata._percentHeight).toBe(25);
    expect(withMetadata._unit).toBe("percentage");
    expect(withMetadata._updated).toBe(true);
  });
});
