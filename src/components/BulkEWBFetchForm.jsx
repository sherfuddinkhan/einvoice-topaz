import React, { useState } from 'react';
import axios from 'axios';

const BulkEWBFetchForm = () => {
  const [step, setStep] = useState('initiate');
  const [formData, setFormData] = useState({ userGstin: '', companyId: '', docType: 'INV', docNumList: [] });
  const [requestId, setRequestId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusResponse, setStatusResponse] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const initiate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('companyId');
      const res = await axios.post('/proxy/topaz/ewb/bulkByDocNum', formData, {
        headers: { 'X-Auth-Token': token, 'companyId': companyId, 'product': 'TOPAZ' }
      });
      setRequestId(res.data.response.id);
      setStep('status');
      alert('Request initiated! ID: ' + res.data.response.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Initiate failed');
    }
    setLoading(false);
  };

  const checkStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('companyId');
      const res = await axios.get('http://localhost:3001/proxy/topaz/ewb/bulkStatus', {
        params: { companyId: formData.companyId, userGstin: formData.userGstin },
        headers: { 'X-Auth-Token': token, 'companyId': companyId, 'product': 'TOPAZ' }
      });
      setStatusResponse(res.data);
      if (res.data.response.status === 'SUCCESS') {
        setStep('download');
        setDownloadUrl(res.data.response.csvFileName); // Or full S3 URL
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Status check failed');
    }
    setLoading(false);
  };

  const download = async () => {
    window.open(downloadUrl, '_blank');
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto' }}>
      <h2>Bulk EWB Fetch</h2>
      {step === 'initiate' && (
        <form onSubmit={initiate}>
          <input name="userGstin" placeholder="User GSTIN" onChange={handleChange} required />
          <input name="companyId" placeholder="Company ID (POB)" onChange={handleChange} required />
          <input name="docType" placeholder="Doc Type" onChange={handleChange} required />
          <input name="docNumList" placeholder="Doc Nos (comma-separated)" onChange={(e) => setFormData({ ...formData, docNumList: e.target.value.split(',') })} required />
          <button type="submit" disabled={loading}>Initiate</button>
        </form>
      )}
      {step === 'status' && (
        <div>
          <p>Request ID: {requestId}</p>
          <button onClick={checkStatus} disabled={loading}>Check Status</button>
          {statusResponse && <pre>{JSON.stringify(statusResponse, null, 2)}</pre>}
        </div>
      )}
      {step === 'download' && (
        <div>
          <p>Ready for download!</p>
          <button onClick={download}>Download CSV</button>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default BulkEWBFetchForm;