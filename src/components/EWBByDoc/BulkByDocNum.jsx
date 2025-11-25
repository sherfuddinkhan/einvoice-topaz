
import React, { useState, useEffect } from "react";
import axios from "axios";

// LOCAL KEYS
const LOGIN_RESPONSE_KEY = "iris_login_data";
const LATEST_EWB_KEY = "latestEwbData";
const STORAGE_KEY = "EWB_PREVIOUS_DATA";
const HEADER_KEY = "EWB_HEADER_DATA";
// Helper to read JSON safely
const getLocalStorageData = (key) => {
  try {
    const raw = localStorage.getItem(key);
    console.log(`📥 Loaded ${key}:`, raw);
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
};

const BulkByDocNum = () => {
  // --------------------------
  // HEADER STATE
  // --------------------------
  const [headers, setHeaders] = useState({
    companyId: "",
    authToken: "",
    product: "TOPAZ"
  });
  
  // --------------------------
  // PAYLOAD STATE
  // --------------------------
  const [payload, setPayload] = useState({
    userGstin: "",
    docType: "INV",
    docNumList: [ ]
  });
  const [payloadText, setPayloadText] = useState("");
  const [authData, setAuthData] = useState({ token: "", companyId: "", userGstin: "" });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
   const [error, setError] = useState("");

  // ======================================
  // 🔥 AUTOFILL FROM LOCALSTORAGE + LOGIN
  // ======================================
  useEffect(() => {
    const login = JSON.parse(localStorage.getItem(LOGIN_RESPONSE_KEY) || "{}");
    const savedEwbData = getLocalStorageData(LATEST_EWB_KEY);
    const savedPayload = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const savedHeader = JSON.parse(localStorage.getItem(HEADER_KEY) || "{}");

    // AUTOFILL HEADERS
    setHeaders(prev => ({
      ...prev,
      companyId: savedHeader?.companyId || login?.companyId || "",
      authToken: savedHeader?.authToken || login?.token || "",
      product: savedHeader?.product || "TOPAZ"
    }));
     let transDocNo       = [""];
    let previousGstin    = " ";  // → userGstin (sender's GSTIN)

      // ───── Extract fromGstin → userGstin (as array) ─────
if (savedEwbData?.fullApiResponse?.response?.fromGstin) {
  previousGstin = savedEwbData.fullApiResponse.response.fromGstin;
}
else if (savedEwbData?.fromGstin) {
  previousGstin = savedEwbData.fromGstin;
}

// Fallback GSTIN if still empty
if (previousGstin.length === 0) {
  previousGstin = "05AAAAU1183B5ZW"; // or your default like "351010498047" if preferred
}

// ───── Extract transDocNo→ transDocNo ─────
if (savedEwbData?.fullApiResponse?.response?.transDocNo) {
 transDocNo= [savedEwbData.fullApiResponse.response.transDocNo];
}
else if (savedEwbData?.transDocNo) {
  transDocNo = [savedEwbData.transDocNo];
}
// Fallback transDocNoif still empty
if (transDocNo.length === 0) {
  transDocNo = ["14245"]; // or your default like "351010498047" if preferred
}

  const initialPayload = {
      docNumList: transDocNo,  
      userGstin: previousGstin,
      docType: "INV",
    };

    console.log("📦 Payload:", initialPayload);

    setPayload(initialPayload);
    setPayloadText(JSON.stringify(initialPayload, null, 2));

  }, []);

    // JSON Payload Edit
  // --------------------------
  const handlePayloadChange = (text) => {
    setPayloadText(text);
    try {
      const parsed = JSON.parse(text);
      setPayload(parsed);
      setError("");
    } catch {
      setError("Invalid JSON");
    }
  };

  // Save headers to localStorage
  const saveHeaders = (data) =>
    localStorage.setItem(HEADER_KEY, JSON.stringify(data));

  // Save payload to localStorage
  const savePayload = (data) =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  // --------------------------
  // HANDLE HEADER INPUT CHANGE
  // --------------------------
  const handleHeaderChange = (field, value) => {
    const updated = { ...headers, [field]: value };
    setHeaders(updated);
    saveHeaders(updated);
  };

  // --------------------------
  // HANDLE PAYLOAD INPUT CHANGE
  // --------------------------
  const handlePayloadField = (field, value) => {
    const updated = { ...payload, [field]: value };
    setPayload(updated);
    savePayload(updated);
  };

  const handleDocNumChange = (index, value) => {
    const updatedList = [...payload.docNumList];
    updatedList[index] = value;

    const updatedPayload = { ...payload, docNumList: updatedList };
    setPayload(updatedPayload);
    savePayload(updatedPayload);
  };

  const addDocNumRow = () => {
    const updated = {
      ...payload,
      docNumList: [...payload.docNumList, ""]
    };
    setPayload(updated);
    savePayload(updated);
  };

  // ==========================
  // 🔥 SUBMIT API REQUEST
  // ==========================
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setResponse(null);

      const res = await axios.post(
        "http://localhost:3001/proxy/topaz/ewb/bulkByDocNum",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            companyId: headers.companyId,
            "X-Auth-Token": headers.authToken,
            product: headers.product
          }
        }
      );

      setResponse(res.data);
    } catch (err) {
      setResponse(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // UI
  // ==========================
  return (
    <div style={{ padding: 20, width: "700px" }}>
      <h2>Fetch EWB by DocNum (Bulk) with Headers</h2>

      {/* HEADER SECTION */}
      <div style={{ background: "#fafafa", padding: 15, borderRadius: 8, marginBottom: 20 }}>
        <h3>Headers (Editable)</h3>

        <label>Company ID</label>
        <input
          value={headers.companyId}
          onChange={(e) => handleHeaderChange("companyId", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <label>X-Auth-Token</label>
        <input
          value={headers.authToken}
          onChange={(e) => handleHeaderChange("authToken", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <label>Product</label>
        <input
          value={headers.product}
          onChange={(e) => handleHeaderChange("product", e.target.value)}
          style={{ width: "100%" }}
        />
      </div>

      {/* PAYLOAD SECTION */}
      <div style={{ background: "#f0f8ff", padding: 15, borderRadius: 8 }}>
        <h3>Payload (Editable)</h3>

        <label>GSTIN</label>
        <input
          value={payload.userGstin}
          onChange={(e) => handlePayloadField("userGstin", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <label>Document Type</label>
        <select
          value={payload.docType}
          onChange={(e) => handlePayloadField("docType", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        >
          <option value="INV">INV</option>
          <option value="BIL">BIL</option>
          <option value="BOE">BOE</option>
          <option value="CHL">CHL</option>
          <option value="OTH">OTH</option>
        </select>

        <label>Document Numbers</label>
        {payload.docNumList.map((item, index) => (
          <input
            key={index}
            value={item}
            onChange={(e) => handleDocNumChange(index, e.target.value)}
            style={{ width: "100%", marginBottom: 6 }}
          />
        ))}

        <button onClick={addDocNumRow} style={{ marginTop: 10 }}>
          + Add More Doc Numbers
        </button>
      </div>
       {/* Payload Editor */}
      <div style={{ marginBottom: 20 }}>
        <h3>Payload JSON</h3>
        <textarea
          rows={14}
          value={payloadText}
          style={{ width: "100%", fontFamily: "monospace" }}
          onChange={(e) => handlePayloadChange(e.target.value)}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>


      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: 16
        }}
      >
        {loading ? "Fetching..." : "Submit"}
      </button>

      {/* RESPONSE */}
      {response && (
        <pre
          style={{
            marginTop: 20,
            background: "#eee",
            padding: 10,
            borderRadius: 6
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default BulkByDocNum;
