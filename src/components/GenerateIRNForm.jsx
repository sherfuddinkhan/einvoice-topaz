import React, { useState } from "react";
import axios from "axios";

const GetIRNForm = ({ shared }) => {
  const [ewbNo, setEwbNo] = useState("");
  const [headers, setHeaders] = useState({
    Authorization: `Bearer ${shared.token}`,
    "Content-Type": "application/json"
  });
  const [payload, setPayload] = useState({});
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Send Request
  const handleFetch = async () => {
    if (!ewbNo) return alert("Enter EWB Number");

    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await axios.get(
        `/irisgst/topaz/api/v0.3/getewb/ewbNo?ewbNo=${ewbNo}`,
        {
          headers: headers,
          params: payload
        }
      );
      setResponse(res.data);
    } catch (err) {
      setError(err.response?.data || { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", fontFamily: "Arial" }}>
      <h2>Fetch Ewaybill from NIC</h2>

      {/* EWB Number */}
      <div style={{ marginBottom: "10px" }}>
        <label>EWB Number: </label>
        <input
          value={ewbNo}
          onChange={(e) => setEwbNo(e.target.value)}
          placeholder="Enter EWB Number"
          style={{ width: "300px", marginLeft: "10px" }}
        />
      </div>

      {/* Headers */}
      <div style={{ marginBottom: "10px" }}>
        <h3>Headers (Editable)</h3>
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} style={{ marginBottom: "5px" }}>
            <input
              value={key}
              readOnly
              style={{ width: "120px", marginRight: "5px" }}
            />
            <input
              value={value}
              onChange={(e) =>
                setHeaders({ ...headers, [key]: e.target.value })
              }
              style={{ width: "400px" }}
            />
          </div>
        ))}
      </div>

      {/* Payload */}
      <div style={{ marginBottom: "10px" }}>
        <h3>Payload / Query Params (Editable)</h3>
        <textarea
          rows={5}
          style={{ width: "100%" }}
          value={JSON.stringify(payload, null, 2)}
          onChange={(e) => {
            try {
              setPayload(JSON.parse(e.target.value));
            } catch {
              // ignore parse errors
            }
          }}
        />
      </div>

      {/* Send Button */}
      <button onClick={handleFetch} style={{ padding: "8px 12px", marginBottom: "20px" }}>
        Fetch
      </button>

      {/* Response */}
      <div>
        <h3>Response</h3>
        {loading && <p>Loading...</p>}
        {error && (
          <pre style={{ color: "red", background: "#f5f5f5", padding: "10px" }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        )}
        {response && (
          <pre style={{ background: "#f5f5f5", padding: "10px", maxHeight: "500px", overflowY: "auto" }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default GetIRNForm;
