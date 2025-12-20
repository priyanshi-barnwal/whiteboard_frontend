import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "whiteboard_scene_v1";

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { elements: [], appState: {} };
    return JSON.parse(raw);
  } catch (e) {
    console.warn("failed to load whiteboard scene from localStorage", e);
    return { elements: [], appState: {} };
  }
};

const initialState = loadFromStorage();

const whiteboardSlice = createSlice({
  name: "whiteboard",
  initialState,
  reducers: {
    setScene(state, action) {
      const payload = action.payload || { elements: [], appState: {} };
      state.elements = payload.elements || [];
      state.appState = payload.appState || {};
    },
    clearScene(state) {
      state.elements = [];
      state.appState = {};
    },
  },
});

export const { setScene, clearScene } = whiteboardSlice.actions;
export const selectScene = (state) => ({
  elements: state.whiteboard.elements || [],
  appState: state.whiteboard.appState || {},
});

export default whiteboardSlice.reducer;
