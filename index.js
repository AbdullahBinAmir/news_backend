require('dotenv').config({ path: 'config.env' });

const cors = require("cors");
const PORT = process.env.port || 8000;
const https = require('https')
const fs = require("fs");

const routes = require('./routes/routes');
const initPassport = require('./routes/auth');
const express = require('express');
const mongoose = require('mongoose');
const bp = require('body-parser')
const passport = require("passport");
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

//init passport
initPassport(app);

app.use(bp.json())

app.use(bp.urlencoded({ extended: true }))

app.use(cors(corsOptions));

app.use('/api', routes)

app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

 app.get("/auth/facebook", passport.authenticate("facebook", { scope: ['email']})); 

//once permission to exchange data is granted, a callback will be fired
app.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", { failureRedirect: "/auth/facebook" }),
    // Redirect user back to the mobile app using deep linking
    (req, res) => {
      res.redirect(
        `baumnews://app/SignIn?email=${req.user.email}/pass=${req.user.password}/status=${req.user.verified}`
      );
    }
); 
  // Google authentication callback route
app.get(
    '/auth/google/callback',
    passport.authenticate('google',{failureRedirect:'/auth/google'}),
    (req, res) => {
        res.redirect(
    `baumnews://app/SignIn?email=${req.user.email}/pass=${req.user.password}/status=${req.user.verified}`
        )
    }
  );
  

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