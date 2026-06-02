export default async function handler(req, res) {
  // Optional: health check
  if (req.method === "GET") {
    return res.status(200).send("OK - lark callback endpoint");
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body ?? {};

  // 1) HANDLE URL VERIFICATION (challenge)
  // Lark akan kirim challenge saat kamu save Request URL di console
  if (body.challenge) {
    console.log("LARK_CHALLENGE_RECEIVED", body.challenge);
    return res.status(200).json({ challenge: body.challenge });
  }

  // 2) (Nanti) HANDLE CARD CALLBACK / EVENTS
  console.log("LARK_CALLBACK_BODY", JSON.stringify(body));
  return res.status(200).json({ ok: true });
}
