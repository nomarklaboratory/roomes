/** Optional offline asset experiment; never runs from a browser or during deployment. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
const key = process.env.MESHY_API_KEY;
const image = process.env.MESHY_IMAGE_URL;
if (!key) {
  console.log(
    "No Meshy credentials configured. Use the approved parametric asset fallback; 0 credits spent.",
  );
  process.exit(0);
}
if (!process.argv.includes("--submit")) {
  console.log(
    "Dry run. A textured Meshy T2 request uses 15 existing credits. See docs/assets.md before submitting.",
  );
  process.exit(0);
}
if (!image || !/^https:\/\//.test(image))
  throw new Error(
    "MESHY_IMAGE_URL must be a licensed, public HTTPS product image.",
  );
// Conservative reservation before POST prevents a crash/retry from silently creating duplicate paid jobs.
const folder = ".asset-pilot",
  path = `${folder}/ledger.json`;
await mkdir(folder, { recursive: true });
let ledger;
try {
  ledger = JSON.parse(await readFile(path, "utf8"));
} catch {
  ledger = { startedAt: Date.now(), reservedCredits: 0, attempts: [] };
}
const deadline = ledger.startedAt + 45 * 60 * 1000;
if (Date.now() >= deadline)
  throw new Error(
    "The 45-minute pilot window has ended. Keep the fallback assets.",
  );
const persist = () => writeFile(path, JSON.stringify(ledger, null, 2) + "\n");
const request = async (route, options = {}) => {
  const response = await fetch(
    `https://api.meshy.ai/openapi/v1/image-to-3d${route}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(30000),
    },
  );
  if (!response.ok)
    throw new Error(
      `Meshy returned HTTP ${response.status}. Paid POST requests are never automatically retried.`,
    );
  return response.json();
};
let attempt = ledger.attempts.find((a) => a.taskId && !a.finished);
if (!attempt) {
  if (ledger.attempts.length >= 2 || ledger.reservedCredits + 15 > 30)
    throw new Error(
      "Pilot limit reached: maximum 2 textured requests / 30 existing credits.",
    );
  attempt = { reservedAt: Date.now(), finished: false };
  ledger.reservedCredits += 15;
  ledger.attempts.push(attempt);
  await persist();
  const task = await request("", {
    method: "POST",
    body: JSON.stringify({
      image_url: image,
      ai_model: "meshy-t2",
      model_type: "smart-topology",
      target_polycount: 4000,
      should_texture: true,
    }),
  });
  if (typeof task.result !== "string")
    throw new Error(
      "Missing task ID. Inspect the provider dashboard; do not retry the paid POST.",
    );
  attempt.taskId = task.result;
  await persist();
}
while (Date.now() < deadline) {
  const task = await request(`/${attempt.taskId}`);
  console.log(`Pilot task: ${task.status} (${task.progress ?? 0}%).`);
  if (task.status === "SUCCEEDED") {
    const url = task.model_urls?.glb;
    if (!url || !url.startsWith("https://"))
      throw new Error("No valid GLB result URL.");
    const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!response.ok)
      throw new Error(
        "GLB download failed; resume this task before its URL expires.",
      );
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 25 * 1024 * 1024)
      throw new Error("Candidate exceeds the 25 MB intake limit.");
    await writeFile(
      `${folder}/candidate-${ledger.attempts.indexOf(attempt) + 1}.glb`,
      Buffer.from(bytes),
    );
    attempt.finished = true;
    attempt.review = "pending";
    await persist();
    console.log(
      "Candidate saved locally for fidelity, dimension, topology, and mobile-budget review. Nothing was published.",
    );
    process.exit(0);
  }
  if (task.status === "FAILED" || task.status === "CANCELED") {
    attempt.finished = true;
    attempt.review = "rejected";
    await persist();
    throw new Error("Generation did not succeed. Use the fallback.");
  }
  await new Promise((resolve) => setTimeout(resolve, 5000));
}
throw new Error(
  "Pilot window ended. Task ID retained for inspection; no new request created.",
);
