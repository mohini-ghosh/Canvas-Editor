import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const Canvas2dEditor = () => {
  const canvasRef = useRef(null);
  const [fabric, setFabric] = useState(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [textInput, setTextInput] = useState("");
  const [drawingMode, setDrawingMode] = useState(false);
  const [brushWidth, setBrushWidth] = useState(5);
  const { canvasId } = useParams();

  // Load Fabric + Firestore
  useEffect(() => {
    let canvasInstance;

    const loadFabric = async () => {
      const module = await import("fabric");
      const fabricObj = module.fabric || module.default || module;

      const canvasWidth = window.innerWidth * 0.65;
      const canvasHeight = window.innerHeight * 0.7;

      canvasInstance = new fabricObj.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: "#fff",
        selection: true,
        isDrawingMode: false,
      });

      const docRef = doc(db, "canvases", canvasId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().canvasData) {
        const savedData = docSnap.data().canvasData;
        canvasInstance.loadFromJSON(savedData, () => {
          canvasInstance.renderAll();
        });
      }

      canvasInstance.freeDrawingBrush = new fabricObj.PencilBrush(canvasInstance);
      canvasInstance.freeDrawingBrush.color = selectedColor;
      canvasInstance.freeDrawingBrush.width = brushWidth;

      setFabric(fabricObj);
      setCanvas(canvasInstance);
    };

    loadFabric();
    return () => {
      if (canvasInstance) canvasInstance.dispose();
    };
  }, [canvasId]);

  // --- Tool Functions ---
  const togglePen = () => {
    if (!canvas) return;
    const newMode = !drawingMode;
    setDrawingMode(newMode);
    canvas.isDrawingMode = newMode;
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = selectedColor;
      canvas.freeDrawingBrush.width = brushWidth;
    }
  };

  const changeBrushWidth = (e) => {
    const width = parseInt(e.target.value);
    setBrushWidth(width);
    if (canvas?.freeDrawingBrush) canvas.freeDrawingBrush.width = width;
  };

  const addRectangle = () => {
    if (!canvas || !fabric) return;
    canvas.add(
      new fabric.Rect({
        left: Math.random() * (canvas.width - 120),
        top: Math.random() * (canvas.height - 120),
        fill: "white",
        stroke: "black",
        strokeWidth: 1,
        width: 100,
        height: 100,
        selectable: true,
      })
    );
  };

  const addCircle = () => {
    if (!canvas || !fabric) return;
    canvas.add(
      new fabric.Circle({
        left: Math.random() * (canvas.width - 100),
        top: Math.random() * (canvas.height - 100),
        radius: 50,
        fill: "white",
        stroke: "black",
        strokeWidth: 1,
        selectable: true,
      })
    );
  };

  const addText = () => {
    if (!canvas || !fabric) return;
    canvas.add(
      new fabric.IText(textInput || "Edit me", {
        left: 200,
        top: 200,
        fill: selectedColor,
        fontSize: 22,
      })
    );
    setTextInput("");
  };

  const deleteSelected = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) canvas.remove(activeObject);
  };

  const updateText = () => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === "i-text") {
      activeObject.text = textInput;
      canvas.renderAll();
      setTextInput("");
    }
  };

  const changeColor = (e) => {
    const color = e.target.value;
    setSelectedColor(color);
    if (canvas?.freeDrawingBrush) canvas.freeDrawingBrush.color = color;

    const activeObject = canvas?.getActiveObject();
    if (activeObject) {
      activeObject.set("fill", color);
      canvas.renderAll();
    }
  };

  const rotateSelected = (angle) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.rotate((activeObject.angle + angle) % 360);
      canvas.renderAll();
    }
  };

  const saveCanvas = async () => {
    if (!canvas) return;
    const canvasJSON = canvas.toJSON();
    try {
      const docRef = doc(db, "canvases", canvasId);
      await updateDoc(docRef, { canvasData: canvasJSON });
      alert("✅ Canvas saved successfully!");
    } catch (error) {
      console.error("Error saving canvas:", error);
      alert("❌ Failed to save canvas!");
    }
  };

  // --- Reusable button style ---
  const buttonStyle = {
    backgroundColor: "#ddd",
    border: "none",
    color: "#000",
    padding: "8px 12px",
    margin: "5px 0",
    borderRadius: "5px",
    cursor: "pointer",
    width: "120px",
  };
  
  //main parent container
  return (
    <div
      style={{
        display: "flex",
        height: "90vh",
        width: "90vw",
        // margin: 0,
        marginLeft:"80px",
        backgroundColor: "#ffffff",
        overflow: "hidden",
      }}
    >
   
      {/* --- Left Toolbar --- */}
      <div
        style={{
          width: "160px",
          backgroundColor: "#f3f3f3",
          // padding: "10px",
          marginTop:"42px",
          marginBottom:"72px",
          marginLeft:"30px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          borderRight: "1px solid #ccc",
        }}
      >
        
         <h3 
          style={{ 
            marginTop: "1px",
            marginBottom: "0px",
            width:"100%", display: "flex",
            alignItems: "center",justifyContent: "center",
            color: "black",
            backgroundColor:"#c4c0c0ff"
          }}>
          Tool Panel
          </h3>
        <hr style={{ width: "100%", borderColor: "#ccc", marginTop: "0px"}} />

        <button style={buttonStyle} onClick={addRectangle}>⬛ Rectangle</button>
        <button style={buttonStyle} onClick={addCircle}>⚪ Circle</button>
        <button style={buttonStyle} onClick={addText}>🅰️ Text</button>
        <button style={buttonStyle} onClick={deleteSelected}>🗑️ Delete</button>
        <button style={buttonStyle} onClick={togglePen}>
          {drawingMode ? "✍️ Pen Off" : "✍️ Pen On"}
        </button>
      </div>

      {/* --- Main Canvas Area --- */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column", // vertical stack
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
          padding: "20px", // adds space from left & right panels
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            border: "1px solid #000",
            cursor: drawingMode ? "crosshair" : "default",
          }}
        />

         <button
          style={{
            ...buttonStyle,
            backgroundColor: "#4CAF50",
            color: "white",
            marginTop: "20px",
          }}
          onClick={saveCanvas}
        >
          Save Canvas
        </button>
      </div>

      {/* --- Right Toolbar --- */}
      <div
        style={{
          width: "160px",
          backgroundColor: "#f3f3f3",
          // padding: "10px",  //for this hr line not taking full width
          marginTop:"42px",
          marginBottom:"72px",
          marginRight:"30px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          borderLeft: "1px solid #ccc",
        }}
      >
        {/* Top Section: Color, Brush, Rotation */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h3 
          style={{ 
            marginTop: "1px",
            marginBottom: "0px",
            width:"100%", display: "flex",
            alignItems: "center",justifyContent: "center",
            color: "black",
            backgroundColor:"#c4c0c0ff"
          }}>
          Properties</h3>
          <hr style={{ width: "100%", borderColor: "#ccc", marginTop: "0px"}} />

          <label style={{ marginTop: "10px", color:"black" }}>🎨 Color</label>
          <input type="color" value={selectedColor} onChange={changeColor} />

          <label style={{ marginTop: "10px", color:"black"}}>🖌️ Brush Width</label>
          <input
            type="number"
            min="1"
            max="50"
            value={brushWidth}
            onChange={changeBrushWidth}
            style={{ width: "60px", marginTop: "5px" }}
          />

          <div style={{ marginTop: "20px", marginLeft:"10px" }}>
            <button style={buttonStyle} onClick={() => rotateSelected(15)}>↻ +15°</button>
            <button style={buttonStyle} onClick={() => rotateSelected(-15)}>↺ -15°</button>
          </div>
        </div>

        {/* Bottom Section: Save Button */}
       
      </div>    
    </div>
  );
};

export default Canvas2dEditor;
