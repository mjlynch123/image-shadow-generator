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

  const getAverageColor = (ctx, x, y, width, height) => {
    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;

    let r = 0, g = 0, b = 0, count = 0;

    for (let i = 0; i < data.leng; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    return `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`;
  }

  const analyzeImage = () => {
    if (!image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = image;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const cols = Math.floor(img.width / gridSize);
      const rows = Math.floor(img.height / gridSize);
      let colorArray = [];

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const color = getAverageColor(
            ctx,
            x * gridSize,
            y * gridSize,
            gridSize,
            gridSize
          );
          colorArray.push(color);
        }
      }

      const colorCount = {};
      colorArray.forEach(color => {
        colorCount[color] = (colorCount[color] || 0) + 1;
      });

      const sortedColors = Object.entries(colorCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(color => color[0]);

      setPopularColors(sortedColors);
    }
  }

  return (
    <div className="App">

    </div>
  );
}

export default App;
