import { useDispatch } from "react-redux";
import { addCircle, addElement, addRectangle, addText } from "../../store/slice.js";

function Sidebar() {
    const dispatch = useDispatch()
    const handleImageUpload = (event)=>{
        const file = event.target.files[0];
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
        reader.readAsDataURL(file);
    }
    return <>
        <div style={{ width: 200, padding: 10, borderRight: '1px solid #ccc' }}>
            <h3>Tools</h3>
            <button onClick={() => dispatch(addText())}>Add Text</button>
            <button onClick={() => dispatch(addRectangle())}>Add Rectangle</button>
            <button onClick={() => dispatch(addCircle())}>Add Circle</button>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
            />
        </div>
        
    </>
}

export default Sidebar;