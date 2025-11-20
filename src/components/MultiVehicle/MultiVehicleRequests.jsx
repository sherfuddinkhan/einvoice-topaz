// MultiVehicleListRequests - src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function MultiVehicleRequests() {
  const [headers, setHeaders] = useState({
    "X-Auth-Token": localStorage.getItem("token") || "",
    companyId: localStorage.getItem("companyId") || "",
    product: "TOPAZ",
    Accept: "application/json",
  });

  const [query, setQuery] = useState({
    page: "1",
    size: "50",
    sort: "",
    search: ""
  });

  const [resp, setResp] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("mv_list_query") || "{}");
    setQuery(q => ({ ...q, ...saved }));
  }, []);

  useEffect(() => {
    localStorage.setItem("mv_list_query", JSON.stringify(query));
  }, [query]);

  const fetchList = async () => {
    setLoading(true); setErr(null); setResp(null);
    try {
      const res = await axios.get("http://localhost:3001/proxy/topaz/multiVehicle/requests", {
        params: query,
        headers
      });
      setResp(res.data);
    } catch (e) {
      setErr(e.response?.data || e.message);
    } finally { setLoading(false); }
  };

  const onH = (k, v) => setHeaders(h => ({ ...h, [k]: v }));
  const onQ = (k, v) => setQuery(q => ({ ...q, [k]: v }));

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "auto" }}>
      <h2>Multi-Vehicle — List Requests</h2>

      <section>
        <h3>Headers</h3>
        {Object.entries(headers).map(([k, v]) => (
          <div key={k}>
            <label style={{width:140, display:"inline-block"}}>{k}</label>
            <input style={{width:420}} value={v} onChange={e=>onH(k, e.target.value)} />
          </div>
        ))}
      </section>

      <section style={{ marginTop: 12 }}>
        <h3>Query Params</h3>
        {Object.entries(query).map(([k, v]) => (
          <div key={k}>
            <label style={{width:140, display:"inline-block"}}>{k}</label>
            <input style={{width:420}} value={v} onChange={e=>onQ(k, e.target.value)} />
          </div>
        ))}
      </section>

      <div style={{ marginTop: 12 }}>
        <button onClick={fetchList} disabled={loading}>
          {loading ? "Loading..." : "Fetch Requests"}
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        {err && <pre style={{color:"red"}}>{JSON.stringify(err, null, 2)}</pre>}
        {resp && <pre>{JSON.stringify(resp, null, 2)}</pre>}
      </div>
    </div>
  );
}
