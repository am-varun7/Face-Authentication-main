import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

function Groupauthenticate(){
    const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [identifiedPerson, setIdentifiedPerson] = useState(null);
  const [message, setMessage] = useState("");
  const [personsIdentified, setPersonsIdentified] = useState([]);
  const [capturing, setCapturing] = useState(false);
  const [showRecapture, setShowRecapture] = useState(false); // New state for recapture button
  const [showReverify, setShowReverify] = useState(false); // New state for reverify button
  const videoRef = useRef(null);
  const navigate = useNavigate(); // Hook to navigate

  // Start webcam video stream
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      setMessage("Error accessing webcam.");
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
    setMessage("Starting authentication...");
    setIsAuthenticating(true);
    setShowRecapture(false); // Hide recapture button when authentication starts
    setShowReverify(false); // Hide reverify button when authentication starts
    startVideo();
  };

  // Capture a frame and send it to the Flask server
  const captureFrame = useCallback(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current?.videoWidth || 0;
    canvas.height = videoRef.current?.videoHeight || 0;
    const context = canvas.getContext("2d");
    context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");

    try {
      // Send the frame to Flask for face detection and embedding generation
      const response = await fetch("http://localhost:5001/generate-embedding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame: dataUrl }),
      });

      const data = await response.json();

      if (!data.faceDetected) {
        setMessage("No face detected, please adjust your position.");
        setShowRecapture(true); // Show recapture button if no face detected
        return;
      }

      // If a face is detected, send the embedding to the backend for authentication
      const backendResponse = await fetch(
        "http://localhost:5000/api/face/authenticate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token"),
          },
          body: JSON.stringify({ embedding: data.embedding }),
        }
      );

      const result = await backendResponse.json();

      if (backendResponse.ok && result.name) {
        setIdentifiedPerson(result.name);
        setMessage(`Identified: ${result.name}`);

        // Add to the identified persons list if not already present
        setPersonsIdentified((prev) => {
          const isPersonExist = prev.some(
            (person) => person.name === result.name
          );
          if (!isPersonExist) {
            return [...prev, { name: result.name, image: dataUrl }];
          }
          return prev;
        });

        // Stop the webcam after a person is identified
        stopVideo(); // Automatically stop authentication after identifying a person
        setCapturing(false); // Stop the frame capturing loop
        setShowRecapture(false); // Hide recapture button after successful identification
        setShowReverify(true); // Show the reverify button after successful authentication
      } else {
        setMessage("Face detected but not recognized.");
        setShowRecapture(true); // Show recapture button if face is detected but not recognized
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      setMessage("Error occurred during authentication.");
    }
  }, []); // Empty array means this function won't change unless dependencies change

  // Continuously capture frames while "capturing" is true
  useEffect(() => {
    let interval;
    if (capturing) {
      interval = setInterval(() => {
        captureFrame();
      }, 1000);
    }
    return () => clearInterval(interval); // Cleanup on unmount
  }, [capturing, captureFrame]); // Include captureFrame as a dependency

  // Reset states for recapture and reverify
  const handleRecapture = () => {
    setIdentifiedPerson(null);
    setMessage("");
    setPersonsIdentified([]);
    setShowRecapture(false); // Hide recapture button
    setShowReverify(false); // Hide reverify button
    setIsAuthenticating(false); // Reset authentication state
    startAuthentication(); // Restart the authentication process
  };

  // Handle reverify process
  const handleReverify = () => {
    setMessage(""); // Clear message
    setIdentifiedPerson(null); // Clear identified person
    setPersonsIdentified([]); // Clear the identified persons list
    setShowRecapture(false); // Hide recapture button
    setShowReverify(false); // Hide reverify button
    setIsAuthenticating(false); // Reset the authentication state
    startAuthentication(); // Restart the authentication process
  };

  // Handle Back Button Click
  const handleBack = () => {
    navigate("/Dashboard"); // Navigate back to the dashboard
  };
    return(
        <>
        <div className="auth-container">
      {/* Back button at the top left */}
      <button onClick={handleBack} className="back-button">
        &lt; Back
      </button>

      <h1 className="auth-heading">Group Authentication</h1>
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
          </div>
          <div className="auth-buttons">
            <button
              onClick={startAuthentication}
              disabled={isAuthenticating}
              className="auth-btn auth-btn-success"
            >
              Start Authentication
            </button>
            {showRecapture && (
              <button
                onClick={handleRecapture}
                className="auth-btn auth-btn-warning"
              >
                Recapture
              </button>
            )}
            {showReverify && (
              <button
                onClick={handleReverify}
                className="auth-btn auth-btn-info"
              >
                Reverify
              </button>
            )}
          </div>
          <h3 className="auth-identified-name mt-3">
            {identifiedPerson ? `Identified: ${identifiedPerson}` : ""}
          </h3>
          <p className="auth-message">{message}</p>

          {/* List of identified persons */}
          {personsIdentified.length > 0 && (
            <div className="identified-persons">
              <h3 className="identified-persons-heading mt-4">
                Persons Identified
              </h3>
              <ul className="identified-persons-list">
                {personsIdentified.map((person, index) => (
                  <li key={index} className="identified-person-item">
                    <img
                      src={person.image}
                      alt={person.name}
                      className="identified-person-image"
                    />
                    {person.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
        </>
    );
}
export default Groupauthenticate;