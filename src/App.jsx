import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CanvasEditor from "./components/Canvas2d_editor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/canvas/:canvasId" element={<CanvasEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



