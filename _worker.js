export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const target = url.searchParams.get("url");

    if (target) {
      const resp = await fetch(target, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });
      const newHeaders = new Headers(resp.headers);
      newHeaders.delete("content-security-policy");
      newHeaders.delete("x-frame-options");
      return new Response(resp.body, {
        status: resp.status,
        headers: newHeaders
      });
    }

    // No url param — serve the static site normally
    return env.ASSETS.fetch(request);
  }
}
