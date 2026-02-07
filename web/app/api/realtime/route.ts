import { subscribe } from "@/lib/realtimeBus";

export const runtime = "nodejs";

function parseTopics(value: string | null) {
  if (!value) return new Set<string>();
  return new Set(
    value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const topics = parseTopics(url.searchParams.get("topics"));

  const encoder = new TextEncoder();

  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
      c.enqueue(
        encoder.encode(
          [
            ": connected\n",
            "retry: 1000\n",
            "event: connected\n",
            `data: ${JSON.stringify({ ok: true, topics: Array.from(topics) })}\n\n`,
          ].join(""),
        ),
      );
    },
    cancel() {
      controller = null;
    },
  });

  const unsubscribe = subscribe({
    topics,
    send(evt) {
      if (!controller) return;
      controller.enqueue(
        encoder.encode(
          [
            `event: ${evt.topic}\n`,
            `data: ${JSON.stringify(evt)}\n\n`,
          ].join(""),
        ),
      );
    },
    close() {
      try {
        controller?.close();
      } catch {
        // ignore
      }
    },
  });

  const keepAlive = setInterval(() => {
    try {
      controller?.enqueue(encoder.encode(": keep-alive\n\n"));
    } catch {
      // ignore
    }
  }, 15000);

  req.signal.addEventListener("abort", () => {
    clearInterval(keepAlive);
    unsubscribe();
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
