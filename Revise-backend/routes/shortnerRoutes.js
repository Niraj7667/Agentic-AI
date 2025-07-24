// routes/shortenerRoutes.js
import express from 'express';
import { longUrl, redirect, deleteUrl, getUserUrls } from '../src/shortner.js';
import { verifyAuth } from '../middlewares/verifyAuth.js';

const router = express.Router();

// ✅ IMPORTANT: Specific routes MUST come before parameterized routes
// Otherwise /:id will catch everything including "/user-urls"

// Only authenticated users can shorten URLs
router.post('/long', verifyAuth, longUrl);

// Get user's URLs (authenticated) - MUST come before /:id route
router.get('/user-urls', verifyAuth, getUserUrls);

// Alternative route (if you want to keep both)
router.get('/my', verifyAuth, getUserUrls);

// Delete a URL (authenticated) - specific route, comes before /:id
router.delete('/:id', verifyAuth, deleteUrl);

// Public: anyone can access short URL - MUST come last among GET routes
router.get('/:id', redirect);

export default router;