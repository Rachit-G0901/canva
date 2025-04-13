import { Image } from "react-konva";
import { useEffect, useRef, useState } from "react";
import { updateElement } from "../../store/slice.js";
 
function URLImage({ imageProps, dispatch, onTransformEnd }) {
  const shapeRef = useRef();
  const [img, setImg] = useState(null);

  useEffect(() => {
    const image = new window.Image();
    image.src = imageProps.src;
    image.onload = () => setImg(image);
  }, [imageProps.src]);

    useEffect(() => {
    if(shapeRef.current){
        shapeRef.current.getLayer()?.batchDraw()
    }
  },[img])

  return (
    <Image
      image={img}
      {...imageProps}
      onTransformEnd={onTransformEnd}
      ref={shapeRef}
       draggable
      onDragEnd={(e) => { dispatch({ type: "elements/updateElement", payload: { id: imageProps.id,
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
