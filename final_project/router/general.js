const express = require('express');
let books   = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid; // (si tu helper lo necesita)
let users   = require("./auth_users.js").users;

const axios   = require('axios');
const public_users = express.Router();

/* ----------  TASK 6  Registro de usuario  ---------- */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Validaciones básicas
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Si pasa todo, agregamos el usuario
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered" });
});

/* ----------  TASK 1  Lista completa de libros  ---------- */
public_users.get('/', (req, res) => {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

/* ----------  TASK 2  Detalles por ISBN  ---------- */
public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  }
  return res.status(404).json({ message: "Book not found" });
});

/* ----------  TASK 3  Detalles por autor  ---------- */
public_users.get('/author/:author', (req, res) => {
  const { author } = req.params;
  const result = {};

  Object.keys(books).forEach(isbn => {
    if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
      result[isbn] = books[isbn];
    }
  });

  if (Object.keys(result).length > 0) {
    return res.status(200).json(result);
  }
  return res.status(404).json({ message: "No books found for this author" });
});

/* ----------  TASK 4  Detalles por título  ---------- */
public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;
  const result = {};

  Object.keys(books).forEach(isbn => {
    if (books[isbn].title.toLowerCase() === title.toLowerCase()) {
      result[isbn] = books[isbn];
    }
  });

  if (Object.keys(result).length > 0) {
    return res.status(200).json(result);
  }
  return res.status(404).json({ message: "No books found with this title" });
});

/* ----------  TASK 5  Reseñas por ISBN  ---------- */
public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  }
  return res.status(404).json({ message: "No reviews found for this ISBN" });
});

// Base URL de tu servidor
const BASE = 'http://localhost:5000';

//
// Task 10: Promesas (.then/.catch) para listar todos los libros
//
public_users.get('/booksPromise', (req, res) => {
axios.get(`${BASE}/`)
    .then(response => {
      // JSON.stringify con indentación para que se vea bonito
      res.status(200).send(JSON.stringify(response.data, null, 4));
    })
    .catch(err => res.status(500).json({ message: err.message }));
});

//
// Task 11: Async/Await para detalle por ISBN
//
public_users.get('/isbnAsync/:isbn', async (req, res) => {
    try {
      const { isbn } = req.params;
      const response = await axios.get(`${BASE}/isbn/${isbn}`);
      res.status(200).json(response.data);
    } catch (err) {
      res.status(err.response?.status || 500)
         .json({ message: err.response?.data?.message || err.message });
    }
  });
  
//
// Task 12: Promesas para detalle por Autor
//
public_users.get('/authorPromise/:author', (req, res) => {
const author = encodeURIComponent(req.params.author);
axios.get(`${BASE}/author/${author}`)
    .then(response => res.status(200).json(response.data))
    .catch(err => res.status(err.response?.status || 500)
    .json({ message: err.response?.data?.message || err.message }));
});

//
// Task 13: Async/Await para detalle por Título
//
public_users.get('/titleAsync/:title', async (req, res) => {
try {
    const title = encodeURIComponent(req.params.title);
    const response = await axios.get(`${BASE}/title/${title}`);
    res.status(200).json(response.data);
} catch (err) {
    res.status(err.response?.status || 500)
        .json({ message: err.response?.data?.message || err.message });
}
});

module.exports.general = public_users;