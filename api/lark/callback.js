export default async function handler(req, res) {
  // Health check manual dari browser
  if (req.method === "GET") {
    return res.status(200).send("OK - lark callback endpoint");
  }

  // Lark akan kirim POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // IMPORTANT: balas cepat (<3 detik) agar card tidak error
  try {
    const body = req.body ?? {};

    // sementara: log supaya kita lihat struktur payload dari Lark
    console.log("LARK_CALLBACK_HEADERS", req.headers);
    console.log("LARK_CALLBACK_BODY", JSON.stringify(body));

    // Untuk tahap awal, cukup ACK
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error("LARK_CALLBACK_ERROR", e);
    // Tetap balas 200 agar user tidak lihat error di Lark
    return res.status(200).json({ ok: false });
  }
}
