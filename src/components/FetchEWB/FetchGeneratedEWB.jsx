import React, { useState } from "react";
import api from "../../api/irisgstApi";

const FetchGeneratedEWB = () => {
  const [query, setQuery] = useState({ fromDate: "", toDate: "" });
  const [response, setResponse] = useState(null);

  const handleChange = e => setQuery(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFetch = async () => {
    try {
      const res = await api.get("http://localhost:3001/proxy/topaz/ewb/fetchByDate", { params: query });
      setResponse(res.data);
    } catch (err) {
      setResponse(err.response?.data || { error: err.message });
    }
  };

  return (
    <div>
      <h2>Fetch Generated EWB by Date</h2>
      <input name="fromDate" placeholder="From Date" value={query.fromDate} onChange={handleChange} />
      <input name="toDate" placeholder="To Date" value={query.toDate} onChange={handleChange} />
      <button onClick={handleFetch}>Fetch</button>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
};

export default FetchGeneratedEWB;
