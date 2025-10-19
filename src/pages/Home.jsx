import React from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

const Home = () => {
  const navigate = useNavigate();

  const createNewCanvas = async () => {
    const docRef = await addDoc(collection(db, "canvases"), { canvasData: null });
    navigate(`/canvas/${docRef.id}`);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh", 
        width: "100vw",  
        textAlign: "center",
        backgroundColor: "#f8f2f2ff",
      }}
      >
      
      <h1 style={{ marginBottom: "20px", color: "#333" }}>Canvas Editor </h1>
      <button onClick={createNewCanvas}  
       style={{
          padding: "12px 24px",
          backgroundColor: "#a4bedaff",
          color: "#080707ff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
        }}>
        Create New Canvas
      </button>
    </div>
  );
};

export default Home;
