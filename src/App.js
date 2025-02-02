import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [gridSize, setGridSize] = useState(10); // Default grid size
  const [popularColors, setPopularColors] = useState([]);

  const [showUpload, setShowUpload] = useState(true); // Showing the upload form
  const canvasRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (image) {
      analyzeImage();
    }
  }, [image]);

  const getAverageColor = (ctx, x, y, width, height) => {
    const imageData = ctx.getImageData(x, y, width, height);
    const data = imageData.data;

    let r = 0, g = 0, b = 0, count = 0;

    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }

    return `rgba(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)}, 0.3)`;
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
    <div style={{
      background: popularColors.length ? `radial-gradient(circle, ${popularColors[0]} 0%, ${popularColors[1]} 50%, ${popularColors[2]} 100%)` : "#ffffff",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}
      className='App'>
      <div className='upload-form'>
        <input type='file' accept='image/*' onChange={handleImageUpload} />
        {/* <button onClick={analyzeImage} disabled={!image}>Analyze Image</button> */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      <div className='image-container'>
        {image && (
          <div style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center"
          }}>
            {/* Todo : add a box shadow that is black to the image and then add a div that is the same size as the image that will hold the box shadow for the colors */}
            <img
              src={image}
              alt="Uploaded"
              style={{
                maxWidth: "100%",
                // boxShadow: popularColors.length ? `0 0 20px 0px ${popularColors[0]}, 0 0 40px 10px ${popularColors[1]}, 0 0 80px 20px ${popularColors[2]}` : "none"
              }}
            />
          </div>
        )}
      </div>

      <div className='bottom'>
        {/* <h3>Most Pop Colors</h3> */}
        <div style={{ display: "flex" }}>
          {/* {popularColors.map((color, index) => (
            <div key={index} style={{ background: color, width: 50, height: 50, margin: 5, opacity: 0.7 }}>
              {color}
            </div>
          ))} */}
        </div>
      </div>
    </div>
  );
}

export default App;
