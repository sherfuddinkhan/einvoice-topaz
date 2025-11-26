import React, { useState } from "react";
import axios from "axios";

const STORAGE_KEY = "iris_einvoice_shared_config";
const LOGIN_RESPONSE_KEY = "iris_login_data";

const AddBusiness = () => {
  const savedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const login = JSON.parse(localStorage.getItem(LOGIN_RESPONSE_KEY) || "{}");

  const companyId = login?.companyId || savedConfig?.companyId || "";
  const token = login?.token || savedConfig?.token || "";

  const [formData, setFormData] = useState({
    companyname: "",
    roleName: "Admin",
    id: "",
    gstinno: "",
    parentid: companyId,
    state: "1",
    PAN: "",
    entitytype: "FILING",
    address: "",
    pincode: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const headers = {
    Accept: "application/json",
    product: "TOPAZ",
    "Content-Type": "application/json",
    companyId: companyId,
    "X-Auth-Token": token,
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addBusiness = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.put(
        "http://localhost:3001/proxy/mgmt/company/business",
        formData,
        { headers }
      );
      setResult(response.data);
    } catch (error) {
      setResult(error.response?.data || { error: "Request failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Add Business</h2>

      <div><label>Company Name:</label>
        <input name="companyname" value={formData.companyname} onChange={handleChange} />
      </div>

      <div><label>Role Name:</label>
        <input name="roleName" value={formData.roleName} onChange={handleChange} />
      </div>

      <div><label>ID:</label>
        <input name="id" value={formData.id} onChange={handleChange} />
      </div>

      <div><label>GSTIN No:</label>
        <input name="gstinno" value={formData.gstinno} onChange={handleChange} />
      </div>

      <div><label>PAN:</label>
        <input name="PAN" value={formData.PAN} onChange={handleChange} />
      </div>

      <div><label>Parent ID:</label>
        <input name="parentid" value={formData.parentid} onChange={handleChange} />
      </div>

      <div><label>State:</label>
        <input name="state" value={formData.state} onChange={handleChange} />
      </div>

      <div><label>Entity Type:</label>
        <input name="entitytype" value={formData.entitytype} onChange={handleChange} />
      </div>

      <div><label>Address:</label>
        <input name="address" value={formData.address} onChange={handleChange} />
      </div>

      <div><label>Pincode:</label>
        <input name="pincode" value={formData.pincode} onChange={handleChange} />
      </div>

      <button onClick={addBusiness} disabled={loading}>
        {loading ? "Adding..." : "Add Business"}
      </button>

      <h3>Headers:</h3>
      <pre style={{ background: "#222", color: "#0f0", padding: 10 }}>
        {JSON.stringify(headers, null, 2)}
      </pre>

      <h3>Payload:</h3>
      <pre style={{ background: "#111", color: "#0ff", padding: 10 }}>
        {JSON.stringify(formData, null, 2)}
      </pre>

      {result && (
        <>
          <h3>Response:</h3>
          <pre style={{ background: "#000", color: "#fff", padding: 10 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
};

export default AddBusiness;
