export function getCenter(shape) {
    const { x, y, width, height, radius, type } = shape;
    
    if (type === 'rect') {
        return { x: x + width / 2, y: y + height / 2 };
    } else if (type === 'circle') {
        return { x: x + radius, y: y + radius };
    } else if (type === 'text') {
        return { x: x, y: y }; // You may need more accuracy here if text is scaled
    } else if (type === 'image') {
        return { x: x + shape.width / 2, y: y + shape.height / 2 };
    }
    return { x, y };
}
