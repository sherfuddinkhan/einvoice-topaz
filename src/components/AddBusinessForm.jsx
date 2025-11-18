import React, { useState } from 'react';
import axios from 'axios';

const AddBusinessForm = () => {
  const [formData, setFormData] = useState({
    companyname: '',
    pan: '',
    address: '',
    entitytype: 'BUSINESS'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('companyId');

      // Headers
      const headers = {
        'X-Auth-Token': token,
        'companyId': companyId,
        product: 'ONYX',
        'Content-Type': 'application/json',
        Accept: 'application/json'
      };

      // Show headers and payload in console (optional)
      console.log('Headers:', headers);
      console.log('Payload:', formData);

      const res = await axios.post(
        'http://localhost:3001/proxy/topaz/mgmt/company/business',
        formData,
        { headers }
      );

      setResponse(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Add failed');
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>Add Business / Entity</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          name="companyname"
          placeholder="Company Name"
          value={formData.companyname}
          onChange={handleChange}
          required
        />
        <input
          name="pan"
          placeholder="PAN"
          value={formData.pan}
          onChange={handleChange}
          required
        />
        <input
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
        />
        <select
          name="entitytype"
          value={formData.entitytype}
          onChange={handleChange}
        >
          <option value="BUSINESS">BUSINESS</option>
          <option value="ROOT">ROOT</option>
          <option value="LEGAL">LEGAL</option>
          <option value="FILING">FILING</option>
        </select>

        <button type="submit" disabled={loading} style={{ marginTop: '10px' }}>
          {loading ? 'Adding...' : 'Add Business'}
        </button>
      </form>

      {/* Display Headers */}
      <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '10px' }}>
        <h4>Request Headers:</h4>
        <pre>{JSON.stringify({
          'X-Auth-Token': localStorage.getItem('token'),
          'companyId': localStorage.getItem('companyId'),
          product: 'ONYX',
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }, null, 2)}</pre>
      </div>

      {/* Display Payload */}
      <div style={{ background: '#f9f9f9', padding: '10px', marginBottom: '10px' }}>
        <h4>Request Payload:</h4>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </div>

      {/* Display API Response */}
      {response && (
        <div style={{ background: '#e6ffe6', padding: '10px', marginTop: '10px' }}>
          <h4>API Response:</h4>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}

      {/* Display Error */}
      {error && (
        <div style={{ background: '#ffe6e6', padding: '10px', marginTop: '10px' }}>
          <h4>Error:</h4>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
};

export default AddBusinessForm;
