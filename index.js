// /api/index.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database sementara (bisa diganti ke DB beneran)
const users = [
  { email: "admin@gmail.com", password: "admin0001", name: "Admin HeroPay" },
];

// Ganti path agar selalu benar
const transactionsPath = path.join(__dirname, "..", "..", "transactions.json");

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user)
    return res.status(401).json({ error: "Email atau password salah" });
  res.json({
    token: "mock-token-12345",
    user: { email: user.email, name: user.name },
  });
});

app.get("user", (req, res) => {
  res.json(users.map((u) => ({ email: u.email, name: u.name })));
});

app.get("transactions", (req, res) => {
  fs.readFile(transactionsPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Gagal membaca data" });
    let txs = [];
    try {
      txs = JSON.parse(data);
    } catch {
      txs = [];
    }
    res.json(txs);
  });
});

app.delete("transactions", (req, res) => {
  fs.writeFile(transactionsPath, "[]", "utf8", (err) => {
    if (err) return res.status(500).json({ error: "Gagal menghapus data" });
    res.json({ success: true });
  });
});

app.listen(3000, () => console.log("✅ API berjalan di http://localhost:3000"));

