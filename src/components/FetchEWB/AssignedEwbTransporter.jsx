import React, { useState, useEffect } from "react";
import axios from "axios";

// ======================
// LocalStorage Keys
// ======================
const STORAGE_KEY = "iris_transporter_ewaybills";
const FORM_KEY = "iris_transporter_form";
const LOGIN_KEY = "iris_login_data";
const EWB_HISTORY_KEY = "ewbHistory";
const LATEST_EWB_KEY = "latestEwbData";

const AssignedEwbTransporter = () => {
  // ======================
  // READ LOCAL STORAGE ONCE
  // ======================
  const savedForm = JSON.parse(localStorage.getItem(FORM_KEY) || "{}");
  const loginData = JSON.parse(localStorage.getItem(LOGIN_KEY) || "{}");

  const last = JSON.parse(localStorage.getItem(LATEST_EWB_KEY) || "{}");
  const hist = JSON.parse(localStorage.getItem(EWB_HISTORY_KEY) || "{}");
   
  const savedResponse = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  console.log("savedForm",savedForm)
   console.log("last",last)
  const initialGstin = last.response.toGstin|| hist.response.toGstin|| "";

  // ======================
  // STATES
  // ====================== 
  const [form, setForm] = useState({
    date: savedForm.date || "15/11/2025",
    userGstin: initialGstin,
    page: savedForm.page || "1",
    size: savedForm.size || "10",
    updateNeeded: savedForm.updateNeeded || "true",
  });

  const [headers, setHeaders] = useState({
    companyId: "",
    token: "",
  });

  const [ewayBills, setEwayBills] = useState(savedResponse);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestLog, setRequestLog] = useState(null);

  // ======================
  // LOAD HEADERS FROM LOGIN
  // ======================
  useEffect(() => {
    if (loginData.companyId && loginData.token) {
      setHeaders({
        companyId: loginData.companyId,
        token: loginData.token,
      });
    }
  }, []);

  // ======================
  // INPUT HANDLER
  // ======================
  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    setForm(updated);
    localStorage.setItem(FORM_KEY, JSON.stringify(updated));
  };

  // ======================
  // FETCH DATA
  // ======================
  const fetchData = async () => {
    setLoading(true);
    setError("");

    const reqHeaders = {
      accept: "application/json",
      companyId: headers.companyId,
      "X-Auth-Token": headers.token,
      product: "TOPAZ",
    };

    const reqParams = { ...form };

    // Save request details to UI
    setRequestLog({ headers: reqHeaders, params: reqParams });

    try {
      const response = await axios.get(
        "https://stage-api.irisgst.com/irisgst/topaz/api/v0.3/getewb/transporter",
        {
          params: reqParams,
          headers: reqHeaders,
        }
      );

      const list = response.data?.response || [];

      setEwayBills(list);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      setError("Unable to fetch transporter assigned E-way bills");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📦 Assigned to Transporter - E-Way Bills</h2>

      {/* ================= HEADER INFO ================= */}
      <div style={{ marginBottom: "15px" }}>
  <p><b>Company ID:</b> {headers.companyId || "(Not Found)"}</p>

  {/* SHOW FULL AUTH TOKEN */}
  <p><b>Auth Token:</b> {headers.token || "(Missing Token)"}</p>
</div>


      {/* ================= FORM ================= */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          name="date"
          placeholder="dd/mm/yyyy"
          value={form.date}
          onChange={handleChange}
          style={{ marginRight: "10px" }}
        />

        <input
          type="text"
          name="userGstin"
          placeholder="User GSTIN"
          value={form.userGstin}
          onChange={handleChange}
          style={{ marginRight: "10px" }}
        />

        <input
          type="number"
          name="page"
          placeholder="Page"
          value={form.page}
          onChange={handleChange}
          style={{ width: "70px", marginRight: "10px" }}
        />

        <input
          type="number"
          name="size"
          placeholder="Size"
          value={form.size}
          onChange={handleChange}
          style={{ width: "70px", marginRight: "10px" }}
        />

        <select
          name="updateNeeded"
          value={form.updateNeeded}
          onChange={handleChange}
          style={{ marginRight: "10px" }}
        >
          <option value="true">Update from NIC</option>
          <option value="false">Use Cached</option>
        </select>

        <button onClick={fetchData}>Fetch</button>
      </div>

      {/* ================= SHOW HEADERS + PAYLOAD ================= */}
      {requestLog && (
        <div
          style={{
            background: "#f0f0f0",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h3>📤 Request Headers</h3>
          <pre>{JSON.stringify(requestLog.headers, null, 2)}</pre>

          <h3>📦 Request Payload / Params</h3>
          <pre>{JSON.stringify(requestLog.params, null, 2)}</pre>
        </div>
      )}

      {/* ================= STATUS ================= */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ================= TABLE ================= */}
      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Error Code</th>
            <th>Error Description</th>
          </tr>
        </thead>
        <tbody>
          {ewayBills.length === 0 ? (
            <tr>
              <td colSpan="2">No Data Found</td>
            </tr>
          ) : (
            ewayBills.map((item, i) => (
              <tr key={i}>
                <td>{item.ewbErrorCode}</td>
                <td>{item.ewbErrorDesc}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssignedEwbTransporter;
