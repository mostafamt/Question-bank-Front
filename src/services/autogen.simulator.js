/**
 * AutoGen simulator — mirrors the real API's two-step polling lifecycle.
 * Replace simulateSubmitAutoGen and simulatePollAutoGen with real axios calls
 * when the backend is ready; everything else stays the same.
 */

const MOCK_JOB_STORE = {};

const MOCK_OBJECT_IDS = [
  "507f1f77bcf86cd799439011",
  "507f1f77bcf86cd799439012",
  "507f1f77bcf86cd799439013",
];

/**
 * Submit a generation request.
 * @param {{ image: string }} params - base64 data URL of the cropped block image
 * @returns {Promise<{ jobId: string }>}
 */
export async function simulateSubmitAutoGen({ image }) {
  // image param is accepted to match the real API signature but not used here
  const jobId = "sim_" + Math.random().toString(36).slice(2, 10);
  MOCK_JOB_STORE[jobId] = {
    resolveAfter: Date.now() + 4000 + Math.random() * 6000, // 4–10 s
    willFail: Math.random() < 0.1,
  };
  return { jobId };
}

/**
 * Poll the status of a generation job.
 * @param {string} jobId
 * @returns {Promise<{ jobId: string, status: string } | { objectId: string }>}
 *   Completed response contains only `objectId`.
 *   Processing response contains `{ jobId, status: "processing" }`.
 *   Failed response contains `{ jobId, status: "failed", errorMessage: string }`.
 */
export async function simulatePollAutoGen(jobId) {
  const job = MOCK_JOB_STORE[jobId];

  if (!job) {
    return { jobId, status: "failed", errorMessage: "Unknown job" };
  }

  if (Date.now() < job.resolveAfter) {
    return { jobId, status: "processing" };
  }

  if (job.willFail) {
    return { jobId, status: "failed", errorMessage: "Simulated generation error" };
  }

  // Completed — return only objectId (matches real API contract)
  const objectId = MOCK_OBJECT_IDS[Math.floor(Math.random() * MOCK_OBJECT_IDS.length)];
  return { objectId };
}
