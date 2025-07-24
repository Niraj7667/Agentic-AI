import express from 'express';
import { startSession, postMessage, getSessionContext } from '../src/chatController.js';
import { verifyAuth } from '../middlewares/verifyAuth.js';

const router = express.Router();

// All routes in this file are protected by your authentication middleware
router.use(verifyAuth);

router.post('/session/start', startSession);
router.post('/chat/:sessionId', postMessage);

// --- NEW --- Route to get the summary and recent messages
router.get('/chat/:sessionId/context', getSessionContext);

export default router;
