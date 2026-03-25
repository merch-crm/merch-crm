import { 
  initUpload, 
  uploadChunk, 
  completeUpload,
  cleanupTempFile
} from "../lib/upload-stream";
import { readFileSync, writeFileSync, unlinkSync } from "fs";

async function test() {
  console.log("Starting Upload Logic Test...");

  const fileName = "test-file.txt";
  const content = "Hello World! This is a test file for chunked upload reassembly logic.";
  const fileSize = Buffer.byteLength(content);
  const mimeType = "text/plain";

  // 1. Init
  const { uploadId, chunkSize } = await initUpload({ fileName, fileSize, mimeType });
  console.log("Upload Initialized:", uploadId);

  // 2. Upload Chunks (Split into 3 chunks for testing)
  const buffer = Buffer.from(content);
  const part1 = buffer.slice(0, 10);
  const part2 = buffer.slice(10, 20);
  const part3 = buffer.slice(20);

  await uploadChunk({ uploadId, chunkIndex: 0, data: part1 });
  console.log("Chunk 0 uploaded");
  await uploadChunk({ uploadId, chunkIndex: 1, data: part2 });
  console.log("Chunk 1 uploaded");
  await uploadChunk({ uploadId, chunkIndex: 2, data: part3 });
  console.log("Chunk 2 uploaded");

  // 3. Complete
  const result = await completeUpload(uploadId);
  console.log("Upload Completed:", result.tempPath);

  // 4. Verify Content
  const reassembledContent = readFileSync(result.tempPath, "utf-8");
  console.log("Reassembled Content Matches:", reassembledContent === content);

  if (reassembledContent !== content) {
    throw new Error("Content mismatch after reassembly");
  }

  // Cleanup
  await cleanupTempFile(result.tempPath);
  console.log("Upload Logic Test Passed!");
}

test().catch(err => {
  console.error("Test Failed:", err);
  process.exit(1);
});
