import { Image } from "react-konva";
import { useEffect, useRef, useState } from "react";

function URLImage({ imageProps, dispatch }) {
  const shapeRef = useRef();
  const [img, setImg] = useState(null);

  useEffect(() => {
    const image = new window.Image();
    image.src = imageProps.src;
    image.onload = () => setImg(image);
  }, [imageProps.src]);

  return (
    <Image
      image={img}
      {...imageProps}
      ref={shapeRef}
      draggable
      onDragEnd={(e) => {
        dispatch({
          type: "elements/updateElement",
          payload: {
            id: imageProps.id,
            updates: {
              x: e.target.x(),
              y: e.target.y(),
            },
          },
        });
      }}
    />
  );
}

export default URLImage;
