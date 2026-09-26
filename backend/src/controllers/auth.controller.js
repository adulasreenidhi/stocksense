import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, fail } from '../utils/apiResponse.js';
import { generateOTP } from '../utils/generateOTP.js';
import { sendEmail } from '../utils/sendEmail.js';

function signAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
  );
}

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return fail(res, 'Email already registered', 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role });
  const accessToken = signAccessToken(user);

  return ok(res, { user: { id: user._id, name, email, role }, accessToken }, null, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return fail(res, 'Invalid credentials', 401);

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return fail(res, 'Invalid credentials', 401);

  const accessToken = signAccessToken(user);
  return ok(res, {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
  });
});

export const requestOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return fail(res, 'No account with that email', 404);

  const code = generateOTP();
  const expiresAt = new Date(Date.now() + Number(process.env.OTP_EXPIRES_IN_MINUTES) * 60000);
  user.otp = { code, expiresAt };
  await user.save();

  await sendEmail({
    to: email,
    subject: 'StockSense password reset OTP',
    text: `Your OTP is ${code}. It expires in ${process.env.OTP_EXPIRES_IN_MINUTES} minutes.`,
  });

  return ok(res, { message: 'OTP sent' });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });
  if (!user || !user.otp?.code) return fail(res, 'OTP not requested', 400);
  if (user.otp.code !== otp || user.otp.expiresAt < new Date()) {
    return fail(res, 'Invalid or expired OTP', 400);
  }

  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  return ok(res, { resetToken });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { resetToken, newPassword } = req.body;
  const payload = jwt.verify(resetToken, process.env.JWT_ACCESS_SECRET);
  const user = await User.findById(payload.id);
  if (!user) return fail(res, 'User not found', 404);

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.otp = undefined;
  await user.save();

  return ok(res, { message: 'Password updated' });
});
