import React, { useState, useEffect } from "react";
import axios from "axios";

// LOCAL KEYS
const LOGIN_KEY = "iris_login_data";
const LATEST_EWB_KEY = "latestEwbData";
const PAYLOAD_KEY = "EWB_PREVIOUS_DATA";
const HEADER_KEY = "EWB_HEADER_DATA";

// Safe JSON load
const getJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
};

const BulkByDocNum = () => {
  // -----------------------------------------
  // HEADER STATE (companyId, token, product)
  // -----------------------------------------
  const [headers, setHeaders] = useState({
    companyId: "",
    authToken: "",
    product: "TOPAZ",
  });

  // -----------------------------------------
  // PAYLOAD STATE
  // -----------------------------------------
  const [payload, setPayload] = useState({
    userGstin: "",
    docType: "INV",
    docNumList: [""],
  });

  const [payloadText, setPayloadText] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // 🔥 AUTOFILL EVERYTHING FROM LOGIN + LATEST EWB + SAVED DATA
  // ============================================================
  useEffect(() => {
    const login = getJson(LOGIN_KEY);
    const savedEwb = getJson(LATEST_EWB_KEY);
    const savedHeader = getJson(HEADER_KEY);
    const savedPayload = getJson(PAYLOAD_KEY);

    // ------------------------------------
    // AUTO-FILL HEADERS
    // ------------------------------------
    const newHeaders = {
      companyId: savedHeader.companyId || login.companyId || "",
      authToken: savedHeader.authToken || login.token || "",
      product: savedHeader.product || "TOPAZ",
    };
    setHeaders(newHeaders);

    // ------------------------------------
    // AUTO-FILL userGstin (from latestEwb)
    // ORDER:
    //   fullApiResponse.response.fromGstin
    //   savedEwb.fromGstin
    //   savedPayload.userGstin
    //   login.gstin
    // ------------------------------------
    let gstin =
      savedEwb?.fullApiResponse?.response?.fromGstin ||
      savedEwb?.fromGstin ||
      savedPayload?.userGstin ||
      login?.gstin ||
      "";

    // ------------------------------------
    // AUTO-FILL docNumList
    // ------------------------------------
    let docNum =
      savedEwb?.fullApiResponse?.response?.transDocNo ||
      savedEwb?.transDocNo ||
      savedPayload?.docNumList?.[0] ||
      "";

    const newPayload = {
      userGstin: gstin,
      docType: savedPayload.docType || "INV",
      docNumList: [docNum],
    };

    setPayload(newPayload);
    setPayloadText(JSON.stringify(newPayload, null, 2));
  }, []);

  // ============================================================
  // JSON TEXT AREA EDITOR
  // ============================================================
  const handlePayloadChange = (text) => {
    setPayloadText(text);
    try {
      const parsed = JSON.parse(text);
      setPayload(parsed);
      setError("");
      localStorage.setItem(PAYLOAD_KEY, JSON.stringify(parsed));
    } catch {
      setError("❌ Invalid JSON");
    }
  };

  // ============================================================
  // HEADER UPDATE
  // ============================================================
  const handleHeaderChange = (field, value) => {
    const updated = { ...headers, [field]: value };
    setHeaders(updated);
    localStorage.setItem(HEADER_KEY, JSON.stringify(updated));
  };

  // ============================================================
  // PAYLOAD FIELD UPDATE
  // ============================================================
  const handlePayloadField = (field, value) => {
    const updated = { ...payload, [field]: value };
    setPayload(updated);
    localStorage.setItem(PAYLOAD_KEY, JSON.stringify(updated));
    setPayloadText(JSON.stringify(updated, null, 2));
  };

  // ============================================================
  // MULTIPLE DOC NUMBERS
  // ============================================================
  const handleDocNumChange = (index, value) => {
    const list = [...payload.docNumList];
    list[index] = value;
    const updated = { ...payload, docNumList: list };
    setPayload(updated);
    localStorage.setItem(PAYLOAD_KEY, JSON.stringify(updated));
    setPayloadText(JSON.stringify(updated, null, 2));
  };

  const addDocNumRow = () => {
    const updated = {
      ...payload,
      docNumList: [...payload.docNumList, ""],
    };
    setPayload(updated);
    localStorage.setItem(PAYLOAD_KEY, JSON.stringify(updated));
    setPayloadText(JSON.stringify(updated, null, 2));
  };

  // ============================================================
  // 🔥 SUBMIT API
  // ============================================================
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setResponse(null);

      const res = await axios.post(
        "http://localhost:3001/proxy/topaz/ewb/bulkByDocNum",
        payload,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            companyId: headers.companyId,
            "X-Auth-Token": headers.authToken,
            product: headers.product,
          },
        }
      );

      setResponse(res.data);
    } catch (err) {
      setResponse(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================
  return (
    <div style={{ padding: 20, width: "700px" }}>
      <h2>EWB Bulk Fetch (By Doc Number)</h2>

      {/* ======================= HEADERS ======================= */}
      <div style={{ background: "#f7f7f7", padding: 15, marginBottom: 20 }}>
        <h3>Headers</h3>

        <label>Company ID (Header)</label>
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

      {/* ======================= PAYLOAD ======================= */}
      <div style={{ background: "#eef7ff", padding: 15 }}>
        <h3>Payload</h3>

        <label>User GSTIN:</label>
        <input
          value={payload.userGstin}
          onChange={(e) => handlePayloadField("userGstin", e.target.value)}
          style={{ width: "100%", marginBottom: 10 }}
        />

        <label>Doc Type:</label>
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

        <label>Document Numbers:</label>
        {payload.docNumList.map((v, i) => (
          <input
            key={i}
            value={v}
            onChange={(e) => handleDocNumChange(i, e.target.value)}
            style={{ width: "100%", marginBottom: 6 }}
          />
        ))}

        <button onClick={addDocNumRow} style={{ marginTop: 10 }}>
          + Add More
        </button>
      </div>

      {/* ======================= JSON EDITOR ======================= */}
      <h3 style={{ marginTop: 20 }}>Payload JSON</h3>
      <textarea
        rows={12}
        value={payloadText}
        onChange={(e) => handlePayloadChange(e.target.value)}
        style={{ width: "100%", fontFamily: "monospace" }}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ======================= SUBMIT ======================= */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{ marginTop: 20, padding: 10, fontSize: 16 }}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>

      {/* ======================= RESPONSE ======================= */}
      {response && (
        <pre
          style={{
            background: "#eee",
            marginTop: 20,
            padding: 10,
            borderRadius: 6,
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default BulkByDocNum;
