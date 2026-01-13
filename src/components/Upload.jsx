// import { useState } from "react";
// import { uploadMeeting } from "../api";

// export default function Upload({ onResult }) {
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [status, setStatus] = useState("");
//   const [error, setError] = useState(null);

//   const submit = async () => {
//     if (!file) {
//       alert("Please select a video file");
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setProgress(0);
//     setStatus("Starting...");

//     const jobId = crypto.randomUUID();

//     // 🔌 WebSocket for progress updates
//     const ws = new WebSocket(
//       `ws://localhost:8000/ws/progress/${jobId}`
//     );

//     ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       setProgress(data.progress);
//       setStatus(data.message);
//     };

//     ws.onerror = () => {
//       setError("WebSocket connection failed");
//     };

//     try {
//       const result = await uploadMeeting(file);
//       onResult(result);
//       ws.close();
//     } catch (err) {
//       console.error(err);
//       setError("Failed to process meeting");
//       ws.close();
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ marginTop: "20px" }}>
//       <input
//         type="file"
//         accept="video/*"
//         onChange={(e) => setFile(e.target.files[0])}
//       />

//       <br /><br />

//       <button onClick={submit} disabled={loading}>
//         {loading ? "Processing..." : "Process Meeting"}
//       </button>

//       {loading && (
//         <div style={{ marginTop: "10px" }}>
//           <p>{status}</p>
//           <progress value={progress} max="100" style={{ width: "100%" }} />
//         </div>
//       )}

//       {error && (
//         <p style={{ color: "red", marginTop: "10px" }}>
//           {error}
//         </p>
//       )}
//     </div>
//   );
// }

import { useState, useRef } from "react";
import { uploadMeeting } from "../api";

export default function Upload({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // -----------------------------
  // START SCREEN RECORDING
  // -----------------------------
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/webm"
      });

      recordedChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "video/webm"
        });
        const recordedFile = new File([blob], "meeting-recording.webm", {
          type: "video/webm"
        });
        setFile(recordedFile);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setStatus("Recording screen...");
    } catch (err) {
      console.error(err);
      setError("Screen recording failed");
    }
  };

  // -----------------------------
  // STOP SCREEN RECORDING
  // -----------------------------
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
    setStatus("Recording stopped. Ready to process.");
  };

  // -----------------------------
  // UPLOAD + PROCESS
  // -----------------------------
  const submit = async () => {
    if (!file) {
      alert("Please select or record a video");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);
    setStatus("Uploading...");

    const jobId = crypto.randomUUID();

    const ws = new WebSocket(
      `ws://localhost:8000/ws/progress/${jobId}`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.progress);
      setStatus(data.message);
    };

    try {
      const result = await uploadMeeting(file);
      onResult(result);
      ws.close();
    } catch (err) {
      console.error(err);
      setError("Failed to process meeting");
      ws.close();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>🎥 Record Meeting</h3>

      {!recording && (
        <button onClick={startRecording}>
          ▶ Start Screen Recording
        </button>
      )}

      {recording && (
        <button onClick={stopRecording} style={{ color: "red" }}>
          ⏹ Stop Recording
        </button>
      )}

      <hr />

      <h3>📁 Or Upload Video</h3>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={submit} disabled={loading}>
        {loading ? "Processing..." : "Generate Documentation"}
      </button>

      {loading && (
        <div style={{ marginTop: "10px" }}>
          <p>{status}</p>
          <progress value={progress} max="100" style={{ width: "100%" }} />
        </div>
      )}

      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          {error}
        </p>
      )}
    </div>
  );
}
