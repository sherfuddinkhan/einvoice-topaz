
import api from "../../api/irisgstApi";

import React, { useState, useEffect } from "react";
import axios from "axios";

// LocalStorage keys
const LOGIN_RESPONSE_KEY = "iris_login_data";
const LATEST_CEWB_KEY = "latestCewbData";

// Helper to safely get JSON from localStorage
const getLocalStorageData = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
};

const ByDocNumType = () => {
  const [authData, setAuthData] = useState({ token: "", companyId: "", userGstin: "" });
  const [headers, setHeaders] = useState({
    "X-Auth-Token": "",
    companyId: "",
    product: "TOPAZ",
    Accept: "application/json",
  });
  const [payload, setPayload] = useState({
    userGstin: "",
    cEwbNo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [response, setResponse] = useState(null);

  // Auto-populate auth + payload from last login + CEWB
  useEffect(() => {
    const login = getLocalStorageData(LOGIN_RESPONSE_KEY);
    const lastCewb = getLocalStorageData(LATEST_CEWB_KEY)?.response || {};

    const gstin = login.userGstin || lastCewb.userGstin || "";
    const companyId = login.companyId || 4;

    setAuthData({ token: login.token || "", companyId, userGstin: gstin });
    setHeaders({
      "X-Auth-Token": login.token || "",
      companyId,
      product: "TOPAZ",
      Accept: "application/json",
    });

    setPayload({
      userGstin: gstin,
      cEwbNo: lastCewb.cEwbNo || "",
    });
  }, []);

  const handleHeaderChange = (key, value) => setHeaders({ ...headers, [key]: value });
  const handlePayloadChange = (key, value) => setPayload({ ...payload, [key]: value });

  const handleFetch = async () => {
    if (!payload.userGstin || !payload.cEwbNo) return setError("User GSTIN and CEWB Number are required");

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await axios.get(
        `axios.get("http://localhost:3001/proxy/topaz/cewb/details", { params, headers });`,
        {
          headers,
          params: {
            userGstin: payload.userGstin,
            cEwbNo: payload.cEwbNo,
          },
        }
      );
      setResponse(res.data);

      // Save last fetched CEWB to localStorage
      localStorage.setItem(LATEST_CEWB_KEY, JSON.stringify({ response: res.data.response || {} }));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setResponse(err.response?.data || null);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "20px" }}>
      <h2>Fetch Consolidated E-Way Bill Details</h2>

      {/* Editable headers */}
      <div>
        <h3>Headers</h3>
        {Object.entries(headers).map(([key, value]) => (
          <div key={key}>
            <strong>{key}</strong>
            <input
              value={value}
              onChange={(e) => handleHeaderChange(key, e.target.value)}
              style={{ width: "80%", marginBottom: "5px" }}
            />
          </div>
        ))}
      </div>

      {/* Editable payload */}
      <div style={{ marginTop: "10px" }}>
        <h3>Payload</h3>
        <div>
          <label>User GSTIN:</label>
          <input
            value={payload.userGstin}
            onChange={(e) => handlePayloadChange("userGstin", e.target.value)}
            style={{ width: "50%", marginLeft: "10px", padding: "5px" }}
          />
        </div>
        <div style={{ marginTop: "5px" }}>
          <label>CEWB Number:</label>
          <input
            value={payload.cEwbNo}
            onChange={(e) => handlePayloadChange("cEwbNo", e.target.value)}
            style={{ width: "50%", marginLeft: "10px", padding: "5px" }}
          />
        </div>
      </div>

      <button
        onClick={handleFetch}
        style={{ marginTop: "15px", padding: "10px 20px" }}
      >
        {loading ? "Fetching..." : "Fetch CEWB Details"}
      </button>

      {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

      {response && (
        <div style={{ marginTop: "20px" }}>
          <h3>API Response:</h3>
          <pre style={{ background: "#f5f5f5", padding: "10px", overflow: "auto" }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      {/* Request info */}
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

export default ByDocNumType;
