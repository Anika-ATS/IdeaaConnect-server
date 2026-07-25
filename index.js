
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();
const port =process.env.PORT || 3000

//load environment varriables from .env file
dotenv.config()


// const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to IdeaaConnect Server!');
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });