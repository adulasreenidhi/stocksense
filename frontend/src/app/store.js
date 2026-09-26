import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import productsReducer from '../features/products/productsSlice.js';
import receiptsReducer from '../features/receipts/receiptsSlice.js';
import deliveriesReducer from '../features/deliveries/deliveriesSlice.js';
import transfersReducer from '../features/transfers/transfersSlice.js';
import adjustmentsReducer from '../features/adjustments/adjustmentsSlice.js';
import warehousesReducer from '../features/warehouses/warehousesSlice.js';
// import dashboardReducer from '../features/dashboard/dashboardSlice.js'; // TODO

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    receipts: receiptsReducer,
    deliveries: deliveriesReducer,
    transfers: transfersReducer,
    adjustments: adjustmentsReducer,
    warehouses: warehousesReducer,
    // dashboard: dashboardReducer,
  },
});
