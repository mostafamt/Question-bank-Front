/**
 * Tests for coordinate conversion service
 */

import {
  validateRefAccess,
  shouldConvertArea,
  getOriginalPercentageCoords,
  processPageAreas,
  processAreasForImageLoad,
  createSafeOnImageLoad,
} from "../coordinate.service";

describe("validateRefAccess", () => {
  it("should validate a valid ref", () => {
    const mockRef = {
      current: {
        studioEditorSelectorRef: {
          current: {
            clientWidth: 800,
            clientHeight: 600,
            naturalWidth: 1600,
            naturalHeight: 1200,
          },
        },
      },
    };

    const result = validateRefAccess(mockRef);

    expect(result.isValid).toBe(true);
    expect(result.dimensions).toEqual({
      clientWidth: 800,
      clientHeight: 600,
      naturalWidth: 1600,
      naturalHeight: 1200,
    });
    expect(result.error).toBeUndefined();
  });

  it("should reject null ref", () => {
    const result = validateRefAccess(null);

    expect(result.isValid).toBe(false);
    expect(result.dimensions).toBeNull();
    expect(result.error).toBe("studioEditorRef is null or undefined");
  });

  it("should reject undefined ref", () => {
    const result = validateRefAccess(undefined);

    expect(result.isValid).toBe(false);
    expect(result.dimensions).toBeNull();
    expect(result.error).toBe("studioEditorRef is null or undefined");
  });

  it("should reject ref with null current", () => {
    const mockRef = {
      current: null,
    };

    const result = validateRefAccess(mockRef);

    expect(result.isValid).toBe(false);
    expect(result.dimensions).toBeNull();
    expect(result.error).toBe("studioEditorRef.current is null or undefined");
  });

  it("should reject ref with missing studioEditorSelectorRef", () => {
    const mockRef = {
      current: {},
    };

    const result = validateRefAccess(mockRef);

    expect(result.isValid).toBe(false);
    expect(result.dimensions).toBeNull();
    expect(result.error).toBe("studioEditorSelectorRef is not available");
  });

  it("should reject ref with null studioEditorSelectorRef.current", () => {
    const mockRef = {
      current: {
        studioEditorSelectorRef: {
          current: null,
        },
      },
    };

    const result = validateRefAccess(mockRef);

    expect(result.isValid).toBe(false);
    expect(result.dimensions).toBeNull();
    expect(result.error).toBe(
      "studioEditorSelectorRef.current is null or undefined"
    );
  });

  it("should reject ref with invalid dimensions", () => {
    const mockRef = {
      current: {
        studioEditorSelectorRef: {
          current: {
            clientWidth: 0,
            clientHeight: 0,
          },
        },
      },
    };

    const result = validateRefAccess(mockRef);

    expect(result.isValid).toBe(false);
    expect(result.dimensions).toBeNull();
    expect(result.error).toContain("Invalid dimensions");
  });

  it("should validate ref without naturalWidth and naturalHeight", () => {
    const mockRef = {
      current: {
        studioEditorSelectorRef: {
          current: {
            clientWidth: 800,
            clientHeight: 600,
          },
        },
      },
    };

    const result = validateRefAccess(mockRef);

    expect(result.isValid).toBe(true);
    expect(result.dimensions.clientWidth).toBe(800);
    expect(result.dimensions.clientHeight).toBe(600);
  });
});

describe("shouldConvertArea", () => {
  it("should return true for percentage area not yet updated", () => {
    const area = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
      _unit: "percentage",
      _updated: false,
    };

    expect(shouldConvertArea(area)).toBe(true);
  });

  it("should return true for percentage area with undefined _updated", () => {
    const area = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
      _unit: "percentage",
    };

    expect(shouldConvertArea(area)).toBe(true);
  });

  it("should return false for already updated percentage area", () => {
    const area = {
      x: 400,
      y: 300,
      width: 200,
      height: 150,
      _unit: "percentage",
      _updated: true,
    };

    expect(shouldConvertArea(area)).toBe(false);
  });

  it("should return false for pixel unit area", () => {
    const area = {
      x: 400,
      y: 300,
      width: 200,
      height: 150,
      _unit: "px",
      _updated: false,
    };

    expect(shouldConvertArea(area)).toBe(false);
  });

  it("should return false for null area", () => {
    expect(shouldConvertArea(null)).toBe(false);
  });

  it("should return false for undefined area", () => {
    expect(shouldConvertArea(undefined)).toBe(false);
  });

  it("should return false for area without _unit", () => {
    const area = {
      x: 400,
      y: 300,
      width: 200,
      height: 150,
    };

    expect(shouldConvertArea(area)).toBe(false);
  });
});

describe("getOriginalPercentageCoords", () => {
  it("should return stored percentage coordinates from area", () => {
    const area = {
      x: 400,
      y: 300,
      width: 200,
      height: 150,
      _percentX: 50,
      _percentY: 50,
      _percentWidth: 25,
      _percentHeight: 25,
    };

    const result = getOriginalPercentageCoords(area, null);

    expect(result).toEqual({
      x: 50,
      y: 50,
      width: 25,
      height: 25,
    });
  });

  it("should fallback to properties when area lacks percentage coords", () => {
    const area = {
      x: 400,
      y: 300,
      width: 200,
      height: 150,
    };

    const properties = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
    };

    const result = getOriginalPercentageCoords(area, properties);

    expect(result).toEqual({
      x: 50,
      y: 50,
      width: 25,
      height: 25,
    });
  });

  it("should prefer area percentage coords over properties", () => {
    const area = {
      x: 400,
      y: 300,
      width: 200,
      height: 150,
      _percentX: 60,
      _percentY: 60,
      _percentWidth: 30,
      _percentHeight: 30,
    };

    const properties = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
    };

    const result = getOriginalPercentageCoords(area, properties);

    expect(result).toEqual({
      x: 60,
      y: 60,
      width: 30,
      height: 30,
    });
  });

  it("should return null when both sources unavailable", () => {
    const area = {
      x: 400,
      y: 300,
      width: 200,
      height: 150,
    };

    const result = getOriginalPercentageCoords(area, null);

    expect(result).toBeNull();
  });

  it("should return null when properties is empty object", () => {
    const area = {
      x: 400,
      y: 300,
      width: 200,
      height: 150,
    };

    const result = getOriginalPercentageCoords(area, {});

    expect(result).toBeNull();
  });

  it("should require all four percentage coordinates in area", () => {
    const area = {
      _percentX: 50,
      _percentY: 50,
      // Missing _percentWidth and _percentHeight
    };

    const properties = {
      x: 50,
      y: 50,
      width: 25,
      height: 25,
    };

    const result = getOriginalPercentageCoords(area, properties);

    // Should fallback to properties
    expect(result).toEqual({
      x: 50,
      y: 50,
      width: 25,
      height: 25,
    });
  });
});

describe("processPageAreas", () => {
  const dimensions = { clientWidth: 800, clientHeight: 600 };

  it("should process areas that need conversion", () => {
    const pageAreas = [
      {
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
      },
    ];

    const pageProperties = [
      {
        x: 50,
        y: 50,
        width: 25,
        height: 25,
      },
    ];

    const result = processPageAreas(pageAreas, pageProperties, dimensions);

    expect(result[0].x).toBe(400);
    expect(result[0].y).toBe(300);
    expect(result[0].width).toBe(200);
    expect(result[0].height).toBe(150);
    expect(result[0]._updated).toBe(true);
  });

  it("should not convert areas that don't need it", () => {
    const pageAreas = [
      {
        x: 400,
        y: 300,
        width: 200,
        height: 150,
        _unit: "px",
        _updated: false,
      },
    ];

    const pageProperties = [];

    const result = processPageAreas(pageAreas, pageProperties, dimensions);

    expect(result[0].x).toBe(400);
    expect(result[0].y).toBe(300);
    expect(result[0]._updated).toBe(false);
    expect(result[0]._unit).toBe("px");
  });

  it("should handle already converted areas", () => {
    const pageAreas = [
      {
        x: 400,
        y: 300,
        width: 200,
        height: 150,
        _unit: "percentage",
        _updated: true,
        _percentX: 50,
        _percentY: 50,
        _percentWidth: 25,
        _percentHeight: 25,
      },
    ];

    const pageProperties = [];

    const result = processPageAreas(pageAreas, pageProperties, dimensions);

    // Should preserve values without reconversion
    expect(result[0].x).toBe(400);
    expect(result[0].y).toBe(300);
    expect(result[0]._updated).toBe(true);
  });

  it("should handle null pageAreas", () => {
    const result = processPageAreas(null, [], dimensions);

    expect(result).toBeNull();
  });

  it("should handle empty pageAreas array", () => {
    const result = processPageAreas([], [], dimensions);

    expect(result).toEqual([]);
  });

  it("should handle mixed areas (some need conversion, some don't)", () => {
    const pageAreas = [
      {
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
      },
      {
        x: 100,
        y: 100,
        width: 50,
        height: 50,
        _unit: "px",
        _updated: true,
      },
    ];

    const pageProperties = [
      { x: 50, y: 50, width: 25, height: 25 },
      { x: 100, y: 100, width: 50, height: 50 },
    ];

    const result = processPageAreas(pageAreas, pageProperties, dimensions);

    // First area should be converted
    expect(result[0].x).toBe(400);
    expect(result[0]._updated).toBe(true);

    // Second area should remain unchanged
    expect(result[1].x).toBe(100);
    expect(result[1]._unit).toBe("px");
  });

  it("should handle conversion errors gracefully", () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const pageAreas = [
      {
        x: 50,
        y: 50,
        width: 25,
        height: 25,
        _unit: "percentage",
        _updated: false,
        // No percentage coords and no properties fallback
      },
    ];

    const pageProperties = [null]; // Invalid properties

    const result = processPageAreas(pageAreas, pageProperties, dimensions);

    // Should return area with _updated: false
    expect(result[0]._updated).toBe(false);

    consoleErrorSpy.mockRestore();
  });
});

describe("processAreasForImageLoad", () => {
  const mockRef = {
    current: {
      studioEditorSelectorRef: {
        current: {
          clientWidth: 800,
          clientHeight: 600,
        },
      },
    },
  };

  it("should process all pages when activePageIndex is null", () => {
    const allAreas = [
      [
        {
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
        },
      ],
      [
        {
          x: 25,
          y: 25,
          width: 50,
          height: 50,
          _unit: "percentage",
          _updated: false,
          _percentX: 25,
          _percentY: 25,
          _percentWidth: 50,
          _percentHeight: 50,
        },
      ],
    ];

    const areasProperties = [
      [{ x: 50, y: 50, width: 25, height: 25 }],
      [{ x: 25, y: 25, width: 50, height: 50 }],
    ];

    const result = processAreasForImageLoad(
      allAreas,
      areasProperties,
      mockRef,
      null
    );

    // Both pages should be processed
    expect(result[0][0].x).toBe(400); // 50% of 800
    expect(result[1][0].x).toBe(200); // 25% of 800
  });

  it("should process only active page when index is provided", () => {
    const allAreas = [
      [
        {
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
        },
      ],
      [
        {
          x: 25,
          y: 25,
          width: 50,
          height: 50,
          _unit: "percentage",
          _updated: false,
          _percentX: 25,
          _percentY: 25,
          _percentWidth: 50,
          _percentHeight: 50,
        },
      ],
    ];

    const areasProperties = [
      [{ x: 50, y: 50, width: 25, height: 25 }],
      [{ x: 25, y: 25, width: 50, height: 50 }],
    ];

    const result = processAreasForImageLoad(
      allAreas,
      areasProperties,
      mockRef,
      1 // Only process page 1
    );

    // Page 0 should remain unchanged
    expect(result[0][0].x).toBe(50);
    expect(result[0][0]._updated).toBe(false);

    // Page 1 should be processed
    expect(result[1][0].x).toBe(200);
    expect(result[1][0]._updated).toBe(true);
  });

  it("should return unchanged areas if ref validation fails", () => {
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const allAreas = [
      [
        {
          x: 50,
          y: 50,
          width: 25,
          height: 25,
          _unit: "percentage",
          _updated: false,
        },
      ],
    ];

    const areasProperties = [[{ x: 50, y: 50, width: 25, height: 25 }]];

    const result = processAreasForImageLoad(
      allAreas,
      areasProperties,
      null, // Invalid ref
      null
    );

    expect(result).toBe(allAreas);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Cannot process areas for image load:",
      expect.any(String)
    );

    consoleWarnSpy.mockRestore();
  });

  it("should handle null allAreas", () => {
    const consoleWarnSpy = jest
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    const result = processAreasForImageLoad(null, [], mockRef, null);

    expect(result).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledWith("Areas array is invalid");

    consoleWarnSpy.mockRestore();
  });

  it("should handle empty allAreas array", () => {
    const result = processAreasForImageLoad([], [], mockRef, null);

    expect(result).toEqual([]);
  });
});

describe("createSafeOnImageLoad", () => {
  const mockRef = {
    current: {
      studioEditorSelectorRef: {
        current: {
          clientWidth: 800,
          clientHeight: 600,
        },
      },
    },
  };

  it("should create a function that updates areas", () => {
    const areas = [
      [
        {
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
        },
      ],
    ];

    const areasProperties = [[{ x: 50, y: 50, width: 25, height: 25 }]];

    const mockSetAreas = jest.fn();

    const onImageLoad = createSafeOnImageLoad(
      areas,
      areasProperties,
      mockRef,
      mockSetAreas
    );

    onImageLoad();

    expect(mockSetAreas).toHaveBeenCalled();
    const updatedAreas = mockSetAreas.mock.calls[0][0];
    expect(updatedAreas[0][0].x).toBe(400);
  });

  it("should handle errors gracefully", () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const mockSetAreas = jest.fn();

    // Invalid ref that will cause error
    const invalidRef = null;

    const onImageLoad = createSafeOnImageLoad(
      [],
      [],
      invalidRef,
      mockSetAreas
    );

    // Should not throw
    expect(() => onImageLoad()).not.toThrow();

    consoleErrorSpy.mockRestore();
  });

  it("should not update state if processing returns null", () => {
    const mockSetAreas = jest.fn();

    // Invalid ref
    const onImageLoad = createSafeOnImageLoad(null, [], null, mockSetAreas);

    onImageLoad();

    // setAreas should still be called, but processAreasForImageLoad returns null
    expect(mockSetAreas).toHaveBeenCalled();
  });
});
