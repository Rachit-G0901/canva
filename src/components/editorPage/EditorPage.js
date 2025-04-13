import { useDispatch, useSelector } from "react-redux";
import { Stage, Layer, Text, Circle, Rect, Transformer, Line } from 'react-konva';
import { addConnection, deleteConnection, deleteElement, updateElement } from "../../store/slice.js";
import React, { useEffect, useRef, useState } from "react";
import URLImage from "../urlImage/URLImage.js";
import { getCenter } from "../helper/shape.helper.js";
import ControlPanel from './ControlPanel.js';
import './EditorPage.css';

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
    const imageRefs = useRef({});

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
        else if (el.type === 'image') {
            updates.width = node.width() / node.scaleX();
            updates.height = node.height() / node.scaleY();
             updates.scaleX=node.scaleX();
            updates.scaleY=node.scaleY();

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
        <div className="editor-page-container">
            <ControlPanel
                selectedId={selectedId}
                selectedConnectionId={selectedConnectionId}
                handleDelete={handleDelete}
            />

            {/* Stage and Layers */}
            <Stage className="editor-page-canvas"
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
                                onDragEnd={(e) => {
                                    dispatch(updateElement({
                                        id: el.id,
                                        updates: { x: e.target.x(), y: e.target.y() }
                                    }));
                                }}
                                onTransformEnd={(e) => handleTransformEnd(el, e.target)}
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
