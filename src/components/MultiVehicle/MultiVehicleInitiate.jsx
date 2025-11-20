// MultiVehicleInitiate - src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function MultiVehicleInitiate() {
  const [headers, setHeaders] = useState({
    "X-Auth-Token": localStorage.getItem("token") || "",
    companyId: localStorage.getItem("companyId") || "",
    product: "TOPAZ",
    "Content-Type": "application/json",
  });

  const [payload, setPayload] = useState({
    ewbNo: "",
    reasonCode: "",
    reasonRem: "",
    fromPlace: "",
    fromState: "",
    toPlace: "",
    toState: "",
    transMode: "",
    totalQuantity: "",
    unitCode: "",
    userGstin: "",
  });

  const [resp, setResp] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  // load previous payload if any
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("mv_initiate_payload") || "{}");
    setPayload(prev => ({ ...prev, ...saved }));
  }, []);

  useEffect(() => {
    localStorage.setItem("mv_initiate_payload", JSON.stringify(payload));
  }, [payload]);

  const onHeaderChange = (k, v) => setHeaders(h => ({ ...h, [k]: v }));
  const onPayloadChange = (k, v) => setPayload(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setErr(null);
    setResp(null);

    try {
      const res = await axios.post(
        "http://localhost:3001/proxy/topaz/multiVehicle/initiate",
        payload,
        { headers }
      );
      setResp(res.data);
    } catch (error) {
      setErr(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "auto" }}>
      <h2>Multi-Vehicle — Initiate</h2>

      <section>
        <h3>Headers (editable)</h3>
        {Object.entries(headers).map(([k, v]) => (
          <div key={k} style={{ marginBottom: 6 }}>
            <label style={{ width: 130, display: "inline-block" }}>{k}</label>
            <input
              style={{ width: 420 }}
              value={v}
              onChange={(e) => onHeaderChange(k, e.target.value)}
            />
          </div>
        ))}
      </section>

      <section style={{ marginTop: 16 }}>
        <h3>Payload</h3>
        {Object.entries(payload).map(([k, v]) => (
          <div key={k} style={{ marginBottom: 6 }}>
            <label style={{ width: 140, display: "inline-block" }}>{k}</label>
            <input
              style={{ width: 400 }}
              value={v}
              onChange={(e) => onPayloadChange(k, e.target.value)}
            />
          </div>
        ))}
      </section>

      <div style={{ marginTop: 16 }}>
        <button onClick={submit} disabled={loading}>
          {loading ? "Submitting..." : "Submit Initiate"}
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        {err && <pre style={{ color: "red" }}>{JSON.stringify(err, null, 2)}</pre>}
        {resp && <pre>{JSON.stringify(resp, null, 2)}</pre>}
      </div>
    </div>
  );
}
