import { Router } from 'express';
import {
  signup,
  login,
  refresh,
  logout,
  requestOtp,
  verifyOtp,
  resetPassword,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/otp/request', requestOtp);
router.post('/otp/verify', verifyOtp);
router.post('/password/reset', resetPassword);

export default router;
