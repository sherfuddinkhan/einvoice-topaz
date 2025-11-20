
import React, { useState } from 'react';
import axios from 'axios';

const PrintSummary = () => {
  const [ewbNos, setEwbNos] = useState([
    "451177338838",
    "431177338832",
    "421177338925",
    "421177338909",
    "401177338820",
    "491177337741",
    "481177337764",
    "481177337722",
    "481177337681",
    "471177337758"
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [responseMsg, setResponseMsg] = useState('');

  // Headers from local storage
  const token = localStorage.getItem('token') || '';
  const companyId = localStorage.getItem('companyId') || '';

  const headersPreview = {
    "X-Auth-Token": token,
    companyId,
    product: "TOPAZ",
    "Content-Type": "application/json",
    Accept: "application/pdf"
  };

  const payloadPreview = { ewbNo: ewbNos };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponseMsg('');

    try {
      const res = await axios.post(
        'http://localhost:3001/proxy/topaz/ewb/printSummary',
        payloadPreview,
        {
          headers: headersPreview,
          responseType: 'blob'
        }
      );

      // Download PDF
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ewb-summary.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();

      setResponseMsg('PDF downloaded successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to print summary');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '700px', margin: 'auto', padding: 20 }}>
      <h2>Print EWB Summary</h2>

      {/* Headers Preview */}
      <h3>Headers Preview</h3>
      <pre>{JSON.stringify(headersPreview, null, 2)}</pre>

      {/* Payload Preview */}
      <h3>Payload Preview</h3>
      <pre>{JSON.stringify(payloadPreview, null, 2)}</pre>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <label>EWB Numbers (comma-separated):</label>
        <input
          type="text"
          value={ewbNos.join(',')}
          onChange={(e) => setEwbNos(e.target.value.split(',').map(n => n.trim()))}
          required
          style={{ width: '100%', padding: '8px', marginTop: '5px', marginBottom: '10px' }}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Printing...' : 'Print PDF'}
        </button>
      </form>

      {/* Error / Response */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {responseMsg && <p style={{ color: 'green' }}>{responseMsg}</p>}
    </div>
  );
};

export default PrintSummary;
