import React, { useState } from "react";
import api from "../../api/irisgstApi";

const FetchByDate = () => {
  const [date, setDate] = useState("");
  const [response, setResponse] = useState(null);

  const fetchEwbs = async () => {
    try {
      const res = await api.get("http://localhost:3001/proxy/topaz/ewb/fetchByDate", { params: { date } });
      setResponse(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div>
      <input placeholder="Date (YYYY-MM-DD)" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={fetchEwbs}>Fetch EWB</button>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  );
};

export default FetchByDate;
