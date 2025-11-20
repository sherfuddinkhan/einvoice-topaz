
import React, { useState, useEffect } from "react";
import axios from "axios";

// LOCAL STORAGE KEYS
const LOGIN_RESPONSE_KEY = "iris_login_data";
const LATEST_EWB_KEY = "latestEwbData";
const EWB_HISTORY_KEY = "ewbHistory";
const STORAGE_KEY = "EWB_PREVIOUS_DATA";

export default function BulkDownload() {
  const [headers, setHeaders] = useState({
    companyId: "",
    token: "",
    product: "TOPAZ",
  });

  const [payload, setPayload] = useState({ id: "" });

  const [downloadUrl, setDownloadUrl] = useState("");
  const [error, setError] = useState("");

  // AUTOFILL FROM LOCAL STORAGE
  useEffect(() => {
    const login = JSON.parse(localStorage.getItem(LOGIN_RESPONSE_KEY) || "{}");
    const latest = JSON.parse(localStorage.getItem(LATEST_EWB_KEY) || "{}");
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

    setHeaders({
      companyId: login.companyId || prev.companyId || "",
      token: login.token || prev.token || "",
      product: "TOPAZ",
    });

    setPayload({ id: latest.id || prev.id || "" });
  }, []);

  // HANDLE HEADER CHANGE
  const updateHeader = (key, value) => {
    setHeaders((prev) => ({ ...prev, [key]: value }));
  };

  // HANDLE PAYLOAD CHANGE
  const updatePayload = (key, value) => {
    setPayload((prev) => ({ ...prev, [key]: value }));
  };

  // DOWNLOAD API CALL
  const download = async () => {
    try {
      setError("");
      setDownloadUrl("");

      const res = await axios.get(`"http://localhost:3001/proxy/topaz/ewb/bulkDownload`, {
        params: payload,
        headers: {
          Accept: "application/json",
          companyId: headers.companyId,
          "X-Auth-Token": headers.token,
          product: headers.product,
        },
      });

      const url = res?.data?.response;
      if (url) {
        setDownloadUrl(url);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...headers, ...payload }));
      } else {
        setError("No download URL received");
      }
    } catch (err) {
      setError(err?.response?.data || "Error while downloading");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: "auto" }}>
      <h2>EWB Bulk Download</h2>

      <h3>Headers (Editable)</h3>
      <label>Company ID</label>
      <input
        value={headers.companyId}
        onChange={(e) => updateHeader("companyId", e.target.value)}
      />

      <label>X-Auth-Token</label>
      <input
        value={headers.token}
        onChange={(e) => updateHeader("token", e.target.value)}
      />

      <label>Product</label>
      <input
        value={headers.product}
        onChange={(e) => updateHeader("product", e.target.value)}
      />

      <h3>Payload (Editable)</h3>
      <label>ID</label>
      <input
        value={payload.id}
        onChange={(e) => updatePayload("id", e.target.value)}
      />

      <button onClick={download} style={{ marginTop: 20 }}>
        Download
      </button>

      {downloadUrl && (
        <div style={{ marginTop: 20 }}>
          <a href={downloadUrl} target="_blank" rel="noreferrer">
            Click to Download File
          </a>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{JSON.stringify(error)}</p>}
    </div>
  );
}
