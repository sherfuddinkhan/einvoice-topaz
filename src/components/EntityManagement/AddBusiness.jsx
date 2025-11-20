import React, { useState } from 'react';
import axios from 'axios';

const AddBusiness = () => {
  const [formData, setFormData] = useState({
    companyname: '',
    roleName: 'Admin',
    id: '',
    gstinno: '',
    parentid: '',
    state: '',
    entitytype: 'BUSINESS',
    address: '',
    pincode: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState(null);

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('companyId');

      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
        'companyId': companyId,
        product: 'ONYX'
      };

      console.log('Request Headers:', headers);
      console.log('Request Payload:', formData);

      const res = await axios.put(
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
    <div style={{ maxWidth: '700px', margin: 'auto', padding: 20 }}>
      <h2>Add Business / Entity (Root / Legal / Filing / Business)</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          name="companyname"
          placeholder="Company Name"
          value={formData.companyname}
          onChange={handleChange}
          required
        />
        <input
          name="roleName"
          placeholder="Role Name"
          value={formData.roleName}
          onChange={handleChange}
          required
        />
        <input
          name="id"
          placeholder="ID (optional)"
          value={formData.id}
          onChange={handleChange}
        />
        <input
          name="gstinno"
          placeholder="GSTIN No"
          value={formData.gstinno}
          onChange={handleChange}
          required
        />
        <input
          name="parentid"
          placeholder="Parent ID"
          value={formData.parentid}
          onChange={handleChange}
          required
        />
        <input
          name="state"
          placeholder="State Code"
          value={formData.state}
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
        <input
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
        />
        <input
          name="pincode"
          placeholder="Pincode"
          value={formData.pincode}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading} style={{ marginTop: 10 }}>
          {loading ? 'Adding...' : 'Add Entity'}
        </button>
      </form>

      {/* Display Headers */}
      <div style={{ background: '#f0f0f0', padding: 10, marginBottom: 10 }}>
        <h4>Request Headers</h4>
        <pre>{JSON.stringify({
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Auth-Token': localStorage.getItem('token'),
          'companyId': localStorage.getItem('companyId'),
          product: 'ONYX'
        }, null, 2)}</pre>
      </div>

      {/* Display Payload */}
      <div style={{ background: '#f9f9f9', padding: 10, marginBottom: 10 }}>
        <h4>Request Payload</h4>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </div>

      {/* Display API Response */}
      {response && (
        <div style={{ background: '#e6ffe6', padding: 10, marginTop: 10 }}>
          <h4>API Response</h4>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}

      {/* Display Error */}
      {error && (
        <div style={{ background: '#ffe6e6', padding: 10, marginTop: 10 }}>
          <h4>Error</h4>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
};

export default AddBusiness;
