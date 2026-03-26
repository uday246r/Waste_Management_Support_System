import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
  name: "feed",
  initialState: [],  // Initialize as an empty array, not null
  reducers: {
    addFeed: (state, action) => {
      return action.payload;  // This sets the feed to the fetched data
    },

    removeFromFeed: (state, action) => {
      // This removes an item based on its _id
      return state.filter(item => item._id !== action.payload);
    },
  },
});

export const { addFeed, removeFromFeed } = feedSlice.actions;
export default feedSlice.reducer;
