import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient.js';

// Full contract: docs/API.md -> "deliveries"
export const fetchDeliveries = createAsyncThunk('deliveries/fetch', async (params) => {
  const { data } = await axiosClient.get('/deliveries', { params });
  return data;
});

const deliveriesSlice = createSlice({
  name: 'deliveries',
  initialState: { items: [], meta: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeliveries.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchDeliveries.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchDeliveries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default deliveriesSlice.reducer;
