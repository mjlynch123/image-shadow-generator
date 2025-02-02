import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [gridSize, setGridSize] = useState(10); // Default grid size
  const [popularColors, setPopularColors] = useState([]);

  const [showUpload, setShowUpload] = useState(true); // Showing the upload form
  const canvasRef = useRef(null);

  // Handling the upload of the image
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="App">

    </div>
  );
}

export default App;
