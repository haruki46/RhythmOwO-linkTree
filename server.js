import { join } from "node:path"; //

Bun.serve({
  port: 8000,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;
    //index directory
    if (pathname === "/" || pathname.endsWith("/")) {
      pathname = join(pathname, "index.html");
    }
    const file = Bun.file(`.${pathname}`);
    //not exists is error 404
    if (await file.exists()) {
      return new Response(file);
    }

    return new Response("404 Not Found", { status: 404 });
  },
});

console.log("Serving HTTP on http://localhost:8000/");
