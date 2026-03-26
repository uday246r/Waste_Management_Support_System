import { createSlice } from "@reduxjs/toolkit";

const companyFeedSlice = createSlice({
  name: "companyFeed",
  initialState: [],  // Initialize as an empty array, not null
  reducers: {
    addCompanyFeed: (state, action) => {
      return action.payload;  // This sets the feed to the fetched data
    },

    removeFromCompanyFeed: (state, action) => {
      // This removes an item based on its _id
      return state.filter(item => item._id !== action.payload);
    },
  },
});

export const { addCompanyFeed, removeFromCompanyFeed } = companyFeedSlice.actions;
export default companyFeedSlice.reducer;
