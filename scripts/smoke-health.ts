import http from "http";

const url = process.env.SMOKE_URL || "http://localhost:3000/health";

function get(urlStr: string): Promise<{ status: number; body: string }> {
  return new Promise((resolve, reject) => {
    const req = http.get(urlStr, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve({ status: res.statusCode || 0, body: data }));
    });
    req.on("error", reject);
    req.end();
  });
}

(async () => {
  try {
    const { status, body } = await get(url);
    if (status !== 200) {
      console.error(`❌ Health check failed: ${status}`);
      console.error(body);
      process.exit(1);
    }
    console.log("✅ Health OK");
    process.exit(0);
  } catch (e) {
    console.error("❌ Health check error:", e);
    process.exit(1);
  }
})();
