import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// ⬇️ penting untuk akses file html/css/js di folder public
app.use(express.static(path.join(__dirname, "public")));

const dataFile = path.join(__dirname, "transactions.json");
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "[]");

// Dummy akun login
const users = [
  { email: "admin@gmail.com", password: "admin0001", name: "Admin HeroPay" },
];

// === LOGIN ===
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user)
    return res.status(401).json({ error: "Email atau password salah" });

  const token = Math.random().toString(36).substring(2);
  res.json({ token, user: { email: user.email, name: user.name } });
});

// === TRANSAKSI ===
app.post("/api/transactions", (req, res) => {
  const { game, packageName, price, userId, zoneId } = req.body;
  if (!game || !packageName || !price || !userId)
    return res.status(400).json({ message: "Data tidak lengkap" });

  const transactions = JSON.parse(fs.readFileSync(dataFile));
  const newTx = {
    id: Date.now().toString(),
    game,
    packageName,
    price,
    userId,
    zoneId: zoneId || "-",
    time: new Date().toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "medium",
    }),
  };

  transactions.push(newTx);
  fs.writeFileSync(dataFile, JSON.stringify(transactions, null, 2));

  res.json({ success: true, message: "Transaksi tersimpan", data: newTx });
});

app.get("/api/transactions", (req, res) => {
  const transactions = JSON.parse(fs.readFileSync(dataFile));
  res.json(transactions);
});

// === API HARGA ===
const prices = {
  "Mobile Legends": [
    { id: "ml-3", price: 1600 },
    { id: "ml-5", price: 1800 },
    { id: "ml-12", price: 4000 },
  ],
  Roblox: [
    { id: "rb-40", price: 5000 },
    { id: "rb-100", price: 12000 },
  ],
  "Free Fire": [
    { id: "mc-260", price: 25000 },
    { id: "mc-520", price: 47000 },
  ],
};

app.get("/api/prices", (req, res) => {
  res.json(prices); // `prices` adalah objek yang menyimpan data harga terbaru
});

app.post("/api/update-price", (req, res) => {
  const { game, packageId, newPrice } = req.body;
  const gamePackages = prices[game];
  if (!gamePackages) return res.status(404).send("Game not found");

  const pkg = gamePackages.find((p) => p.id === packageId);
  if (!pkg) return res.status(404).send("Package not found");

  pkg.price = parseInt(newPrice, 10);
  res.send("Price updated");
});

// === ROUTING ===
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// === AUTO DETEKSI IP KOMPUTER ===
function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) return net.address;
    }
  }
  return "localhost";
}

const PORT = 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  const ip = getLocalIP();
  console.log(`✅ Server berjalan di:
- PC: http://localhost:${PORT}
- HP (Wi-Fi sama): http://${ip}:${PORT}`);
});
