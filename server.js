const express = require("express");
const app = express();
const http = require("http").createServer(app);
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Linkuser, Link, sequelize } = require("./models/link");
require('dotenv').config();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const Port = 5500;

// Initialize Sequelize
sequelize.authenticate()
  .then(() => {
    console.log('Connection to PostgreSQL has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Sync models
sequelize.sync()

// Middleware to check token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Signup endpoint
app.post("/signup", async (req, res) => {
  const { email , username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await Linkuser.create({ email , username, password: hashedPassword });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await Linkuser.findOne({ where: { username } });

  if (user && await bcrypt.compare(password, user.password)) {
    const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.json({ accessToken });
  } else {
    res.status(401).json({ error: "Invalid username or password" });
  }
});

// Create link endpoint
app.post("/i", authenticateToken, async (req, res) => {
  const { longURL } = req.body;
  const shortURL = Math.random().toString(32).substring(7);
  const pass = `localhost:${Port}/i/` + shortURL;
  console.log(pass);

  try {
    const link = await Link.create({ shortURL, longURL, userId: req.user.userId });
    res.json({ shortURL, pass });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/mylinks", authenticateToken, async (req, res) => {
    const userId = req.user.userId;
  
    try {
      const links = await Link.findAll({
        where: { userId },
        attributes: ['id', 'shortURL', 'longURL', 'visitCount']
      });
      res.json(links);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

app.get("/ping",(_ ,res)=>{
    res.status(200).send({"msg":"Server Live" , "version":"2.0" })
})

// Redirect to long URL
app.get("/i/:short", async (req, res) => {
    const shortURL = req.params.short;
  
    try {
      const link = await Link.findOne({ where: { shortURL } });
  
      if (!link) {
        return res.sendStatus(404);
      }
  
      // Increment visit count
      link.visitCount++;
      await link.save();
  
      res.status(301).redirect(link.longURL);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

http.listen(process.env.PORT || Port, () => { console.log(`Listening on ${Port}`) });
