import React, { useState, useEffect, useRef } from 'react';
import defaultImage from './Assets/Images/Main.png';
import './App.css';

function App() {
  const [image, setImage] = useState(defaultImage);
  const [gridSize] = useState(10);
  const [popularColors, setPopularColors] = useState([]);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    handleImageUpload(file);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    document.body.classList.remove("dragging");

    const file = event.dataTransfer.files[0];
    handleImageUpload(file);
  };

  useEffect(() => {
    const handleDragOver = (event) => {
      event.preventDefault();
      document.body.classList.add("dragging");
    };

    const handleDragLeave = () => {
      document.body.classList.remove("dragging");
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

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

    return `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`;
  };

  const rgbToHue = (r, g, b) => {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let hue = 0;

    if (max !== min) {
      if (max === r) hue = (g - b) / (max - min);
      else if (max === g) hue = 2 + (b - r) / (max - min);
      else hue = 4 + (r - g) / (max - min);
      hue = Math.round(hue * 60);
      if (hue < 0) hue += 360;
    }

    return hue;
  };

  const filterUniqueColors = (colors) => {
    const uniqueColors = [];
    const seenHues = new Set();

    colors.forEach((color) => {
      const match = color.match(/\d+/g);
      if (!match) return;

      const [r, g, b] = match.map(Number);
      const hue = rgbToHue(r, g, b);

      // Check if the hue is sufficiently different from already seen hues
      if (![...seenHues].some((h) => Math.abs(h - hue) < 30)) {
        uniqueColors.push(color);
        seenHues.add(hue);
      }
    });

    return uniqueColors;
  };

  const analyzeImage = () => {
    if (!image || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "Anonymous";
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
          const color = getAverageColor(ctx, x * gridSize, y * gridSize, gridSize, gridSize);
          colorArray.push(color);
        }
      }

      const colorCount = {};
      colorArray.forEach((color) => {
        colorCount[color] = (colorCount[color] || 0) + 1;
      });

      let sortedColors = Object.entries(colorCount)
        .sort((a, b) => b[1] - a[1])
        .map((color) => color[0]);

      // Filter for unique hues
      let uniqueColors = filterUniqueColors(sortedColors);

      if (uniqueColors.length < 3) {
        uniqueColors = uniqueColors.concat(["rgb(204, 204, 204)", "rgb(77, 77, 77)", "rgb(13, 13, 13)"]).slice(0, 3);
      }

      setPopularColors([...uniqueColors]);
    };
  };

  const generateSplotchyGradient = () => {
    if (popularColors.length === 0)
      return "linear-gradient(315deg, rgba(204, 204, 204, 0.6), rgba(77, 77, 77, 0.6), rgba(13, 13, 13, 0.6))";

    const splotches = popularColors.map((color, i) => {
      const x = Math.random() * 100; // Random X position
      const y = Math.random() * 100; // Random Y position
      const size = Math.random() * 50 + 20; // Random size between 20% and 70%
      return `radial-gradient(circle at ${x}% ${y}%, ${color} 0%, transparent ${size}%)`;
    });

    return splotches.join(", ");
  };

  return (
    <div
      style={{
        background: generateSplotchyGradient(),
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
      className="App"
      onClick={handleClick}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div className='instructions'>
        <h1>Reactive Gradient</h1>
        <p>Gradient will change upon adding an image</p>
        <h3>Click or Drop an Image on screen</h3>
      </div>

      <div className="image-container" style={{ marginTop: "20px" }}>
        {image && (
          <img
            src={image}
            alt="Uploaded"
            style={{
              maxWidth: "90vw",
              maxHeight: "60vh",
              borderRadius: "15px",
              boxShadow: "0px 0px 50px rgba(0,0,0,0.3)",
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;