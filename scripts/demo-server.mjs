import http from "node:http";
import { createReadStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { validateRenderInput } from "./demo-validation.mjs";
import { browserExecutable } from "./browser-path.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.SHOTSWIFT_DEMO_PORT || 4173);
const output = path.join(root, "deliverables", "renders");
await mkdir(output, { recursive: true });
const jobs = new Map();
let busy = false;
let bundlePromise;
// Resolve package entry points from the isolated Remotion package, without relying on global installs.
async function remotionModules() {
  const { createRequire } = await import("node:module");
  const require = createRequire(
    path.join(root, "apps/demo-video/package.json"),
  );
  const renderer = await import(
    pathToFileURL(require.resolve("@remotion/renderer")).href
  );
  const bundler = await import(
    pathToFileURL(require.resolve("@remotion/bundler")).href
  );
  return { renderer, bundler };
}
async function render(job, input) {
  try {
    const { renderer, bundler } = await remotionModules();
    if (!bundlePromise)
      bundlePromise = bundler
        .bundle({
          entryPoint: path.join(root, "apps/demo-video/src/index.ts"),
          publicDir: path.join(root, "apps/web/public"),
          outDir: path.join(root, "apps/demo-video/.bundle"),
          onProgress: (p) => {
            job.progress = Math.min(0.12, (p / 100) * 0.12);
          },
        })
        .catch((e) => {
          bundlePromise = undefined;
          throw e;
        });
    const serveUrl = await bundlePromise;
    // Every image is a local, allowlisted public asset, independent of browser-provided URLs.
    const inputProps = {
      ...input,
      imageSources: Object.fromEntries(
        ["morning", "product", "pour", "scene"].map((id) => [
          id,
          `http://127.0.0.1:${port}/demo/${id}.png`,
        ]),
      ),
    };
    const composition = await renderer.selectComposition({
      serveUrl,
      id: "CoffeeAd",
      inputProps,
      browserExecutable,
    });
    await renderer.renderMedia({
      serveUrl,
      composition,
      inputProps,
      browserExecutable,
      codec: "h264",
      outputLocation: path.join(output, `${job.id}.mp4`),
      concurrency: 3,
      overwrite: true,
      onProgress: ({ progress }) => {
        job.progress = 0.12 + progress * 0.88;
      },
    });
    job.state = "complete";
    job.progress = 1;
    job.url = `/demo-api/files/${job.id}.mp4`;
  } catch (e) {
    job.state = "error";
    job.error = `合成失败：${String(e.message || e).slice(0, 280)}`;
    console.error(e);
  } finally {
    busy = false;
  }
}
const json = (res, status, data) => {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
};
async function serveFile(req, res, file, download = false) {
  const info = await stat(file);
  if (!info.isFile()) throw Error("not file");
  const ext = path.extname(file);
  const mime =
    {
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".mp4": "video/mp4",
      ".json": "application/json; charset=utf-8",
    }[ext] || "application/octet-stream";
  const headers = {
    "Content-Type": mime,
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
  };
  if (download)
    headers["Content-Disposition"] =
      'attachment; filename="shotswift-coffee.mp4"';
  if (req.headers.range) {
    const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
    if (!range) {
      res.writeHead(416, { "Content-Range": `bytes */${info.size}` });
      res.end();
      return;
    }
    const start = Number(range[1]);
    const end = range[2]
      ? Math.min(Number(range[2]), info.size - 1)
      : info.size - 1;
    if (start > end || start >= info.size) {
      res.writeHead(416, { "Content-Range": `bytes */${info.size}` });
      res.end();
      return;
    }
    res.writeHead(206, {
      ...headers,
      "Content-Range": `bytes ${start}-${end}/${info.size}`,
      "Content-Length": end - start + 1,
    });
    createReadStream(file, { start, end }).pipe(res);
    return;
  }
  res.writeHead(200, { ...headers, "Content-Length": info.size });
  if (req.method === "HEAD") res.end();
  else createReadStream(file).pipe(res);
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const route = url.pathname;
    if (route === "/demo-api/health")
      return json(res, 200, { ok: true, service: "shotswift-demo", busy });
    if (route === "/demo-api/render" && req.method === "POST") {
      if (
        req.headers.origin &&
        !new Set([
          `http://127.0.0.1:${port}`,
          `http://localhost:${port}`,
          "http://127.0.0.1:5173",
          "http://localhost:5173",
        ]).has(req.headers.origin)
      )
        return json(res, 403, { error: "仅接受本机演示页面请求。" });
      if (!req.headers["content-type"]?.startsWith("application/json"))
        return json(res, 415, { error: "请使用 JSON 项目数据。" });
      if (busy)
        return json(res, 409, {
          error: "已有一个视频正在合成，请完成后再试。",
        });
      let body = "";
      for await (const chunk of req) {
        body += chunk;
        if (Buffer.byteLength(body) > 40000)
          return json(res, 413, { error: "项目数据过大。" });
      }
      let input;
      try {
        input = validateRenderInput(JSON.parse(body));
      } catch (e) {
        return json(res, 400, { error: e.message });
      }
      const job = { id: randomUUID(), state: "rendering", progress: 0 };
      if (jobs.size >= 100) {
        const first = [...jobs.values()].find((j) => j.state !== "rendering");
        if (first) jobs.delete(first.id);
      }
      jobs.set(job.id, job);
      busy = true;
      json(res, 202, job);
      void render(job, input);
      return;
    }
    if (route.startsWith("/demo-api/jobs/")) {
      const job = jobs.get(route.split("/").pop());
      return json(
        res,
        job ? 200 : 404,
        job || { error: "任务不存在，服务可能已重启。请重新导出。" },
      );
    }
    const fileMatch = /^\/demo-api\/files\/([a-f0-9-]{36})\.mp4$/.exec(route);
    if (fileMatch)
      return await serveFile(
        req,
        res,
        path.join(output, `${fileMatch[1]}.mp4`),
        true,
      );
    if (!["GET", "HEAD"].includes(req.method))
      return json(res, 405, { error: "不支持的请求方式。" });
    // Keep the existing backend reachable when it is separately running.
    if (route.startsWith("/api/"))
      return json(res, 503, {
        error:
          "原版 API 未由演示服务托管。请按原项目手册启动 API 与 Vite 开发服务。",
      });
    const base = route.startsWith("/demo/")
      ? path.join(root, "apps/web/public")
      : path.join(root, "apps/web/dist");
    const target = path.resolve(base, `.${decodeURIComponent(route)}`);
    if (!target.startsWith(base + path.sep) && target !== base)
      return json(res, 403, { error: "路径不可访问。" });
    try {
      return await serveFile(
        req,
        res,
        target === base ? path.join(base, "index.html") : target,
      );
    } catch {
      if (!path.extname(route) && !route.startsWith("/demo/"))
        return await serveFile(
          req,
          res,
          path.join(root, "apps/web/dist/index.html"),
        );
      return json(res, 404, { error: "文件不存在。" });
    }
  } catch (e) {
    if (!res.headersSent)
      json(res, 500, { error: "本地服务处理失败，请检查启动窗口。" });
    else res.end();
    console.error(e.message);
  }
});
server.on("error", (e) => {
  console.error(
    e.code === "EADDRINUSE"
      ? `端口 ${port} 已被占用。若演示已运行，请打开 http://127.0.0.1:${port}`
      : e,
  );
  process.exit(1);
});
server.listen(port, "127.0.0.1", () =>
  console.log(
    `ShotSwift demo: http://127.0.0.1:${port}\nPress Ctrl+C to stop. Renders are saved in deliverables/renders.`,
  ),
);
