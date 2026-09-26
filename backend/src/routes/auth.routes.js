import { Router } from 'express';
import { signup, login, requestOtp, verifyOtp, resetPassword } from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/otp/request', requestOtp);
router.post('/otp/verify', verifyOtp);
router.post('/password/reset', resetPassword);

export default router;
