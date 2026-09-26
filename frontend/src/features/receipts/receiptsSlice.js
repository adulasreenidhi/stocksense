import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient.js';

// Full contract: docs/API.md -> "receipts"
export const fetchReceipts = createAsyncThunk('receipts/fetch', async (params) => {
  const { data } = await axiosClient.get('/receipts', { params });
  return data;
});

const receiptsSlice = createSlice({
  name: 'receipts',
  initialState: { items: [], meta: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReceipts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchReceipts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchReceipts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default receiptsSlice.reducer;
