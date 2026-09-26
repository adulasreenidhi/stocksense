import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient.js';

// Full contract: docs/API.md -> "adjustments"
export const fetchAdjustments = createAsyncThunk('adjustments/fetch', async (params) => {
  const { data } = await axiosClient.get('/adjustments', { params });
  return data;
});

const adjustmentsSlice = createSlice({
  name: 'adjustments',
  initialState: { items: [], meta: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdjustments.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchAdjustments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchAdjustments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default adjustmentsSlice.reducer;
