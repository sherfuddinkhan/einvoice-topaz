import React, { useState } from 'react';
import axios from 'axios';

const EWBPrintForm = () => {
  const [ewbNos, setEwbNos] = useState(['451177338838']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);

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
    setResponse(null);

    try {
      const res = await axios.post(
        'http://localhost:3001/proxy/topaz/ewb/printDetails',
        payloadPreview,
        {
          headers: headersPreview,
          responseType: 'blob', // PDF download
        }
      );

      // Download PDF
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ewb-details.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setResponse('PDF downloaded successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Print failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: 20 }}>
      <h2>Print EWB Details</h2>

      <h3>Headers Preview</h3>
      <pre>{JSON.stringify(headersPreview, null, 2)}</pre>

      <h3>Payload Preview</h3>
      <pre>{JSON.stringify(payloadPreview, null, 2)}</pre>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="EWB Nos (comma-separated)"
          value={ewbNos.join(',')}
          onChange={(e) => setEwbNos(e.target.value.split(',').map(n => n.trim()))}
          required
        />
        <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? 'Printing...' : 'Print PDF'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {response && <p style={{ color: 'green' }}>{response}</p>}
    </div>
  );
};

export default EWBPrintForm;
