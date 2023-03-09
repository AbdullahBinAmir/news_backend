const express = require('express');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require("express-session");

const userModel = require('../models/usermodel');

const initPassport = (app) => {

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: 'baum',
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new FacebookStrategy(
      {
        clientID: '1901022196916471',
        clientSecret: 'd4092c77e37b00f0ff5b8365ee3cddc4',
        callbackURL: 'https://lime-charming-horse.cyclic.app/auth/facebook/callback',
        profileFields   : ['id', 'name', 'email'],
    }, (accessToken, refreshToken, profile, done) => {
        done(null, formatFB(profile.emails[0].value,profile.id));
      }));

passport.use(
    new GoogleStrategy(
      {
        clientID: '929512267025-5h1tojde6nlqqr7uv4f5qa157pjs7iua.apps.googleusercontent.com',
        clientSecret: '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',
        callbackURL: 'https://lime-charming-horse.cyclic.app/auth/google/callback',
    }, (accessToken, refreshToken, profile, done) => {
        done(null, formatGoogle(profile.emails[0].value,profile.id));
      }));

// Serialize user into the sessions
passport.serializeUser((user, done) => done(null, user));

// Deserialize user from the sessions
passport.deserializeUser((user, done) => done(null, user));      

////////// Format data//////////

const formatGoogle = (email) => {
  return {
    email: email,
    password: Math.random().toString(36).slice(-8),
    verified:true
  };
};
const formatFB = (email,id) => {
  return {
    email: email?email:`${id}@gmail.com`,
    password: Math.random().toString(36).slice(-8),
    verified:true
  };
};
}

module.exports = initPassport

// Configure the Google authentication strategy
// passport.use(new GoogleStrategy({
//   clientID: '929512267025-5h1tojde6nlqqr7uv4f5qa157pjs7iua.apps.googleusercontent.com',
//   clientSecret: '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',
//   callbackURL: '/auth/google/callback',
// }, async (accessToken, refreshToken, profile, done) => {
//   try {
//     // Check if the user is already registered in your database
//     const user = await userModel.findOne({ email: profile.emails[0].value });

//     if (user) {
//       // If the user is already registered, create a session token
//       const sessionToken = user._id ;
//       done(null, sessionToken);
//     } else {
//       // If the user is not registered, create a new user record in your database
//       const newUser = new userModel({
//         email: profile.emails[0].value,
//         verified:true
//         // ... other user data
//       });
//       await newUser.save();
//       const sessionToken =  newUser._id;
//       done(null, sessionToken);
//     }
//   } catch (error) {
//     console.error(error);
//     done(error);
//   }
// }));