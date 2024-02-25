import React, { useState } from "react";
import "./App.css"; 
import axios from "axios";

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [classificationResult, setClassificationResult] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("", file);

      setClassificationResult("Loading ... ");

      try {
        const response = await axios.post(
          "http://0.0.0.0:3000/dev/predict",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setClassificationResult(response.data.message);
      } catch (error) {
        console.error(`couldn't send the request ${error}`);
      }
    }
  };

  return (
    <div className="app">
      <h1 className="title">Flowers Multiclass-Classification</h1>
      <h3>
        This little project aims to demostrate an end-to-end workflow for an
        image multiclass classification task
      </h3>
      <h3>
        Choose a file with the image of a rose, daisy, dandelion, sunflower or tulip, so it can classify it ! 
      </h3>
      <br></br>
      <label htmlFor="upload" className="custom-file-upload">
        <input
          id="upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
      </label>
      {selectedImage && (
        <div className="image-container">
          <h4 className="subtitle">Selected Image:</h4>
          <img src={selectedImage} alt="Selected" className="selected-image" />
          <br></br>
        </div>
      )}

      {classificationResult ? (
        <h2 className="subtitle">{classificationResult}</h2>
      ) : (
        <></>
      )}
    </div>
  );
}
