import { createSlice } from "@reduxjs/toolkit";

// Unique ID generator
let currentId = 1;
function nextId() {
    return currentId++;
}

function saveHistory(state) {
    state.past.push(JSON.parse(JSON.stringify(state.present))); // Deep copy for safety
    state.future = [];
}

const mySlice = createSlice({
    name: "mySlice",
    initialState: {
        past: [],
        present: {
            elements: [],
            connections: []
        },
        future: []
    },
    reducers: {
        addText(state) {
            state.present.elements.push({
                id: String(nextId()),
                type: 'text',
                x: 50,
                y: 50,
                text: 'Edit me',
                fontSize: 20,
                fill: 'black',
                draggable: true,
            });
        },
        addRectangle(state) {
            state.present.elements.push({
                id: String(nextId()),
                type: 'rect',
                x: 100,
                y: 100,
                width: 120,
                height: 80,
                fill: 'skyblue',
                draggable: true,
            });
        },
        addCircle(state) {
            state.present.elements.push({
                id: String(nextId()),
                type: 'circle',
                x: 150,
                y: 150,
                radius: 50,
                fill: 'lightgreen',
                draggable: true,
            });
        },
        addElement(state, action) {
            const newElement = { id: String(nextId()), ...action.payload };
            state.present.elements.push(newElement);
        },
        updateElement(state, action) {
            saveHistory(state);
            const { id, updates } = action.payload;
            const element = state.present.elements.find(el => el.id === id);
            if (element) {
                Object.assign(element, updates);
            }
        },
        deleteElement(state, action) {
            saveHistory(state);
            const idToDelete = action.payload;
            state.present.elements = state.present.elements.filter(el => el.id !== idToDelete);
            state.present.connections = state.present.connections.filter(
                conn => conn.from !== idToDelete && conn.to !== idToDelete
            );
        },
        addConnection(state, action) {
            state.present.connections.push(action.payload); // { id, from, to }
        },
        updateConnection(state, action) {
            const index = state.present.connections.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.present.connections[index] = {
                    ...state.present.connections[index],
                    ...action.payload.updates,
                };
            }
        },
        deleteConnection(state, action) {
            const idToDelete = action.payload;
            state.present.connections = state.present.connections.filter(
                conn => conn.id !== idToDelete
            );
        },
        undo(state) {
            if (state.past.length > 0) {
                state.future.unshift(JSON.parse(JSON.stringify(state.present)));
                state.present = state.past.pop();
            }
        },
        redo(state) {
            if (state.future.length > 0) {
                state.past.push(JSON.parse(JSON.stringify(state.present)));
                state.present = state.future.shift();
            }
        },
    }
});

export const {
    addText,
    updateElement,
    addCircle,
    addRectangle,
    addElement,
    deleteElement,
    undo,
    redo,
    addConnection,
    updateConnection,
    deleteConnection
} = mySlice.actions;

export default mySlice.reducer;
