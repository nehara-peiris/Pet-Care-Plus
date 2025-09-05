import { createSlice } from '@reduxjs/toolkit';
import type { Record } from '../../types/record';
import { demoRecords } from '../../services/data';

type State = {
  items: Record[];
};

const initialState: State = {
  items: demoRecords,
};

const recordSlice = createSlice({
  name: 'records',
  initialState,
  reducers: {
    addRecord: (state, action) => {
      state.items.push(action.payload);
    },
  },
});

export const { addRecord } = recordSlice.actions;
export default recordSlice.reducer;
