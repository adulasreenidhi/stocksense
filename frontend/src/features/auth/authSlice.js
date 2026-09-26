import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi.js';

export const login = createAsyncThunk('auth/login', async (payload) => {
  const { data } = await authApi.login(payload);
  return data.data; // { user, accessToken }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, accessToken: null, status: 'idle', error: null },
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.status = 'loading'; })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { logout, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
