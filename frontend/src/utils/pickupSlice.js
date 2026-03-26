import { createSlice } from '@reduxjs/toolkit';

const pickupSlice = createSlice({
    name: 'pickup',
    initialState: {
        pickupRequests: [],
    },
    reducers: {
        addPickupRequest: (state, action) => {
            // Add only new requests, avoid duplicates by checking _id
            const newRequests = action.payload.filter(
                (newRequest) => !state.pickupRequests.some(request => request._id === newRequest._id)
            );
            state.pickupRequests = [...state.pickupRequests, ...newRequests];
        },
        removePickupRequest: (state, action) => {
            state.pickupRequests = state.pickupRequests.filter(request => request._id !== action.payload);
        },
        updatePickupRequestStatus: (state, action) => {
            const request = state.pickupRequests.find(r => r._id === action.payload.requestId);
            if (request) {
                request.status = action.payload.status;
            }
        },
    },
});

export const { addPickupRequest, removePickupRequest, updatePickupRequestStatus } = pickupSlice.actions;
export default pickupSlice.reducer;
