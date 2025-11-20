
import React, { useState, useEffect } from "react";
import axios from "axios";

// LOCAL KEYS
const LOGIN_RESPONSE_KEY = "iris_login_data";
const LATEST_EWB_KEY = "latestEwbData";
const STORAGE_KEY = "EWB_PREVIOUS_DATA";
const HEADER_KEY = "EWB_HEADER_DATA";

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
    docNumList: [""]
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  // ======================================
  // 🔥 AUTOFILL FROM LOCALSTORAGE + LOGIN
  // ======================================
  useEffect(() => {
    const login = JSON.parse(localStorage.getItem(LOGIN_RESPONSE_KEY) || "{}");
    const latest = JSON.parse(localStorage.getItem(LATEST_EWB_KEY) || "{}");
    const savedPayload = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const savedHeader = JSON.parse(localStorage.getItem(HEADER_KEY) || "{}");

    // AUTOFILL HEADERS
    setHeaders(prev => ({
      ...prev,
      companyId: savedHeader?.companyId || login?.companyId || "",
      authToken: savedHeader?.authToken || login?.token || "",
      product: savedHeader?.product || "TOPAZ"
    }));

    // AUTOFILL PAYLOAD
    setPayload(prev => ({
      ...prev,
      userGstin: savedPayload?.userGstin || login?.gstin || "",
      docType: savedPayload?.docType || "INV",
      docNumList:
        savedPayload?.docNumList?.length > 0
          ? savedPayload.docNumList
          : latest?.docNo
          ? [latest.docNo]
          : [""]
    }));
  }, []);

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
