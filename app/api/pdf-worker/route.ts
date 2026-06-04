import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const workerPath = path.resolve(
      process.cwd(),
      "node_modules/pdfjs-dist/build/pdf.worker.min.js",
    );
    const content = await fs.readFile(workerPath, "utf8");

    return new Response(content, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Failed to read pdf.worker from node_modules:", err);
    return new Response("// worker unavailable", {
      status: 500,
      headers: { "Content-Type": "application/javascript" },
    });
  }
}
