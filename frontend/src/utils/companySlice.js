import { createSlice } from "@reduxjs/toolkit";

const companySlice = createSlice({
   name: 'company',
   initialState: null,
   reducers: {
       addCompany: (state, action) => {
           return { ...action.payload, role: "company" };
       },
       removeCompany: (state,action) => {
           return null;
       },
   },
});

export const { addCompany, removeCompany } = companySlice.actions;

export default companySlice.reducer;