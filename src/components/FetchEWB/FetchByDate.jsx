import React, { useState, useEffect } from "react";
import api from "../../api/irisgstApi";

const LOGIN_KEY = "iris_login_data";
const LATEST_EWB_KEY = "latestEwbData";

const FetchByDate = () => {
  const [date, setDate] = useState("");
  const [userGstin, setUserGstin] = useState("");

  const [headersUI, setHeadersUI] = useState({});
  const [payloadUI, setPayloadUI] = useState({});
  const [response, setResponse] = useState(null);

  // --------------------------
  // Format DD/MM/YYYY -> YYYY-MM-DD
  // --------------------------
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const [datePart] = dateStr.split(" "); // remove time
    const [dd, mm, yyyy] = datePart.split("/");
    return `${yyyy}-${mm}-${dd}`;
  };

  // --------------------------
  // Load login + latest EWB
  // --------------------------
  useEffect(() => {
    const login = JSON.parse(localStorage.getItem(LOGIN_KEY) || "{}");
    const latest = JSON.parse(localStorage.getItem(LATEST_EWB_KEY) || "{}");

    // Build correct IRIS headers
    const headers = {
      accept: "application/json",
      product: "TOPAZ",
      companyid: login.companyId || "",
      "x-auth-token": login.token || "",
    };
    setHeadersUI(headers);

    // Prefill fields
    setDate(formatDate(latest?.response?.ewbDate));
    setUserGstin(latest?.response?.fromGstin || "");
  }, []);

  // --------------------------
  // Fetch EWB by Date
  // --------------------------
  const fetchEwbs = async () => {
    const payload = {
      date,
      userGstin,
    };

    setPayloadUI(payload);

    try {
      const res = await api.get(
        "http://localhost:3001/proxy/topaz/ewb/fetchByDate",
        {
          params: payload,
          headers: headersUI,
        }
      );

      setResponse(res.data);
    } catch (error) {
      setResponse(error.response?.data || error.message);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>Fetch Generated E-Way Bills by Date</h2>

      {/* DATE */}
      <div>
        <label>Date (YYYY-MM-DD)</label>
        <br />
        <input
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="2025-11-26"
          style={{ padding: 6, width: 200 }}
        />
      </div>

      {/* GSTIN */}
      <div style={{ marginTop: 10 }}>
        <label>User GSTIN</label>
        <br />
        <input
          value={userGstin}
          onChange={(e) => setUserGstin(e.target.value)}
          placeholder="Enter GSTIN"
          style={{ padding: 6, width: 200 }}
        />
      </div>

      <button
        onClick={fetchEwbs}
        style={{
          marginTop: 15,
          padding: "8px 20px",
          cursor: "pointer",
          background: "#1976d2",
          color: "white",
          border: "none",
        }}
      >
        Fetch EWB
      </button>

      {/* HEADERS */}
      <h3>Request Headers</h3>
      <pre style={{ background: "#f3f3f3", padding: 10 }}>
        {JSON.stringify(headersUI, null, 2)}
      </pre>

      {/* PAYLOAD */}
      <h3>Query Parameters (Payload)</h3>
      <pre style={{ background: "#fafafa", padding: 10 }}>
        {JSON.stringify(payloadUI, null, 2)}
      </pre>

      {/* RESPONSE */}
      <h3>Response</h3>
      <pre style={{ background: "#e8f5e9", padding: 10 }}>
        {JSON.stringify(response, null, 2)}
      </pre>
    </div>
  );
};

export default FetchByDate;
