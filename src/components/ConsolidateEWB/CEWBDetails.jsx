import React, { useState, useEffect } from "react";
import axios from "axios";

// LocalStorage keys
const LOGIN_RESPONSE_KEY = "iris_login_data";
const LATEST_EWB_KEY = "latestEwbData";

// Helper to get data from localStorage
const getLocalStorageData = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
};

const CEWBDetails = () => {
  const [authData, setAuthData] = useState({ token: "", companyId: "", userGstin: "" });
  const [headers, setHeaders] = useState({
    "X-Auth-Token": "",
    companyId: "",
    product: "TOPAZ",
    "Content-Type": "application/json",
    accept: "application/json",
  });
  const [payload, setPayload] = useState({});
  const [payloadText, setPayloadText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  useEffect(() => {
    const login = getLocalStorageData(LOGIN_RESPONSE_KEY);
    const savedEwbData = getLocalStorageData(LATEST_EWB_KEY);

    const gstin = login.userGstin || "";
    const companyId = login.companyId || 4;
    const token = login.token || "";

    setAuthData({ token, companyId, userGstin: gstin });

    // Headers
    setHeaders({
      "X-Auth-Token": token,
      companyId,
      product: "TOPAZ",
      "Content-Type": "application/json",
      accept: "application/json",
    });

    // Auto-populate tripSheetEwbBills
    let previousEwbs = [];
    if (savedEwbData) {
      if (Array.isArray(savedEwbData.allEwbs)) {
        previousEwbs = savedEwbData.allEwbs.map(item => item.ewbNo).filter(Boolean);
      } else if (savedEwbData.ewbNo) {
        previousEwbs = [savedEwbData.ewbNo];
      }
    }
    if (previousEwbs.length === 0) previousEwbs = ["351010498047"]; // fallback

    // Initial payload
    const initialPayload = {
      fromPlace: savedEwbData?.cewbResponse?.fromPlace || "Akodiya",
      fromState: savedEwbData?.cewbResponse?.fromStateCode || 5,
      vehicleNo: savedEwbData?.cewbResponse?.vehicleNo || "RJ14CA9999",
      transMode: savedEwbData?.cewbResponse?.transMode || 1,
      transDocNo: savedEwbData?.cewbResponse?.transDocNo || "1212",
      transDocDate: savedEwbData?.cewbResponse?.transDocDate || "15/11/2025",
      tripSheetEwbBills: previousEwbs,
      companyId,
      userGstin: gstin,
    };

    setPayload(initialPayload);
    setPayloadText(JSON.stringify(initialPayload, null, 2));
  }, []);

  // Handle editable payload textarea
  const handlePayloadChange = (text) => {
    setPayloadText(text);
    try {
      const parsed = JSON.parse(text);
      setPayload(parsed);
      setError("");
    } catch {
      setError("Invalid JSON format");
    }
  };

  // Handle editable headers
  const handleHeaderChange = (key, value) => setHeaders({ ...headers, [key]: value });

  // Submit CEWB generation
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await axios.post(
        "http://localhost:3001/proxy/topaz/cewb/generate",
        payload,
        { headers }
      );
      setResponse(res.data);

      // Save CEWB response to localStorage
      const saved = getLocalStorageData(LATEST_EWB_KEY);
      const allEwbs = saved.allEwbs || [];
      if (res.data.response?.cEwbNo) {
        allEwbs.push({ ewbNo: res.data.response.cEwbNo });
      }
      localStorage.setItem(LATEST_EWB_KEY, JSON.stringify({ ...saved, cewbResponse: res.data.response, allEwbs }));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setResponse(err.response?.data || null);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "20px", fontFamily: "Arial" }}>
      <h2>Generate Consolidated E-Way Bill (CEWB)</h2>

      {/* Editable Headers */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Headers</h3>
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} style={{ marginBottom: "5px" }}>
            <strong>{key}:</strong>
            <input
              style={{ width: "80%", marginLeft: "10px" }}
              value={value}
              onChange={(e) => handleHeaderChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Editable Payload */}
      <div style={{ marginBottom: "20px" }}>
        <h3>Payload JSON</h3>
        <textarea
          rows={14}
          style={{ width: "100%", fontFamily: "monospace" }}
          value={payloadText}
          onChange={(e) => handlePayloadChange(e.target.value)}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>

      <button
        onClick={handleSubmit}
        style={{ padding: "10px 20px", cursor: "pointer" }}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate CEWB"}
      </button>

      {/* Response */}
      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>API Response</h3>
          <pre style={{ background: "#f5f5f5", padding: "10px", overflow: "auto" }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {/* Final payload preview */}
      <div style={{ marginTop: "20px", border: "1px solid #ddd", padding: "10px", borderRadius: "4px" }}>
        <h3>Final Payload</h3>
        <pre style={{ background: "#f5f5f5", padding: "10px", overflow: "auto" }}>
          {JSON.stringify(payload, null, 2)}
        </pre>
        <h3>Headers</h3>
        <pre style={{ background: "#f5f5f5", padding: "10px", overflow: "auto" }}>
          {JSON.stringify(headers, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default CEWBDetails;
