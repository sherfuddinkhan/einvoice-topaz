import React, { useState } from "react";
import axios from "axios";

const MultiVehicle = () => {
  const [action, setAction] = useState("initiate");
  const [formData, setFormData] = useState({});
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token") || "";
  const companyId = localStorage.getItem("companyId") || "";

  const headersPreview = {
    "X-Auth-Token": token,
    companyId,
    product: "TOPAZ",
    "Content-Type": "application/json",
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse(null);

    try {
      let url = `http://localhost:3001/proxy/topaz/multiVehicle/initiate`;
      let method = "post";
      let payload = formData;

      if (action === "list") {
        url = "http://localhost:3001/proxy/topaz/multiVehicle/requests";
        method = "get";
        payload = undefined;
      } else if (action === "groupDetails") {
        url = "http://localhost:3001/proxy/topaz/multiVehicle/groupDetails";
        method = "get";
        payload = undefined;
      } else if (action === "add") {
        url = "http://localhost:3001/proxy/topaz/multiVehicle/add";
      } else if (action === "edit") {
        url = "http://localhost:3001/proxy/topaz/multiVehicle/edit";
      }

      const res = await axios({
        url,
        method,
        headers: headersPreview,
        ...(method === "post" ? { data: payload } : { params: formData }),
      });

      setResponse(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
      <h2>Multi-Vehicle EWB</h2>

      <select value={action} onChange={(e) => setAction(e.target.value)}>
        <option value="initiate">Initiate</option>
        <option value="list">List Requests</option>
        <option value="groupDetails">Group Details</option>
        <option value="add">Add Vehicle</option>
        <option value="edit">Edit Vehicle</option>
      </select>

      <h3>Headers Preview</h3>
      <pre>{JSON.stringify(headersPreview, null, 2)}</pre>

      <h3>Payload / Query</h3>
      <pre>{JSON.stringify(formData, null, 2)}</pre>

      <form onSubmit={handleSubmit} style={{ marginTop: 10 }}>
        {action !== "list" && action !== "groupDetails" && (
          <>
            <input name="ewbNo" placeholder="EWB No" onChange={handleChange} required />
            {action === "initiate" && (
              <>
                <input name="reasonCode" placeholder="Reason Code" onChange={handleChange} required />
                <input name="reasonRem" placeholder="Reason Rem" onChange={handleChange} required />
                <input name="fromPlace" placeholder="From Place" onChange={handleChange} required />
                <input name="fromState" placeholder="From State" onChange={handleChange} required />
                <input name="toPlace" placeholder="To Place" onChange={handleChange} required />
                <input name="toState" placeholder="To State" onChange={handleChange} required />
                <input name="transMode" placeholder="Trans Mode" onChange={handleChange} required />
                <input name="totalQuantity" placeholder="Total Quantity" onChange={handleChange} required />
                <input name="unitCode" placeholder="Unit Code" onChange={handleChange} required />
                <input name="userGstin" placeholder="User GSTIN" onChange={handleChange} required />
              </>
            )}
            {action === "add" && (
              <>
                <input name="groupNo" placeholder="Group No" onChange={handleChange} required />
                <input name="vehicleNo" placeholder="Vehicle No" onChange={handleChange} required />
                <input name="quantity" placeholder="Quantity" onChange={handleChange} required />
                <input name="transDocNo" placeholder="Trans Doc No" onChange={handleChange} />
                <input name="transDocDate" placeholder="Trans Doc Date" onChange={handleChange} />
                <input name="userGstin" placeholder="User GSTIN" onChange={handleChange} />
              </>
            )}
            {action === "edit" && (
              <>
                <input name="groupNo" placeholder="Group No" onChange={handleChange} required />
                <input name="vehicleNo" placeholder="Vehicle No" onChange={handleChange} required />
                <input name="oldvehicleNo" placeholder="Old Vehicle No" onChange={handleChange} required />
                <input name="quantity" placeholder="Quantity" onChange={handleChange} required />
                <input name="reasonCode" placeholder="Reason Code" onChange={handleChange} required />
                <input name="reasonRem" placeholder="Reason Rem" onChange={handleChange} />
                <input name="fromPlace" placeholder="From Place" onChange={handleChange} />
                <input name="fromState" placeholder="From State" onChange={handleChange} />
                <input name="transDocNo" placeholder="Trans Doc No" onChange={handleChange} />
                <input name="transDocDate" placeholder="Trans Doc Date" onChange={handleChange} />
                <input name="userGstin" placeholder="User GSTIN" onChange={handleChange} />
              </>
            )}
          </>
        )}

        <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {response && (
        <>
          <h3>Response</h3>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </>
      )}
    </div>
  );
};

export default MultiVehicle;
