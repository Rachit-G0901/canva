import { useDispatch, useSelector } from "react-redux";
import { redo, undo, updateElement } from "../../store/slice.js";

function ControlPanel({
    selectedId,
    selectedConnectionId,
    handleDelete,
}) {
    const dispatch = useDispatch();
    const elements = useSelector(state => state.elements.present.elements);

    return (
        <div className="control-panel">
            <button onClick={() => dispatch(undo())}>Undo</button>
            <button onClick={() => dispatch(redo())}>Redo</button>
            {(selectedId || selectedConnectionId) && (
                <button onClick={handleDelete}>Delete</button>
            )}
            {selectedId && (
                <>
                    <input
                        type="number"
                        min={8}
                        max={100}
                        value={elements.find(el => el.id === selectedId)?.fontSize || 20}
                        onChange={(e) =>
                            dispatch(updateElement({
                                id: selectedId,
                                updates: { fontSize: parseInt(e.target.value) }
                            }))
                        }
                        style={{ width: 60 }}
                    />
                    <button
                        onClick={() => {
                            const el = elements.find(el => el.id === selectedId);
                            dispatch(updateElement({
                                id: selectedId,
                                updates: { fontStyle: el.fontStyle === 'bold' ? 'normal' : 'bold' }
                            }));
                        }}
                    >
                        Bold
                    </button>
                    <button
                        onClick={() => {
                            const el = elements.find(el => el.id === selectedId);
                            dispatch(updateElement({
                                id: selectedId,
                                updates: { fontStyle: el.fontStyle === 'italic' ? 'normal' : 'italic' }
                            }));
                        }}
                    >
                        Italic
                    </button>
                    <button
                        onClick={() => {
                            const el = elements.find(el => el.id === selectedId);
                            dispatch(updateElement({
                                id: selectedId,
                                updates: {
                                    textDecoration: el.textDecoration === 'underline' ? '' : 'underline'
                                }
                            }));
                        }}
                    >
                        Underline
                    </button>
                    <input
                        type="color"
                        onChange={(e) => {
                            dispatch(updateElement({
                                id: selectedId,
                                updates: { fill: e.target.value }
                            }));
                        }}
                    />
                    <button
                        onClick={() => {
                            if (selectedId) {
                                const other = elements.find(el => el.id !== selectedId);
                                if (other) {
                                    dispatch(addConnection({
                                        id: Date.now().toString(),
                                        from: selectedId,
                                        to: other.id
                                    }));
                                }
                            }
                        }}
                    >
                        Connect
                    </button>
                </>
            )}
        </div>
    );
}

export default ControlPanel;