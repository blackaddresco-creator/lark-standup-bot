import crypto from "crypto";

function decryptEncrypt(encryptBase64, encryptKey) {
  // Lark: base64(iv + encrypted_event)
  const buf = Buffer.from(encryptBase64, "base64");
  const iv = buf.subarray(0, 16);
  const encrypted = buf.subarray(16);

  // key = SHA256(encryptKey)
  const key = crypto.createHash("sha256").update(encryptKey, "utf8").digest();

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  decipher.setAutoPadding(true);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).send("OK - lark callback endpoint");
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body ?? {};

  // A) URL verification: plain challenge
  if (body.challenge) {
    return res.status(200).json({ challenge: body.challenge });
  }

  // B) URL verification / callbacks: encrypted payload
  if (body.encrypt) {
    const encryptKey = process.env.LARK_ENCRYPT_KEY;
    if (!encryptKey) {
      // Tanpa encrypt key, kita tidak bisa jawab challenge terenkripsi
      return res.status(200).json({ error: "Missing LARK_ENCRYPT_KEY" });
    }

    try {
      const decryptedText = decryptEncrypt(body.encrypt, encryptKey);
      const decrypted = JSON.parse(decryptedText);

      // kalau ini adalah verification, pasti ada challenge di hasil decrypt
      if (decrypted.challenge) {
        return res.status(200).json({ challenge: decrypted.challenge });
      }

      // kalau bukan challenge, ini event/callback normal (nanti diproses)
      console.log("LARK_DECRYPTED_BODY", decrypted);
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("LARK_DECRYPT_ERROR", e);
      // tetap 200 supaya UI user tidak error parah
      return res.status(200).json({ ok: false });
    }
  }

  // C) fallback (kalau format tidak dikenali)
  console.log("LARK_BODY_UNKNOWN", body);
  return res.status(200).json({ ok: true });
}
