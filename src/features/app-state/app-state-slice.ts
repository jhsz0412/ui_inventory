
import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

type AppState = {
  sidebarOpen: boolean
}

const initialState: AppState = {
  sidebarOpen: false,
}

const appStateSlice = createSlice({
  name: "appState",
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
  },
})

export const { setSidebarOpen, toggleSidebar } = appStateSlice.actions

export default appStateSlice.reducer
