import { configureStore } from "@reduxjs/toolkit"
import mySlice from './slice.js'
const store = configureStore({
    reducer:{
        elements: mySlice
    }
})

export default store;