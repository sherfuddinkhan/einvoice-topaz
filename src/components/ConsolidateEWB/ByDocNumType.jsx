import React, { useState, useEffect } from "react";
import axios from "axios";

const LOGIN_RESPONSE_KEY = "iris_login_data";
const LATEST_CEWB_KEY = "latestCewbData";

const getLocalStorageData = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
};

const ByDocNumType = () => {
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

  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto fill from login + last CEWB
  useEffect(() => {
    const login = getLocalStorageData(LOGIN_RESPONSE_KEY);
    const lastCewb = getLocalStorageData(LATEST_CEWB_KEY)?.response || {};

    const gstin = login.userGstin || lastCewb.userGstin || "";
    const companyId = login.companyId || 4;

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

  const handleHeaderChange = (key, value) =>
    setHeaders((prev) => ({ ...prev, [key]: value }));

  const handlePayloadChange = (key, value) =>
    setPayload((prev) => ({ ...prev, [key]: value }));

  // ---------------- API CALL FIXED ----------------
  const handleFetch = async () => {
    if (!payload.userGstin || !payload.cEwbNo)
      return setError("User GSTIN and CEWB Number are required");

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      const res = await axios.get(
        "http://localhost:3001/proxy/topaz/cewb/details",
        {
          headers,
          params: {
            userGstin: payload.userGstin,
            cEwbNo: payload.cEwbNo,
          },
        }
      );

      setResponse(res.data);

      // Save last CEWB for autopopulation
      localStorage.setItem(
        LATEST_CEWB_KEY,
        JSON.stringify({ response: res.data.response || {} })
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setResponse(err.response?.data || null);
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      <h2>Fetch Consolidated E-Way Bill Details</h2>

      <h3>Headers</h3>
      {Object.entries(headers).map(([key, value]) => (
        <div key={key}>
          <strong>{key}</strong>
          <input
            value={value}
            onChange={(e) => handleHeaderChange(key, e.target.value)}
            style={{ width: "80%", marginBottom: 5 }}
          />
        </div>
      ))}

      <h3>Payload</h3>
      <div>
        <label>User GSTIN:</label>
        <input
          value={payload.userGstin}
          onChange={(e) => handlePayloadChange("userGstin", e.target.value)}
          style={{ width: "50%", marginLeft: 10 }}
        />
      </div>
      <div style={{ marginTop: 5 }}>
        <label>CEWB Number:</label>
        <input
          value={payload.cEwbNo}
          onChange={(e) => handlePayloadChange("cEwbNo", e.target.value)}
          style={{ width: "50%", marginLeft: 10 }}
        />
      </div>

      <button
        onClick={handleFetch}
        style={{ marginTop: 15, padding: "10px 20px" }}
      >
        {loading ? "Fetching..." : "Fetch CEWB Details"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {response && (
        <pre style={{ background: "#eee", padding: 10, marginTop: 20 }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ByDocNumType;
