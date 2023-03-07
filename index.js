require('dotenv').config({ path: 'config.env' });

const cors = require("cors");
const PORT = process.env.port || 8000;
const https = require('https')
const fs = require("fs");
var passport = require('passport');

const routes = require('./routes/routes');
const express = require('express');
const mongoose = require('mongoose');
const bp = require('body-parser')
const mongoString = process.env.DATABASE_URL;
var corsOptions = {
    origin: "*"
};

mongoose.set("strictQuery", false);
mongoose.connect(mongoString);
const database = mongoose.connection;

database.on('error', (error) => {
    console.log(error)
})

database.once('connected', () => {
    console.log('Database Connected');
})

const app = express();
// Initialize passprt
app.use(passport.initialize());

app.use(bp.json())

app.use(bp.urlencoded({ extended: true }))

app.use(cors(corsOptions));

app.use('/api', routes)

// const options = {
//     key: fs.readFileSync("./config/cert.key"),
//     cert: fs.readFileSync("./config/cert.crt"),
//   };

//   app.listen(PORT, () => {
//     console.log(`Server Started at ${PORT}`)
// })

//   https.createServer(options, app).listen(8080, () => {
//     console.log(`HTTPS server started on port 8080`);
//   });


  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Started at ${PORT}`)
})