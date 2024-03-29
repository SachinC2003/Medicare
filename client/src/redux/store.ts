import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "@reduxjs/toolkit";
import { alertSlice } from "./alertSlice";
import { userDataSlice } from "./userDataSlice";
import { doctorDataSlice } from "./doctorDataSlice";

const rootReducer = combineReducers({
    alerts:alertSlice.reducer,
    userData:userDataSlice.reducer,
    doctorData:doctorDataSlice.reducer,
})

const store = configureStore({
    reducer:rootReducer
})

export default store