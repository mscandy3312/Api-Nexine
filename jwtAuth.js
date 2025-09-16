// auth.js
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

// 🔑 clave secreta (de preferencia usa variable de entorno)
const SECRET_KEY = "tu_clave_secreta_super_segura";

// usuarios de ejemplo (puedes reemplazarlo con tu base de datos)
const users = [
  { id: 1, email: "juan@example.com", password: "1234" },
  { id: 2, email: "ana@example.com", password: "abcd" },
];

// LOGIN: devuelve un JWT
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  // Generar JWT
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
    expiresIn: "1h", // dura 1 hora
  });

  res.json({ token });
});

// Middleware para proteger rutas
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // formato: Bearer token

  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // token inválido
    req.user = user;
    next();
  });
};

export default router;
