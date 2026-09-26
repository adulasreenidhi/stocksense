import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient.js';

// Full contract: docs/API.md -> "warehouses"
export const fetchWarehouses = createAsyncThunk('warehouses/fetch', async (params) => {
  const { data } = await axiosClient.get('/warehouses', { params });
  return data;
});

const warehousesSlice = createSlice({
  name: 'warehouses',
  initialState: { items: [], meta: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouses.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default warehousesSlice.reducer;
