// AssignedGSTINList.js - FINAL CLEAN VERSION
import React, { useState, useEffect } from "react";

const STORAGE_KEY = "iris_einvoice_shared_config";

const AssignedGSTINList = ({ previousResponse }) => {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  // ================================
  // BASE STATE
  // ================================
  const [config, setConfig] = useState({
    proxyBase: "http://localhost:3001/proxy",
    endpoint: "/mgmt/user/company/filingbusiness",
    headers: {
      Accept: "application/json",
      product: "TOPAZ",
      companyId: "",
      "X-Auth-Token": "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [gstins, setGstins] = useState([]);
  const [rawResponse, setRawResponse] = useState(null);
  const [error, setError] = useState("");

  // ================================
  // AUTOPOPULATE HEADERS ON FIRST LOAD
  // ================================
  useEffect(() => {
    const companyId =
      previousResponse?.response?.companyid ||
      saved?.companyId ||
      "";

    const token =
      previousResponse?.response?.token ||
      saved?.token ||
      "";

    setConfig((prev) => ({
      ...prev,
      headers: { ...prev.headers, companyId, "X-Auth-Token": token },
    }));
  }, []);

  // ================================
  //     SAVE TO LOCAL STORAGE
  // ================================
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        companyId: config.headers.companyId,
        token: config.headers["X-Auth-Token"],
      })
    );
  }, [config]);

  const updateHeader = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      headers: { ...prev.headers, [key]: value },
    }));
  };

  // ================================
  // API CALL
  // ================================
  const sendRequest = async () => {
    setLoading(true);
    setGstins([]);
    setRawResponse(null);
    setError("");

    const url = `${config.proxyBase}${config.endpoint}`;

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: config.headers,
      });

      const text = await res.text();
      let json = null;
      try {
        json = JSON.parse(text);
      } catch {}

      const responseObj = {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: json || text,
      };

      setRawResponse(responseObj);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      if (json?.status === "SUCCESS" && Array.isArray(json.response)) {
        setGstins(json.response);
      }
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const finalURL = `${config.proxyBase}${config.endpoint}`;

  // ================================
  // UI
  // ================================
  return (
    <div style={{ padding: 30, fontFamily: "Arial", background: "#f4f4f4" }}>
      <div style={{ background: "white", padding: 20, borderRadius: 10 }}>
        <h2>Assigned GSTINs</h2>

        <b>Request URL:</b>
        <div
          style={{
            background: "#eee",
            padding: 10,
            borderRadius: 6,
            fontFamily: "monospace",
          }}
        >
          {finalURL}
        </div>

        <h3>Headers</h3>

        {Object.entries(config.headers).map(([key, value]) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label
              style={{
                display: "inline-block",
                width: 150,
                fontWeight: "bold",
              }}
            >
              {key}:
            </label>
            <input
              type={key === "X-Auth-Token" ? "password" : "text"}
              value={value}
              onChange={(e) => updateHeader(key, e.target.value)}
              style={{ width: 320, padding: 8 }}
            />
          </div>
        ))}

        <button
          onClick={sendRequest}
          disabled={loading}
          style={{
            marginTop: 10,
            padding: "10px 20px",
            background: "#2196f3",
            border: "none",
            borderRadius: 8,
            color: "white",
          }}
        >
          {loading ? "Loading..." : "Fetch Assigned GSTINs"}
        </button>
      </div>

      {rawResponse && (
        <div
          style={{
            background: "#fff8e1",
            padding: 20,
            marginTop: 20,
            borderRadius: 10,
          }}
        >
          <h3>Raw Response</h3>
          <pre
            style={{
              background: "#222",
              color: "#0f0",
              padding: 15,
              borderRadius: 6,
              maxHeight: 350,
              overflow: "auto",
            }}
          >
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </div>
      )}

      {error && (
        <div style={{ background: "#ffcdd2", padding: 12, marginTop: 20 }}>
          <b style={{ color: "#c62828" }}>{error}</b>
        </div>
      )}

      {gstins.length > 0 && (
        <div
          style={{
            background: "white",
            padding: 20,
            marginTop: 20,
            borderRadius: 10,
          }}
        >
          <h3>Assigned GSTINs ({gstins.length})</h3>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#4caf50", color: "white" }}>
              <tr>
                <th style={{ padding: 10 }}>Company Name</th>
                <th style={{ padding: 10 }}>GSTIN</th>
                <th style={{ padding: 10 }}>Role</th>
                <th style={{ padding: 10 }}>ID</th>
              </tr>
            </thead>

            <tbody>
              {gstins.map((g) => (
                <tr key={g.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: 10 }}>{g.companyname}</td>
                  <td
                    style={{ padding: 10, fontFamily: "monospace" }}
                  >
                    {g.gstin || g.gstinno}
                  </td>
                  <td style={{ padding: 10 }}>{g.roleName}</td>
                  <td style={{ padding: 10 }}>{g.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssignedGSTINList;
