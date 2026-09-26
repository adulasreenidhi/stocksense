import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient.js';

// Full contract: docs/API.md -> "transfers"
export const fetchTransfers = createAsyncThunk('transfers/fetch', async (params) => {
  const { data } = await axiosClient.get('/transfers', { params });
  return data;
});

const transfersSlice = createSlice({
  name: 'transfers',
  initialState: { items: [], meta: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransfers.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchTransfers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default transfersSlice.reducer;
