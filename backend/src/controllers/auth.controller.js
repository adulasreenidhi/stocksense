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
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return fail(res, 'Email already registered', 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role: role || 'inventory_manager' });
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  setRefreshCookie(res, refreshToken);

  return ok(res, { user: { id: user._id, name, email, role: user.role }, accessToken }, null, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return fail(res, 'Invalid credentials', 401);

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return fail(res, 'Invalid credentials', 401);

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  setRefreshCookie(res, refreshToken);

  return ok(res, {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return fail(res, 'No refresh token provided', 401);

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return fail(res, 'User not found', 401);

    const accessToken = signAccessToken(user);
    return ok(res, {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
    });
  } catch (err) {
    return fail(res, 'Invalid or expired refresh token', 401);
  }
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax' });
  return res.status(204).send();
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
