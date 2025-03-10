import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./AuthenticationCard.css";

const Authentication = () => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [identifiedPerson, setIdentifiedPerson] = useState(null);
  const [message, setMessage] = useState("");
  const [personsIdentified, setPersonsIdentified] = useState([]);
  const [capturing, setCapturing] = useState(false);
  const [showRecapture, setShowRecapture] = useState(false);
  const [showReverify, setShowReverify] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Start webcam video stream
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      setMessage(`Error accessing webcam: ${error.message}`);
      stopVideo();
    }
  };

  // Stop webcam video stream
  const stopVideo = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  // Start authentication process
  const startAuthentication = () => {
    setCapturing(true);
    setMessage("Starting authentication... Please face the camera");
    setIsAuthenticating(true);
    setShowRecapture(false);
    setShowReverify(false);
    setIsLoading(true);
    startVideo().then(() => {
      // Give time for camera to initialize
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    });
  };

  // Capture a frame and send it to the Flask server
  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !videoRef.current.videoWidth) {
      console.log("Video not ready yet");
      return;
    }

    try {
      setIsLoading(true);
      
      // Create canvas and get image data
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const context = canvas.getContext("2d");
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");

      // Step 1: Send frame to Flask for face detection and embedding generation
      const response = await fetch("http://localhost:5001/generate-embedding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame: dataUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Flask server error: ${errorData.message || 'Unknown error'}`);
      }

      const data = await response.json();

      if (!data.faceDetected) {
        if (data.message === "Multiple faces detected. Please adjust the camera to capture only one face.") {
          setMessage(data.message);
        } else {
          setMessage("No face detected. Please position yourself clearly in front of the camera.");
        }
        setShowRecapture(true);
        setIsLoading(false);
        return;
      }

      // Step 2: Send the embedding to the backend for authentication
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const backendResponse = await fetch(
        "http://localhost:5000/api/face/authenticate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": token,
          }, 
          body: JSON.stringify({ embedding: data.embedding }),
        }
      );

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json();
        throw new Error(`Authentication failed: ${errorData.message || 'Server error'}`);
      }

      const result = await backendResponse.json();

      if (result.name) {
        setIdentifiedPerson(result.name);
        setMessage(`Successfully identified: ${result.name}`);
        console.log("Result Name:", result.name);

        // Store verification record
        try {
          const storeVerificationResponse = await fetch(
            "http://localhost:5000/api/face/store-verification",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "auth-token": token,
              },
              body: JSON.stringify({ labelName: result.name }),
            }
          );
          
          if (!storeVerificationResponse.ok) {
            const verificationError = await storeVerificationResponse.json();
            console.warn("Verification storage note:", verificationError.message);
          }
        } catch (verificationError) {
          console.error("Error storing verification:", verificationError);
          // Non-critical error, don't disrupt the user flow
        }

        // Add to the identified persons list if not already present
        setPersonsIdentified((prev) => {
          const isPersonExist = prev.some(
            (person) => person.name === result.name && person.roll_no === result.roll_no
          );
          
          if (!isPersonExist) {
            return [
              ...prev,
              {
                name: result.name,
                roll_no: result.roll_no,
                image: dataUrl,
              },
            ];
          }
          return prev;
        });

        // Stop the webcam after a person is identified
        stopVideo();
        setCapturing(false);
        setShowRecapture(false);
        setShowReverify(true);
      } else {
        setMessage("Authentication failed: Unknown user detected");
        setShowRecapture(true);
        stopVideo();
        setCapturing(false);
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      setMessage(`Error: ${error.message}`);
      setShowRecapture(true);
      stopVideo();
      setCapturing(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Continuously capture frames while "capturing" is true
  useEffect(() => {
    let interval;
    if (capturing && !isLoading) {
      // First capture after a short delay to ensure camera is ready
      const initialTimeout = setTimeout(() => {
        captureFrame();
      }, 1000);
      
      // Then set up the interval for subsequent captures
      interval = setInterval(() => {
        captureFrame();
      }, 2000); // Increased to 2 seconds to reduce performance issues
      
      return () => {
        clearTimeout(initialTimeout);
        clearInterval(interval);
      };
    }
    return () => clearInterval(interval);
  }, [capturing, captureFrame, isLoading]);

  // Stop the video when the component unmounts
  useEffect(() => {
    return () => {
      stopVideo();
    };
  }, []);

  // Reset states for recapture
  const handleRecapture = () => {
    setIdentifiedPerson(null);
    setMessage("");
    setShowRecapture(false);
    setShowReverify(false);
    setIsAuthenticating(false);
    startAuthentication();
  };

  // Handle reverify process
  const handleReverify = () => {
    setMessage("");
    setIdentifiedPerson(null);
    setShowRecapture(false);
    setShowReverify(false);
    setIsAuthenticating(false);
    startAuthentication();
  };

  // Handle Back Button Click
  const handleBack = () => {
    stopVideo();
    navigate("/Dashboard");
  };

  return (
    <div className="auth-container">
      {/* Back Button */}
      <button onClick={handleBack} className="back-button">
        &lt; Back
      </button>

      <h1 className="auth-heading">Face Authentication</h1>

      <div className="auth-content">
        {/* Authentication Card */}
        <div className="auth-card">
          <div className="auth-card-body">
            <div className="video-container">
              <video
                ref={videoRef}
                width="100%"
                height="auto"
                autoPlay
                muted
                className="auth-video"
              />
              {isLoading && (
                <div className="loading-overlay">
                  <div className="loading-spinner"></div>
                  <p>Processing...</p>
                </div>
              )}
            </div>

            <div className="auth-buttons">
              <button
                onClick={startAuthentication}
                disabled={isAuthenticating && !showRecapture && !showReverify}
                className="auth-btn auth-btn-success"
              >
                Start Authentication
              </button>
              {showRecapture && (
                <button
                  onClick={handleRecapture}
                  className="auth-btn auth-btn-warning"
                  disabled={isLoading}
                >
                  Recapture
                </button>
              )}
              {showReverify && (
                <button
                  onClick={handleReverify}
                  className="auth-btn auth-btn-info"
                  disabled={isLoading}
                >
                  Reverify
                </button>
              )}
            </div>

            <h3 className="auth-identified-name mt-3">
              {identifiedPerson ? `Identified: ${identifiedPerson}` : ""}
            </h3>

            <p className="auth-message">{message}</p>
          </div>
        </div>

        {/* Identified Persons Section */}
        {personsIdentified.length > 0 && (
          <div className="identified-persons">
            <h3 className="identified-persons-heading mt-4">Persons Identified</h3>
            <ul className="identified-persons-list">
              {personsIdentified.map((person, index) => (
                <li key={index} className="identified-person-item">
                  <div className="person-card">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="identified-person-image"
                    />
                    <div className="person-details">
                      <p><strong>Name:</strong> {person.name}</p>
                      <p><strong>Roll No:</strong> {person.roll_no}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Authentication;