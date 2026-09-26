import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsApi } from '../../api/productsApi.js';

export const fetchProducts = createAsyncThunk('products/fetch', async (params) => {
  const { data } = await productsApi.list(params);
  return data; // { data: [...], meta }
});

const productsSlice = createSlice({
  name: 'products',
  initialState: { items: [], meta: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default productsSlice.reducer;
