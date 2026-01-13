import { useState } from "react";
import Upload from "./components/Upload";
import Result from "./components/Result";
import History from "./components/History";

export default function App() {
  const [result, setResult] = useState(null);
  const [page, setPage] = useState("upload");

  return (
    <div style={{ padding: "20px" }}>
      <h1>AI Meeting → Documentation</h1>

      {/* Navigation */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setPage("upload")}>
          🆕 New Meeting
        </button>
        <button
          onClick={() => setPage("history")}
          style={{ marginLeft: "10px" }}
        >
          📚 History
        </button>
      </div>

      {page === "upload" && (
        <>
          <Upload onResult={setResult} />
          <Result data={result} />
        </>
      )}

      {page === "history" && <History />}
    </div>
  );
}
