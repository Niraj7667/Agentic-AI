import express from 'express'
import {Login} from "../src/Login.js"
import { Signup } from '../src/Signup.js';
import { logout } from '../src/Logout.js';
import { authRequired } from '../middlewares/authRequired.js';
import { verifyAuth } from '../middlewares/verifyAuth.js';
const router = express.Router();

// Public routes
router.post('/login', Login);
router.post('/signup', Signup);

// Protected routes
router.post('/logout', verifyAuth, logout); // Add logout route

// Optional: Get current user info
router.get('/me', verifyAuth, (req, res) => {
  res.json({ 
    user: req.user,
    authenticated: true 
  });
});

export default router;
