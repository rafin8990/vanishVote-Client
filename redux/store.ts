import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { combineReducers } from "redux";
import voteReducer from "./slices/voteSlice"; // Import the voteSlice reducer

// Create the root reducer
const rootReducer = combineReducers({
  vote: voteReducer, // Add the voteReducer here.  Key is "vote"
  // counter: counterReducer, // Remove or keep other reducers as needed
});

// Configure persistence
const persistConfig = {
  key: "root",
  storage, 
  whitelist: ['vote'] // persist only the vote slice

};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Persistor
export const persistor = persistStore(store);

// Define RootState and AppDispatch for TypeScript
export type RootState = ReturnType<typeof rootReducer>; // Use the rootReducer type
export type AppDispatch = typeof store.dispatch;