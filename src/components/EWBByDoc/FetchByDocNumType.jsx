import React, { useState, useEffect } from "react";
import axios from "axios";

const LOGIN_RESPONSE_KEY = "iris_login_data";
const LATEST_EWB_KEY = "latestEwbData";
const EWB_HISTORY_KEY = "ewbHistory";
const STORAGE_KEY = "EWB_PREVIOUS_DATA";

const FetchByDocNumType = () => {
  // -----------------------------
  // UTIL: SAFE LOCALSTORAGE READ
  // -----------------------------
  const getJson = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "{}");
    } catch {
      return {};
    }
  };

  // Load data
  const loginData = getJson(LOGIN_RESPONSE_KEY);
  const latestEwb = getJson(LATEST_EWB_KEY);
  const history = getJson(EWB_HISTORY_KEY);
  const savedData = getJson(STORAGE_KEY);

  // Last EWB no
  const lastEwb =
    latestEwb?.response?.ewbNo ||
    history?.response?.ewbNo ||
    "";

  // -----------------------------
  // STATE
  // -----------------------------
  const [headers, setHeaders] = useState({
    accept: "application/json",
    companyId: loginData.companyId || "",
    "X-Auth-Token": loginData.token || "",
    product: "TOPAZ",
  });

  const [payload, setPayload] = useState({
    docType: savedData.docType || "INV",
    docNum: savedData.docNum || "",
    userGstin:
      loginData.userGstin ||
      latestEwb?.response?.fromGstin ||
      "",
    tripSheetEwbBills: lastEwb ? [lastEwb] : [],
  });

  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // AUTOFILL FROM LOCAL STORAGE
  // -----------------------------
  useEffect(() => {
    const savedEwb = getJson(LATEST_EWB_KEY);

    let ewbs = [];
    let gstin = "";
    let docNum = "";

    // EWB No list
    if (Array.isArray(savedEwb.allEwbs)) {
      ewbs = savedEwb.allEwbs.map((x) => x.ewbNo).filter(Boolean);
    } else if (savedEwb?.response?.ewbNo) {
      ewbs = [savedEwb.response.ewbNo];
    }

    if (ewbs.length === 0) ewbs = ["351010498047"];

    // GSTIN Auto
    gstin =
      savedEwb?.fullApiResponse?.response?.fromGstin ||
      savedEwb?.fromGstin ||
      "";

    // DocNo Auto
    docNum =
      savedEwb?.fullApiResponse?.response?.docNo ||
      savedEwb?.docNo ||
      "";

    setPayload((prev) => ({
      ...prev,
      userGstin: gstin,
      docNum: docNum,
      tripSheetEwbBills: ewbs,
    }));
  }, []);

  // -----------------------------
  // HANDLERS
  // -----------------------------
  const updatePayload = (key, value) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
  };

  const updateHeader = (key, value) => {
    setHeaders((prev) => ({ ...prev, [key]: value }));
  };

  // -----------------------------
  // API REQUEST (GET WITH PARAMS)
  // -----------------------------
  const fetchEWB = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(
        "http://localhost:3001/proxy/topaz/ewb/byDocNumType",
        {
          params: payload,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            companyId: headers.companyId,
            "X-Auth-Token": headers["X-Auth-Token"],
            product: "TOPAZ",
          },
        }
      );

      const data = res.data?.response || {};
      setResponse(data);

      // Store latest EWB if received
      if (data?.ewbNo) {
        setPayload((prev) => ({
          ...prev,
          tripSheetEwbBills: [data.ewbNo],
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
      <h2>Ewaybill Lookup (Auto-Populate)</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Document Type:
          <input
            value={payload.docType}
            onChange={(e) => updatePayload("docType", e.target.value)}
            style={{ marginLeft: "10px" }}
          />
        </label>

        <br />

        <label>
          Document Number:
          <input
            value={payload.docNum}
            onChange={(e) => updatePayload("docNum", e.target.value)}
            style={{ marginLeft: "10px" }}
          />
        </label>

        <br />

        <label>
          User GSTIN:
          <input
            value={payload.userGstin}
            onChange={(e) => updatePayload("userGstin", e.target.value)}
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
      <h4>Headers</h4>
      {Object.entries(headers).map(([key, value]) => (
        <div key={key} style={{ marginBottom: "8px" }}>
          <strong>{key}: </strong>
          <input
            value={value}
            onChange={(e) => updateHeader(key, e.target.value)}
            style={{ marginLeft: "10px", width: "70%" }}
          />
        </div>
      ))}

      {/* Payload */}
      <h4>Payload</h4>
      <pre style={{ background: "#f5f5f5", padding: "10px" }}>
        {JSON.stringify(payload, null, 2)}
      </pre>

      {/* API Response */}
      <h4>API Response</h4>
      {error && <pre style={{ color: "red" }}>{JSON.stringify(error, null, 2)}</pre>}
      {response && (
        <pre style={{ background: "#eee", padding: "10px" }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default FetchByDocNumType;
