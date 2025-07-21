const express = require('express');
const jwt     = require('jsonwebtoken');
let books     = require("./booksdb.js");

let users     = require("./auth_users.js").users || [];

const regd_users = express.Router();

const isValid = (username) => {
  return users.findIndex(u => u.username === username) === -1;
};

const authenticatedUser = (username, password) => {
  return users.findIndex(u => u.username === username && u.password === password) !== -1;
};

/* ---------- TASK 7: Login de usuario registrado ---------- */
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  // Verifica credenciales contra tu array `users`
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Genera JWT por 1 hora
  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });

  // Almacénala en la sesión para las rutas protegidas
  req.session.authorization = { accessToken, username };

  return res
    .status(200)
    .json({ message: "User successfully logged in", accessToken });
});

/* ---------- TASK 8: Añadir o modificar reseña en un libro ---------- */
/* Ruta protegida: PUT /customer/auth/review/:isbn */
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn }  = req.params;
  const review    = req.query.review;
  const book      = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }

  const username = req.session.authorization.username;

  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated",
    reviews: book.reviews
  });
});

/* ---------- TASK 9: Borrar reseña de este usuario ---------- */
/* Ruta protegida: DELETE /customer/auth/review/:isbn */
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const book     = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  const username = req.session.authorization.username;
  if (!book.reviews[username]) {
    return res
      .status(404)
      .json({ message: "No review by this user to delete" });
  }

  delete book.reviews[username];
  return res.status(200).json({
    message: "Review deleted",
    reviews: book.reviews
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid       = isValid;
module.exports.users         = users;