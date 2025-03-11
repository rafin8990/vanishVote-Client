import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface InitialStateProps {
  value: string;
}

const initialState: InitialStateProps = {
  value: "",
};

const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    setValue: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
    },
    reset: (state) => {
      state.value = "";
    }
  },
});

export const { setValue, reset } = counterSlice.actions;
export default counterSlice.reducer;