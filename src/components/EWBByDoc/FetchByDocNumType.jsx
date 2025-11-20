import React, { useState, useEffect } from "react";
import axios from "axios";

const LOGIN_RESPONSE_KEY = "iris_login_data";
const LATEST_EWB_KEY = "latestEwbData";
const EWB_HISTORY_KEY = "ewbHistory";
const STORAGE_KEY = "EWB_PREVIOUS_DATA";

const FetchByDocNumType = () => {
  // Load saved state
  const savedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  // Load login & previous EWB data
  const loginData = JSON.parse(localStorage.getItem(LOGIN_RESPONSE_KEY) || "{}");
  const latestEwb = JSON.parse(localStorage.getItem(LATEST_EWB_KEY) || "{}");
  const ewbHistory = JSON.parse(localStorage.getItem(EWB_HISTORY_KEY) || "{}");

  // Extract last EWB number if available
  const lastEwbNo =
    latestEwb?.response?.ewbNo ||
    ewbHistory?.response?.ewbNo ||
    "";

  // -----------------------------
  // AUTOFILL FORM DATA
  // -----------------------------
  const [docType, setDocType] = useState(savedData.docType || "INV");
  const [docNum, setDocNum] = useState(savedData.docNum || "");
  const [headers, setHeaders] = useState(
    savedData.headers || {
      accept: "application/json",
      companyId: loginData.companyId || "4",
      "X-Auth-Token": loginData.token || "",
      product: "TOPAZ",
    }
  );

  const [payload, setPayload] = useState(
    savedData.payload || {
      userGstin:
        loginData.userGstin ||
        latestEwb?.response?.fromGstin ||
        "",
      docType: savedData.docType || "INV",
      docNum: savedData.docNum || "",
      tripSheetEwbBills: lastEwbNo ? [lastEwbNo] : [],
    }
  );

  const [response, setResponse] = useState(savedData.response || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // -----------------------------
  // LOCAL STORAGE SYNC
  // -----------------------------
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ docType, docNum, headers, payload, response })
    );
  }, [docType, docNum, headers, payload, response]);

  // -----------------------------
  // HANDLERS
  // -----------------------------
  const handleHeaderChange = (key, value) =>
    setHeaders({ ...headers, [key]: value });

  const handlePayloadChange = (key, value) => {
    setPayload({ ...payload, [key]: value });

    if (key === "docType") setDocType(value);
    if (key === "docNum") setDocNum(value);
  };

  // -----------------------------
  // API CALL (FULLY FIXED)
  // -----------------------------
  const fetchEWB = async () => {
    setLoading(true);
    setError(null);

    try {
     const res = await axios.get(
  "http://localhost:3001/proxy/topaz/ewb/byDocNumType",
  {
    params: {
      userGstin: payload.userGstin,
      docType: payload.docType,
      docNum: payload.docNum,
    },
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json", // ★ REQUIRED
      companyId: headers.companyId,
      "X-Auth-Token": headers["X-Auth-Token"],
      product: "TOPAZ",
    }
  }
);


      const ewbResponse = res.data.response || {};
      setResponse(ewbResponse);

      // Autopopulate trip sheet
      if (ewbResponse.ewbNo) {
        setPayload((prev) => ({
          ...prev,
          tripSheetEwbBills: [ewbResponse.ewbNo],
        }));
      }
    } catch (err) {
      setError(err.response?.data || err.message);
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div style={{ maxWidth: "700px", margin: "20px auto", fontFamily: "Arial" }}>
      <h2>Ewaybill Lookup (Autopopulate)</h2>

      {/* Form Inputs */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          Document Type:
          <input
            type="text"
            value={docType}
            onChange={(e) => handlePayloadChange("docType", e.target.value)}
            style={{ marginLeft: "10px" }}
          />
        </label>

        <br />

        <label>
          Document Number:
          <input
            type="text"
            value={docNum}
            onChange={(e) => handlePayloadChange("docNum", e.target.value)}
            style={{ marginLeft: "10px" }}
          />
        </label>

        <br />

        <label>
          User GSTIN:
          <input
            type="text"
            value={payload.userGstin}
            onChange={(e) => handlePayloadChange("userGstin", e.target.value)}
            style={{ marginLeft: "10px" }}
          />
        </label>

        <br />

        <button
          onClick={fetchEWB}
          style={{ marginTop: "10px", padding: "8px 15px" }}
        >
          {loading ? "Fetching..." : "Fetch EWB"}
        </button>
      </div>

      {/* Headers */}
      <div style={{ marginBottom: "20px" }}>
        <h4>Headers</h4>
        {Object.entries(headers).map(([key, value]) => (
          <div key={key} style={{ marginBottom: "5px" }}>
            <strong>{key}:</strong>
            <input
              style={{ marginLeft: "10px", width: "70%" }}
              value={value}
              onChange={(e) => handleHeaderChange(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Payload */}
      <div style={{ marginBottom: "20px" }}>
        <h4>Payload</h4>
        <pre style={{ background: "#f5f5f5", padding: "10px" }}>
          {JSON.stringify(payload, null, 2)}
        </pre>
      </div>

      {/* API Response */}
      <div>
        <h4>API Response</h4>
        {loading && <p>Loading...</p>}
        {error && (
          <pre style={{ color: "red" }}>{JSON.stringify(error, null, 2)}</pre>
        )}
        {response && (
          <pre style={{ background: "#f0f0f0", padding: "10px" }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};

export default FetchByDocNumType;
