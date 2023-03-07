const { json } = require('body-parser');
const express = require('express');
const fetch = require('cross-fetch')
const FormData = require('form-data');
const { v4: uuidv4 } = require('uuid')
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const bcrypt = require("bcrypt")
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser((user, done) => {
  done(null, user);
  })
  passport.deserializeUser((user, done) => {
  done(null, user)
  })

const saltRounds = 10;

const router = express.Router()

const userModel = require('../models/usermodel');
const CustomerSupport = require('../models/customerSupportModel');
const UserFeedback = require('../models/UserFeedbackModel');

dotenv.config()

// Register route
router.post('/register', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if user already exists
      const user = await userModel.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

  
      // Generate verification token
      const token = uuidv4();
      const hashedPwd = await bcrypt.hash(password, saltRounds);
      // Save user to database
      const newUser = new userModel({
        email:email,
        password: hashedPwd,
        token:token,
      });
      await newUser.save();
  
      console.log(process.env.EMAIL_USER)
      // Send verification email
      //ulpsbpuzshmvlmmj
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification',
        html: `Click <a href="http://192.168.43.39:8000/api/verify?token=${token}">here</a> to verify your email`,
      };
  
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error sending email' });
        }
        console.log(`Email sent: ${info.response}`);
        res.status(200).json({ message: 'User registered. Please check your email for verification instructions' });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Verify email route
  router.get('/verify', async (req, res) => {
    const token = req.query.token;
  
    try {
      // Find user with matching token
      const user = await userModel.findOne({ token });
      //console.log(user)
      if (!user) {
        return res.status(400).json({ message: 'Invalid token' });
      }
  
      // Update user's verified status
      user.verified = true;
      // Remove token
        user.token = '';
        await user.save();
        res.json({ message: 'Email verified' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
        }
    });

// Screen 1: Request reset password code
router.post('/request-reset-password-code', async (req, res) => {
    const { email } = req.body;
    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        res.status(400).json({ message: 'Invalid email' });
        return;
      }
      const resetPasswordCode = Math.floor(10000 + Math.random() * 90000);
      user.resetPasswordCode = resetPasswordCode;
      user.resetPasswordCodeExpires = Date.now() + 600000; // 10 minutes
      await user.save();
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Password Code',
        text: `Your reset password code is: ${resetPasswordCode}`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          res.status(500).json({ message: 'Internal server error' });
        } else {
          console.log(`Reset password code sent to ${email}`);
          res.status(200).json({ message: 'Reset password code sent' });
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Screen 2: Verify reset password code and get token
  router.post('/verify-reset-password-code', async (req, res) => {
    const { email, resetPasswordCode } = req.body;
    console.log(resetPasswordCode)
    try {
      const user = await userModel.findOne({ email, resetPasswordCode, resetPasswordCodeExpires: { $gt: Date.now() } });
      if (!user) {
        res.status(400).json({ message: 'Invalid or expired reset password code' });
        return;
      }
      const resetPasswordToken = uuidv4();
      user.resetPasswordToken = resetPasswordToken;
      user.resetPasswordCodeExpires = Date.now() + 3600000; // 1 hour
      await user.save();
      res.json({ resetPasswordToken });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Screen 3: Reset password
  router.post('/reset-password', async (req, res) => {
    const { resetPasswordToken, password } = req.body;
    try {
      const user = await userModel.findOne({ resetPasswordToken });
      if (!user) {
        res.status(400).json({ message: 'Invalid or expired reset password token' });
        return;
      }
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordCodeExpires = undefined;
      user.resetPasswordCode = undefined
      await user.save();
      res.json({ message: 'Password reset successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
//Post Method
router.post('/saveuser', async (req, res) => {
    const data = new userModel(
        {
            email: req.body.email,
            password: req.body.password
        }
    )
    try {
        const dataToSave = await  data.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({message: error.message})
    }
})

// router.get('/aa', async (req, res) => {
//     res.status(200).json({messag:"Hello"})
// })

//Get all Method
router.get('/getAll', async (req, res) => {
    try{
        const data = await userModel.find();
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//Get by email and password Method
router.post('/getuser', async (req, res) => {
    try{
        const data = await userModel.findOne({email:req.query.email});
        const cmp = bcrypt.compare(req.query.password, data.password);
            // If the user is not found, return an error message
        if (!data) {
            return res.status(401).json({ message: 'Authentication failed.' });
        }
  
      // If the user's email address is not verified, return an error message
      if (!data.verified) {
        return res.status(401).json({ message: 'Email address not verified.' });
      }
      if (!cmp) {
        return res.status(401).json({ message: 'Wrong Password.' });
      }
      if (data.verified) {
        return res.status(200).json(data);
      }
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//Get Latest Articles

router.get('/getrecentarticles', async (req, res) => {
    try{
        const form = new FormData();
        form.append(
            'date','2023-02-12'
        )
        const item = await fetch("http://localhost:5000/Recent", {
            method: 'POST',
            body: form
          })
          
          const data = await item.json()
          res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//Get Articles Recommendations

router.get('/getrecommendations', async (req, res) => {
    try{
        const form = new FormData();
        form.append(
            'article_id',req.query.id
        )
        const item = await fetch("http://localhost:5000/Recommendations", {
            method: 'POST',
            body: form
          })
          
          const data = await item.json()
          res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//SearchArticles

router.get('/searcharticles', async (req, res) => {
    try{
      const form = new FormData();
      form.append(
          'keyword',req.query.keyword
      )
      const item = await fetch("http://localhost:5000/Search", {
          method: 'POST',
          body: form
        })
        
        const data = await item.json()
        res.json(data)
    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})

//Save Customer Support Messages

router.post('/customersupport', async (req, res) => {
  const data = new CustomerSupport(
    {
          userId: req.body.uid,
          message: req.body.message
    }
  )
 // console.log(data)
    try {
        const dataToSave = await  data.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({message: error.message})
    }
})

//Save Customer Feedabck

router.post('/customerfeedback', async (req, res) => {
  const data = new UserFeedback(
    {
          userId: req.body.uid,
          message: req.body.message
    }
  )
 // console.log(data)
    try {
        const dataToSave = await  data.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({message: error.message})
    }
})

//Delete User

router.post('/deleteuser', async (req, res) => {
 // console.log(data)
 const userId = req.body.uid; // ID of the user to delete
    try {
      const result1 = await userModel.deleteOne({ _id: userId });
      const result2 = await CustomerSupport.deleteMany({ userId: userId });
      const result3 = await UserFeedback.deleteMany({ userId: userId });
      if(result1.acknowledged && result2.acknowledged && result3.acknowledged)
        res.status(200).json({message: 'Your account has been deleted!'})
    }
    catch (error) {
        res.status(400).json({message: error.message})
    }
})

// Configure the Google authentication strategy
passport.use(new GoogleStrategy({
  clientID: '929512267025-5h1tojde6nlqqr7uv4f5qa157pjs7iua.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if the user is already registered in your database
    const user = await userModel.findOne({ email: profile.emails[0].value });

    if (user) {
      // If the user is already registered, create a session token
      const sessionToken = user._id ;
      done(null, sessionToken);
    } else {
      // If the user is not registered, create a new user record in your database
      const newUser = new userModel({
        email: profile.emails[0].value,
        verified:true
        // ... other user data
      });
      await newUser.save();
      const sessionToken =  newUser._id;
      done(null, sessionToken);
    }
  } catch (error) {
    console.error(error);
    done(error);
  }
}));

// Googe Oauth2
router.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  }));

  // Google Oauth2 callback url
// Create a route to handle the Google authentication callback
router.post('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (error, sessionToken) => {
    if (error) {
      return next(error);
    }

    // Send the session token to the React Native app
    return res.send({ session_token: sessionToken });
  })(req, res, next);
});

//Get by ID Method
router.get('/getuserbyId', async (req, res) => {
  try{
      const data = await userModel.findOne({_id:req.query.id});
          // If the user is not found, return an error message
      if (!data) {
          return res.status(401).json({ message: 'Authentication failed.' });
      }
    // If the user's email address is not verified, return an error message
    if (!data.verified) {
      return res.status(401).json({ message: 'Email address not verified.' });
    }
    if (data.verified) {
      return res.status(200).json(data);
    }
      res.json(data)
  }
  catch(error){
      res.status(500).json({message: error.message})
  }
});



module.exports = router;