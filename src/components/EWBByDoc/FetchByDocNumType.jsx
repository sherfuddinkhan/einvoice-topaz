import React, { useState, useEffect } from "react";
import axios from "axios";

// ---------------------------
// LocalStorage Keys
// ---------------------------
const LOGIN_RESPONSE_KEY = "iris_login_data";
const LATEST_EWB_KEY = "latestEwbData";
const EWB_HISTORY_KEY = "ewbHistory";
const STORAGE_KEY = "EWB_PREVIOUS_DATA";

// ---------------------------
// Safe JSON Helper
// ---------------------------
const getJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || null;
  } catch {
    return null;
  }
};

const FetchByDocNumType = () => {
  // ---------------------------
  // Load Local Data
  // ---------------------------
  const loginData = getJson(LOGIN_RESPONSE_KEY) || {};
  const latestEwb = getJson(LATEST_EWB_KEY) || {};
  const history = getJson(EWB_HISTORY_KEY) || {};
  const savedPayload = getJson(STORAGE_KEY) || {};

  // ---------------------------
  // HEADERS (visible + editable)
  // ---------------------------
  const [headers, setHeaders] = useState({
    Accept: "application/json",
    companyId: loginData?.companyId || "",
    "X-Auth-Token": loginData?.authToken || loginData?.token || "",
    product: "TOPAZ",
  });

  // ---------------------------
  // PAYLOAD (visible + editable)
  // ---------------------------
  const [payload, setPayload] = useState({
    userGstin:
      latestEwb?.response?.fromGstin ||
      loginData?.gstin ||
      loginData?.userGstin ||
      savedPayload?.userGstin ||
      "",
    docType:
      latestEwb?.response?.docType ||
      savedPayload?.docType ||
      "INV", // Default
    docNum:
      latestEwb?.response?.docNo ||
      latestEwb?.docNo ||
      savedPayload?.docNum ||
      "",
  });

  // ---------------------------
  // API Result
  // ---------------------------
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // -------------------------------------------------
  // AUTOFILL on component load
  // -------------------------------------------------
  useEffect(() => {
    // Auto-update payload from latestEWB if available
    setPayload((prev) => ({
      ...prev,
      userGstin:
        latestEwb?.response?.fromGstin ||
        loginData?.gstin ||
        prev.userGstin,

      docNum:
        latestEwb?.response?.docNo ||
        latestEwb?.docNo ||
        prev.docNum,

      docType:
        latestEwb?.response?.docType ||
        prev.docType,
    }));
  }, []);

  // =======================
  // UPDATE HANDLERS
  // =======================
  const updateHeader = (key, value) => {
    setHeaders((prev) => ({ ...prev, [key]: value }));
  };

  const updatePayload = (key, value) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
  };

  // =======================
  // API CALL
  // =======================
  const fetchData = async () => {
    setError(null);
    setResult(null);

    try {
      const res = await axios.get(
        "http://localhost:3001/proxy/topaz/ewb/byDocNumType",
        {
          params: payload,
          headers: headers,
        }
      );

      setResult(res.data);

      // Save payload
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

      // Save latest EWB if present
      if (res.data?.response) {
        localStorage.setItem(LATEST_EWB_KEY, JSON.stringify(res.data));
      }

      // Save history
      const oldHistory = getJson(EWB_HISTORY_KEY) || [];
      localStorage.setItem(
        EWB_HISTORY_KEY,
        JSON.stringify([...oldHistory, res.data])
      );
    } catch (err) {
      setError(err.response?.data || err.message);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "20px auto", fontFamily: "Arial" }}>
      <h2>EWB Lookup by Document Number + Type</h2>

      {/* ----------------------------- */}
      {/* PAYLOAD INPUTS */}
      {/* ----------------------------- */}
      <h3>Payload</h3>

      <label>GSTIN:</label>
      <input
        value={payload.userGstin}
        onChange={(e) => updatePayload("userGstin", e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <label>Document Type:</label>
      <input
        value={payload.docType}
        onChange={(e) => updatePayload("docType", e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <label>Document Number:</label>
      <input
        value={payload.docNum}
        onChange={(e) => updatePayload("docNum", e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button
        onClick={fetchData}
        style={{ padding: "10px 20px", marginTop: 20 }}
      >
        Fetch EWB
      </button>

      {/* ----------------------------- */}
      {/* HEADERS UI */}
      {/* ----------------------------- */}
      <h3 style={{ marginTop: 30 }}>Headers</h3>

      {Object.entries(headers).map(([key, value]) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <strong>{key}</strong>
          <input
            value={value}
            onChange={(e) => updateHeader(key, e.target.value)}
            style={{ width: "100%", marginTop: 5 }}
          />
        </div>
      ))}

      {/* ----------------------------- */}
      {/* SHOW PAYLOAD JSON */}
      {/* ----------------------------- */}
      <h3>Payload JSON</h3>
      <pre style={{ background: "#f5f5f5", padding: 15 }}>
        {JSON.stringify(payload, null, 2)}
      </pre>

      {/* ----------------------------- */}
      {/* API RESPONSE */}
      {/* ----------------------------- */}
      <h3>Response</h3>
      {error && (
        <pre style={{ background: "#fee", padding: 15, color: "red" }}>
          {JSON.stringify(error, null, 2)}
        </pre>
      )}

      {result && (
        <pre style={{ background: "#eef", padding: 15 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default FetchByDocNumType;
