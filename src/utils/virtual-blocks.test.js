/**
 * Test file for virtual blocks migration and backward compatibility
 * Run this file to verify that legacy data migrates correctly
 */

import {
  migrateLegacyVirtualBlocks,
  parseVirtualBlocksFromPages,
  parseVirtualBlocksFromActivePage,
  formatVirtualBlocksForSubmission,
  VIRTUAL_BLOCKS,
} from "./virtual-blocks";

// Sample legacy virtual blocks (old format)
const legacyVirtualBlocks = {
  TL: {
    label: "",
    id: "",
    status: "",
    contentType: "",
  },
  TM: {
    label: "Notes 📝",
    id: "<p>This is a note content</p>",
    status: "updated",
    contentType: "text",
  },
  TR: {
    label: "Recall",
    id: "507f1f77bcf86cd799439011",
    status: "new",
    contentType: "object",
  },
  L1: {
    label: "Summary 📋",
    id: "https://example.com",
    status: "updated",
    contentType: "link",
  },
  // ... other locations empty
  L2: { label: "", id: "", status: "", contentType: "" },
  L3: { label: "", id: "", status: "", contentType: "" },
  L4: { label: "", id: "", status: "", contentType: "" },
  L5: { label: "", id: "", status: "", contentType: "" },
  L6: { label: "", id: "", status: "", contentType: "" },
  R1: { label: "", id: "", status: "", contentType: "" },
  R2: { label: "", id: "", status: "", contentType: "" },
  R3: { label: "", id: "", status: "", contentType: "" },
  R4: { label: "", id: "", status: "", contentType: "" },
  R5: { label: "", id: "", status: "", contentType: "" },
  R6: { label: "", id: "", status: "", contentType: "" },
  BL: { label: "", id: "", status: "", contentType: "" },
  BM: { label: "", id: "", status: "", contentType: "" },
  BR: { label: "", id: "", status: "", contentType: "" },
};

// Sample new virtual blocks (new format)
const newVirtualBlocks = {
  TL: { contents: [] },
  TM: {
    contents: [
      {
        type: "text",
        iconLocation: "TM",
        contentType: "Notes 📝",
        contentValue: "<p>First note</p>",
      },
      {
        type: "text",
        iconLocation: "TM",
        contentType: "Notes 📝",
        contentValue: "<p>Second note</p>",
      },
    ],
  },
  TR: {
    contents: [
      {
        type: "object",
        iconLocation: "TR",
        contentType: "Recall",
        contentValue: "507f1f77bcf86cd799439011",
      },
    ],
  },
  L1: { contents: [] },
  L2: { contents: [] },
  L3: { contents: [] },
  L4: { contents: [] },
  L5: { contents: [] },
  L6: { contents: [] },
  R1: { contents: [] },
  R2: { contents: [] },
  R3: { contents: [] },
  R4: { contents: [] },
  R5: { contents: [] },
  R6: { contents: [] },
  BL: { contents: [] },
  BM: { contents: [] },
  BR: { contents: [] },
};

// Sample legacy page data (old format)
const legacyPageData = {
  _id: "66e45a62435fef004a665159",
  v_blocks: [
    {
      iconLocation: "TM",
      contentType: "Notes 📝",
      contentValue: "<p>Legacy note content</p>",
    },
    {
      iconLocation: "TR",
      contentType: "Recall",
      contentValue: "507f1f77bcf86cd799439011",
    },
  ],
};

// Sample new page data (new format)
const newPageData = {
  _id: "66e45a6f435fef004a66515d",
  v_blocks: [
    {
      pageId: "66e45a6f435fef004a66515d",
      contents: [
        {
          type: "text",
          iconLocation: "TM",
          contentType: "Notes 📝",
          contentValue: "<p>First note</p>",
        },
        {
          type: "link",
          iconLocation: "TM",
          contentType: "Notes 📝",
          contentValue: "https://example.com",
        },
        {
          type: "object",
          iconLocation: "TR",
          contentType: "Recall",
          contentValue: "66e45a6f435fef004a66515d",
        },
      ],
    },
  ],
};

/**
 * Test 1: Migrate legacy virtual blocks to new format
 */
export const testMigrateLegacyVirtualBlocks = () => {
  console.log("=== Test 1: Migrate Legacy Virtual Blocks ===");

  const migrated = migrateLegacyVirtualBlocks(legacyVirtualBlocks);

  console.log("Input (Legacy):", JSON.stringify(legacyVirtualBlocks.TM, null, 2));
  console.log("Output (Migrated):", JSON.stringify(migrated.TM, null, 2));

  // Assertions
  const assertions = {
    "TM has contents array": Array.isArray(migrated.TM.contents),
    "TM has 1 content item": migrated.TM.contents.length === 1,
    "TM content has correct type": migrated.TM.contents[0].type === "text",
    "TM content has correct label": migrated.TM.contents[0].contentType === "Notes 📝",
    "TR has contents array": Array.isArray(migrated.TR.contents),
    "TR content type is object": migrated.TR.contents[0].type === "object",
    "Empty locations have empty arrays": migrated.TL.contents.length === 0,
  };

  console.log("\nAssertions:");
  Object.entries(assertions).forEach(([test, result]) => {
    console.log(`  ${result ? "✅" : "❌"} ${test}`);
  });

  return Object.values(assertions).every((v) => v);
};

/**
 * Test 2: Parse legacy page data
 */
export const testParseLegacyPage = () => {
  console.log("\n=== Test 2: Parse Legacy Page Data ===");

  const parsed = parseVirtualBlocksFromActivePage(legacyPageData);

  console.log("Input (Legacy Page):", JSON.stringify(legacyPageData.v_blocks, null, 2));
  console.log("Output (Parsed):", JSON.stringify(parsed.TM, null, 2));

  // Assertions
  const assertions = {
    "Parsed is object": typeof parsed === "object",
    "TM has contents array": Array.isArray(parsed.TM.contents),
    "TM has 1 content item": parsed.TM.contents.length === 1,
    "TM content has correct type": parsed.TM.contents[0].type === "text",
    "TR has contents array": Array.isArray(parsed.TR.contents),
    "TR has 1 content item": parsed.TR.contents.length === 1,
    "TR content has correct type": parsed.TR.contents[0].type === "object",
  };

  console.log("\nAssertions:");
  Object.entries(assertions).forEach(([test, result]) => {
    console.log(`  ${result ? "✅" : "❌"} ${test}`);
  });

  return Object.values(assertions).every((v) => v);
};

/**
 * Test 3: Parse new page data
 */
export const testParseNewPage = () => {
  console.log("\n=== Test 3: Parse New Page Data ===");

  const parsed = parseVirtualBlocksFromActivePage(newPageData);

  console.log("Input (New Page):", JSON.stringify(newPageData.v_blocks[0].contents, null, 2));
  console.log("Output (Parsed):", JSON.stringify(parsed.TM, null, 2));

  // Assertions
  const assertions = {
    "Parsed is object": typeof parsed === "object",
    "TM has contents array": Array.isArray(parsed.TM.contents),
    "TM has 2 content items": parsed.TM.contents.length === 2,
    "TM first item is text": parsed.TM.contents[0].type === "text",
    "TM second item is link": parsed.TM.contents[1].type === "link",
    "TR has 1 content item": parsed.TR.contents.length === 1,
    "TR content type is object": parsed.TR.contents[0].type === "object",
  };

  console.log("\nAssertions:");
  Object.entries(assertions).forEach(([test, result]) => {
    console.log(`  ${result ? "✅" : "❌"} ${test}`);
  });

  return Object.values(assertions).every((v) => v);
};

/**
 * Test 4: Parse multiple pages with mixed formats
 */
export const testParseMultiplePages = () => {
  console.log("\n=== Test 4: Parse Multiple Pages (Mixed Formats) ===");

  const pages = [legacyPageData, newPageData];
  const parsed = parseVirtualBlocksFromPages(pages);

  console.log("Input: 2 pages (1 legacy, 1 new)");
  console.log("Output length:", parsed.length);
  console.log("Page 1 TM:", JSON.stringify(parsed[0].TM, null, 2));
  console.log("Page 2 TM:", JSON.stringify(parsed[1].TM, null, 2));

  // Assertions
  const assertions = {
    "Parsed array has 2 items": parsed.length === 2,
    "Page 1 TM has contents": Array.isArray(parsed[0].TM.contents),
    "Page 1 TM has 1 item": parsed[0].TM.contents.length === 1,
    "Page 2 TM has contents": Array.isArray(parsed[1].TM.contents),
    "Page 2 TM has 2 items": parsed[1].TM.contents.length === 2,
  };

  console.log("\nAssertions:");
  Object.entries(assertions).forEach(([test, result]) => {
    console.log(`  ${result ? "✅" : "❌"} ${test}`);
  });

  return Object.values(assertions).every((v) => v);
};

/**
 * Test 5: Format for submission
 */
export const testFormatForSubmission = () => {
  console.log("\n=== Test 5: Format for Submission ===");

  const pageId = "66e45a6f435fef004a66515d";
  const formatted = formatVirtualBlocksForSubmission(newVirtualBlocks, pageId);

  console.log("Input virtualBlocks TM:", JSON.stringify(newVirtualBlocks.TM, null, 2));
  console.log("Output formatted:", JSON.stringify(formatted, null, 2));

  // Assertions
  const assertions = {
    "Formatted is object": typeof formatted === "object",
    "Has pageId": formatted.pageId === pageId,
    "Has contents array": Array.isArray(formatted.contents),
    "Contents has 3 items": formatted.contents.length === 3,
    "All items have type": formatted.contents.every((item) => item.type),
    "All items have iconLocation": formatted.contents.every((item) => item.iconLocation),
    "All items have contentType": formatted.contents.every((item) => item.contentType),
    "All items have contentValue": formatted.contents.every((item) => item.contentValue),
  };

  console.log("\nAssertions:");
  Object.entries(assertions).forEach(([test, result]) => {
    console.log(`  ${result ? "✅" : "❌"} ${test}`);
  });

  return Object.values(assertions).every((v) => v);
};

/**
 * Test 6: Format empty virtual blocks
 */
export const testFormatEmptyBlocks = () => {
  console.log("\n=== Test 6: Format Empty Virtual Blocks ===");

  const emptyBlocks = { ...VIRTUAL_BLOCKS };
  const pageId = "66e45a6f435fef004a66515d";
  const formatted = formatVirtualBlocksForSubmission(emptyBlocks, pageId);

  console.log("Input: Empty virtual blocks");
  console.log("Output formatted:", formatted);

  // Assertions
  const assertions = {
    "Returns null for empty blocks": formatted === null,
  };

  console.log("\nAssertions:");
  Object.entries(assertions).forEach(([test, result]) => {
    console.log(`  ${result ? "✅" : "❌"} ${test}`);
  });

  return Object.values(assertions).every((v) => v);
};

/**
 * Run all tests
 */
export const runAllTests = () => {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  Virtual Blocks Migration & Compatibility Tests           ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const results = {
    test1: testMigrateLegacyVirtualBlocks(),
    test2: testParseLegacyPage(),
    test3: testParseNewPage(),
    test4: testParseMultiplePages(),
    test5: testFormatForSubmission(),
    test6: testFormatEmptyBlocks(),
  };

  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║  Test Results Summary                                      ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  Object.entries(results).forEach(([test, passed]) => {
    console.log(`  ${passed ? "✅" : "❌"} ${test}: ${passed ? "PASSED" : "FAILED"}`);
  });

  const allPassed = Object.values(results).every((v) => v);
  console.log("\n" + "=".repeat(62));
  console.log(
    allPassed
      ? "✅ All tests PASSED! Migration is working correctly."
      : "❌ Some tests FAILED. Please review the output above."
  );
  console.log("=".repeat(62) + "\n");

  return allPassed;
};

// Export for use in browser console or test runner
if (typeof window !== "undefined") {
  window.virtualBlocksTests = {
    runAllTests,
    testMigrateLegacyVirtualBlocks,
    testParseLegacyPage,
    testParseNewPage,
    testParseMultiplePages,
    testFormatForSubmission,
    testFormatEmptyBlocks,
  };

  console.log(
    "💡 Virtual Blocks tests loaded! Run 'virtualBlocksTests.runAllTests()' in the console to test migration."
  );
}
