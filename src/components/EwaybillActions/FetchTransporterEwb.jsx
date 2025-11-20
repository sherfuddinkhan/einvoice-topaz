import React, { useState, useEffect } from "react";
import axios from "axios";

const LOGIN_RESPONSE_KEY = "iris_login_data";
const LATEST_EWB_KEY = "latestEwbData";

const FetchTransporterEwb = () => {
  const [payload, setPayload] = useState({
    date: "",
    userGstin: "",
    page: "1",
    size: "10",
    updateNeeded: true,
  });

  const [headers, setHeaders] = useState({
    "X-Auth-Token": "",
    companyId: "",
    product: "TOPAZ",
    "Content-Type": "application/json",
  });

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Format DD/MM/YYYY → YYYY-MM-DD
  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toISOString().split("T")[0];
    const parts = dateStr.includes("/") ? dateStr.split("/") : dateStr.split("-");
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dateStr;
  };

  // Auto-populate from last login & last EWB
  useEffect(() => {
    const login = JSON.parse(localStorage.getItem(LOGIN_RESPONSE_KEY) || "{}");
    const lastEwb = JSON.parse(localStorage.getItem(LATEST_EWB_KEY) || "{}");
    const lastResponse = lastEwb?.response || {};

    // Auto-populate payload
    setPayload({
      date: formatDate(lastResponse.ewbDate || lastResponse.transDocDate),
      userGstin:
        lastResponse.userGstin ||
        lastResponse.fromGstin ||
        login.userGstin ||
        "",
      page: "1",
      size: "10",
      updateNeeded: true,
    });

    // Auto-populate headers
    setHeaders({
      "X-Auth-Token": login.token || "",
      companyId: login.companyId || "",
      product: "TOPAZ",
      "Content-Type": "application/json",
    });
  }, []);

  const handleFetch = async () => {
    if (!payload.date || !payload.userGstin) {
      return alert("Please provide Date and User GSTIN");
    }

    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const res = await axios.get(
        "http://localhost:3001/proxy/topaz/ewb/fetchTransporter",
        {
          headers,
          params: payload,
        }
      );

      setResponse(res.data);

      // Save latest EWB response locally
      localStorage.setItem(
        LATEST_EWB_KEY,
        JSON.stringify({
          ...JSON.parse(localStorage.getItem(LATEST_EWB_KEY) || "{}"),
          response: res.data.response || {},
        })
      );
    } catch (err) {
      setError(err.response?.data || { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", fontFamily: "Arial" }}>
      <h2>Fetch Transporter EWB (Auto-populated)</h2>

      {/* Headers */}
      <div style={{ marginBottom: "10px" }}>
        <h3>Headers (Editable)</h3>
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} style={{ marginBottom: "5px" }}>
            <input value={key} readOnly style={{ width: "140px", marginRight: "5px" }} />
            <input
              value={value}
              onChange={(e) => setHeaders({ ...headers, [key]: e.target.value })}
              style={{ width: "400px" }}
            />
          </div>
        ))}
      </div>

      {/* Payload */}
      <div style={{ marginBottom: "10px" }}>
        <h3>Payload (Editable)</h3>
        <textarea
          rows={8}
          style={{ width: "100%" }}
          value={JSON.stringify(payload, null, 2)}
          onChange={(e) => {
            try {
              setPayload(JSON.parse(e.target.value));
            } catch {}
          }}
        />
      </div>

      <button
        onClick={handleFetch}
        style={{ padding: "10px 15px", marginBottom: "20px", cursor: "pointer" }}
      >
        Fetch Transporter
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
          <pre
            style={{
              background: "#f5f5f5",
              padding: "10px",
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default FetchTransporterEwb;
