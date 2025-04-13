import { useDispatch} from "react-redux";
import { addCircle, addElement, addRectangle, addText, addTriangle, addLine, addStar } from "../../store/slice.js";
import { useState } from "react";

function Sidebar() {
    const dispatch = useDispatch();
    const [images, setImages] = useState([
        'https://images.unsplash.com/photo-1503023345310-bd7c1a2305c6?w=50&h=50',
        'https://images.unsplash.com/photo-1494253109108-2e30c029665a?w=50&h=50',
        'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=50&h=50'
    ]);
    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
      
        const reader = new FileReader();
        reader.onload = () => {
          dispatch(addElement({
            type: "image",
            src: reader.result,
            x: 100,
            y: 100,
            width: 200,
            height: 150,
          }));
        };
        setImages((prevImages)=>[...prevImages,URL.createObjectURL(file)])
        reader.readAsDataURL(file)

    };
    return <>
        <div style={{ width: 200, padding: 10, borderRight: '1px solid #ccc' }}>
            <h3>Tools</h3>          
            <div>
                {images.map((imageUrl, index) => (
                    <button key={index} onClick={() => dispatch(addElement({
                        type: 'image',
                        src: imageUrl,
                        x: 100,
                        y: 100,
                        width: 200,
                        height: 150,
                      }))} style={{padding:0,border:0}}>
                      
                        <img  src={imageUrl} alt="Uploaded" style={{ width: '50px', height: '50px', margin: '5px' }} />
                    
                    </button>
                ))}
            </div>

            <button onClick={() => dispatch(addText())}>Add Text</button>
            <button onClick={() => dispatch(addRectangle())}>Add Rectangle</button>
            <button onClick={() => dispatch(addCircle())}>Add Circle</button>
            <button onClick={() => dispatch(addTriangle())}>Add Triangle</button> 
            <button onClick={() => dispatch(addLine())}>Add Line</button> 
            <button onClick={() => dispatch(addStar())}>Add Star</button> 
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
            />
        </div>

    </>
}

export default Sidebar;