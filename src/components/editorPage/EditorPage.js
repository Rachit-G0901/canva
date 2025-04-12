import { useDispatch, useSelector } from "react-redux";
import { Stage, Layer, Text, Circle, Rect, Transformer, Line } from 'react-konva';
import { addConnection, deleteConnection, deleteElement, redo, undo, updateElement } from "../../store/slice.js";
import React, { useEffect, useRef, useState } from "react";
import URLImage from "../urlImage/URLImage.js";
import { getCenter } from "../helper/shape.helper.js";

function EditorPage() {
    const elements = useSelector(state => state.elements.present.elements);
    const connections = useSelector(state => state.elements.present.connections || []);

    const dispatch = useDispatch();
    const [editingId, setEditingId] = useState(null);
    const [inputValue, setInputValue] = useState('');
    const [inputPos, setInputPos] = useState({ x: 0, y: 0 });
    const [selectedId, setSelectedId] = useState(null);
    const [selectedConnectionId, setSelectedConnectionId] = useState(null);
    const transformerRef = useRef();
    const shapeRefs = useRef({});

    const [stageScale, setStageScale] = useState(1);
    const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

    // NEW: Dummy state to trigger rerender
    const [, setRedraw] = useState(0);

    useEffect(() => {
        if (selectedId && transformerRef.current && shapeRefs.current[selectedId]) {
            const node = shapeRefs.current[selectedId];
            transformerRef.current.nodes([node]);
            transformerRef.current.getLayer().batchDraw();
        } else {
            transformerRef.current?.nodes([]);
        }
    }, [selectedId, elements]);

    const handleDoubleClick = (el) => {
        setEditingId(el.id);
        setInputValue(el.text);
        setInputPos({ x: el.x, y: el.y });
    };

    const handleInputBlur = () => {
        if (editingId !== null) {
            dispatch(updateElement({
                id: editingId,
                updates: { text: inputValue }
            }));
            setEditingId(null);
        }
    };

    const handleTransformEnd = (el, node) => {
        const updates = {
            x: node.x(),
            y: node.y(),
            rotation: node.rotation()
        };

        if (el.type === 'rect') {
            updates.width = node.width() * node.scaleX();
            updates.height = node.height() * node.scaleY();
        } else if (el.type === 'text') {
            updates.fontSize = node.fontSize() * node.scaleX();
        } else if (el.type === 'circle') {
            updates.radius = node.radius() * node.scaleX();
        }

        node.scaleX(1);
        node.scaleY(1);

        dispatch(updateElement({
            id: el.id,
            updates
        }));
    };

    const handleDelete = () => {
        if (selectedConnectionId) {
            dispatch(deleteConnection(selectedConnectionId));
            setSelectedConnectionId(null);
        } else if (selectedId) {
            dispatch(deleteElement(selectedId));
            setSelectedId(null);
        }
    };

    const handleWheel = (e) => {
        e.evt.preventDefault();

        const scaleBy = 1.05;
        const stage = e.target.getStage();
        const oldScale = stageScale;

        const pointer = stage.getPointerPosition();

        const mousePointTo = {
            x: (pointer.x - stagePosition.x) / oldScale,
            y: (pointer.y - stagePosition.y) / oldScale,
        };

        const direction = e.evt.deltaY > 0 ? -1 : 1;
        const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        setStageScale(newScale);
        setStagePosition(newPos);
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Control Panel */}
            <div style={{
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 100,
                display: 'flex',
                gap: '10px',
                padding: '8px',
                background: '#fff',
                borderRadius: '6px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
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

            {/* Stage and Layers */}
            <Stage
                width={window.innerWidth - 200}
                height={600}
                scaleX={stageScale}
                scaleY={stageScale}
                x={stagePosition.x}
                y={stagePosition.y}
                onWheel={handleWheel}
            >
                <Layer>
                    {elements.map((el) =>
                        el.type === 'text' && (
                            <Text
                                key={`edit-${el.id}`}
                                {...el}
                                fontSize={el.fontSize || 20}
                                fontStyle={el.fontStyle || 'normal'}
                                textDecoration={el.textDecoration || ''}
                                onDblClick={() => handleDoubleClick(el)}
                                onDragEnd={(e) => {
                                    dispatch(updateElement({
                                        id: el.id,
                                        updates: {
                                            x: e.target.x(),
                                            y: e.target.y(),
                                        }
                                    }));
                                }}
                            />
                        )
                    )}
                </Layer>

                <Layer>
                    {connections.map((conn) => {
                        const from = elements.find(el => el.id === conn.from);
                        const to = elements.find(el => el.id === conn.to);
                        if (!from || !to) return null;

                        const fromPos = getCenter(from);
                        const toPos = getCenter(to);

                        return (
                            <Line
                                key={conn.id}
                                points={[fromPos.x, fromPos.y, toPos.x, toPos.y]}
                                stroke={selectedConnectionId === conn.id ? 'red' : 'black'}
                                strokeWidth={selectedConnectionId === conn.id ? 4 : 2}
                                onClick={() => {
                                    setSelectedId(null);
                                    setSelectedConnectionId(conn.id);
                                }}
                            />
                        );
                    })}
                </Layer>

                <Layer>
                    {elements.map((el) => {
                        const commonProps = {
                            key: el.id,
                            ...el,
                            draggable: true,
                            ref: (node) => {
                                if (node) shapeRefs.current[el.id] = node;
                                else delete shapeRefs.current[el.id];
                            },
                            onClick: () => {
                                setSelectedConnectionId(null);
                                setSelectedId(el.id);
                            },
                            onDragEnd: (e) => {
                                dispatch(updateElement({
                                    id: el.id,
                                    updates: { x: e.target.x(), y: e.target.y() }
                                }));
                            },
                            onDragMove: () => {
                                setRedraw(prev => prev + 1); // 👈 trigger live redraw of lines
                            },
                            onTransformEnd: (e) => handleTransformEnd(el, e.target),
                        };

                        if (el.type === 'text') {
                            return <Text {...commonProps} />;
                        }

                        if (el.type === 'rect') {
                            return (
                                <Rect
                                    {...commonProps}
                                    stroke={selectedId === el.id ? 'blue' : undefined}
                                    strokeWidth={selectedId === el.id ? 2 : 0}
                                />
                            );
                        }

                        if (el.type === 'circle') {
                            return (
                                <Circle
                                    {...commonProps}
                                    stroke={selectedId === el.id ? 'blue' : undefined}
                                    strokeWidth={selectedId === el.id ? 2 : 0}
                                />
                            );
                        }

                        if (el.type === 'image') {
                            return (
                                <URLImage
                                    key={`img-${el.id}`}
                                    imageProps={el}
                                    dispatch={dispatch}
                                    onClick={() => {
                                        setSelectedId(el.id);
                                        setSelectedConnectionId(null);
                                    }}
                                    stroke={selectedId === el.id ? 'blue' : undefined}
                                    strokeWidth={selectedId === el.id ? 2 : 0}
                                    ref={(node) => { if (node) shapeRefs.current[el.id] = node; }}
                                />
                            );
                        }

                        return null;
                    })}

                    {/* Transformer */}
                    <Transformer
                        ref={transformerRef}
                        rotateEnabled={true}
                        enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                    />
                </Layer>
            </Stage>

            {/* Inline Text Input */}
            {
                editingId !== null && (
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onBlur={handleInputBlur}
                        autoFocus
                        style={{
                            position: 'absolute',
                            top: inputPos.y,
                            left: inputPos.x,
                            fontSize: '20px',
                            border: '1px solid #ccc',
                            padding: '2px',
                            zIndex: 10,
                        }}
                    />
                )
            }
        </div >
    );
}

export default EditorPage;
