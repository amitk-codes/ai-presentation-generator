import express, { type Request, type Response } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const PORT = Number(process.env.PORT || 7000);
const N8N_WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL || "http://n8n:5678/webhook/generate";

/**
 * Build an MCP server exposing a single tool that triggers the SAME n8n
 * workflow the website uses. The MCP server holds no generation logic itself.
 */
function createServer(): McpServer {
  const server = new McpServer(
    { name: "presentation-generator", version: "1.0.0" },
    {
      instructions:
        "Use generate_presentation to create a downloadable slide deck (PDF + PowerPoint) from a topic or instructions. Return the download links to the user.",
    }
  );

  server.registerTool(
    "generate_presentation",
    {
      title: "Generate Presentation",
      description:
        "Generate a downloadable slide deck (PDF + editable PowerPoint) from a topic or instructions. Returns the deck title and download links.",
      inputSchema: {
        content: z
          .string()
          .describe("The topic or full instructions for the presentation."),
        n_slides: z
          .number()
          .int()
          .min(3)
          .max(20)
          .optional()
          .describe("Approximate number of slides (default 6)."),
        tone: z
          .string()
          .optional()
          .describe("Tone, e.g. professional, casual, academic, persuasive."),
        audience: z
          .string()
          .optional()
          .describe("Intended audience, e.g. executives, students."),
        instructions: z
          .string()
          .optional()
          .describe("Any extra instructions for the deck."),
      },
    },
    async ({ content, n_slides, tone, audience, instructions }) => {
      const res = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, n_slides, tone, audience, instructions }),
      });

      if (!res.ok) {
        const detail = await res.text();
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Generation failed (HTTP ${res.status}): ${detail.slice(0, 300)}`,
            },
          ],
        };
      }

      const data: any = await res.json();
      const pdf = data?.files?.pdf;
      const pptx = data?.files?.pptx;
      if (!pdf) {
        return {
          isError: true,
          content: [{ type: "text", text: "Generation returned no downloadable file." }],
        };
      }

      const text = [
        `Presentation ready: "${data.title || content}"`,
        "",
        `- PDF: ${pdf}`,
        pptx ? `- PowerPoint (PPTX): ${pptx}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      return { content: [{ type: "text", text }] };
    }
  );

  return server;
}

const app = express();
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req: Request, res: Response) =>
  res.type("text/plain").send("Presentation MCP server is running. MCP endpoint: POST /mcp")
);
app.get("/health", (_req: Request, res: Response) => res.json({ status: "ok" }));

// Streamable HTTP MCP endpoint (stateless: a fresh server+transport per request).
app.post("/mcp", async (req: Request, res: Response) => {
  try {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    res.on("close", () => {
      transport.close();
      server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("[mcp] error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

// Stateless mode doesn't use GET (SSE) or DELETE (session teardown).
const methodNotAllowed = (_req: Request, res: Response) =>
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed." },
    id: null,
  });
app.get("/mcp", methodNotAllowed);
app.delete("/mcp", methodNotAllowed);

app.listen(PORT, () => {
  console.log(`[mcp-server] listening on :${PORT} (POST /mcp) -> ${N8N_WEBHOOK_URL}`);
});
