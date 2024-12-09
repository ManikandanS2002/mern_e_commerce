import express from 'express'
import { adminRoute, protectRoute } from '../middleware/auth.middleware.js';
import { getAnalystics } from '../controllers/analystics.controller.js';

const router = express.Router();

router.get("/",protectRoute,adminRoute,getAnalystics)

export default router