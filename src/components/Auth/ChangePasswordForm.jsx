import React, { useState } from 'react';
import axios from 'axios';

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    changePasswordFromLogin: true,
    email: localStorage.getItem('email') || '', // Pre-fill from login
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [responseData, setResponseData] = useState(null); // API Response

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setResponseData(null);

    // Headers for the request
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const response = await axios.post(
        'http://localhost:3001/proxy/change-password',
        formData,
        { headers }
      );

      setResponseData(response.data);

      if (response.data.status === 'SUCCESS') {
        localStorage.setItem('token', response.data.response['X-Auth-Token']);
        alert('Password changed successfully!');
        // Redirect to dashboard if needed
      }
    } catch (err) {
      const errorResponse = err.response?.data || { error: err.message };
      setResponseData(errorResponse);
      setError(errorResponse.message || errorResponse.error || 'Change password failed');
    }

    setLoading(false);
  };

  // Live request preview before sending
  const liveRequestInfo = {
    payload: formData,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '20px' }}>
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ display: 'block', margin: '10px 0', width: '100%', padding: '8px' }}
        />
        <input
          type="password"
          name="currentPassword"
          placeholder="Current Password"
          value={formData.currentPassword}
          onChange={handleChange}
          required
          style={{ display: 'block', margin: '10px 0', width: '100%', padding: '8px' }}
        />
        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={formData.newPassword}
          onChange={handleChange}
          required
          style={{ display: 'block', margin: '10px 0', width: '100%', padding: '8px' }}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          style={{ display: 'block', margin: '10px 0', width: '100%', padding: '8px' }}
        />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>

      {/* Live Request Preview */}
      <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
        <h3>Request About to be Sent:</h3>
        <strong>Payload:</strong>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(liveRequestInfo.payload, null, 2)}
        </pre>
        <strong>Headers:</strong>
        <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(liveRequestInfo.headers, null, 2)}
        </pre>
      </div>

      {/* API Response */}
      {responseData && (
        <div style={{ marginTop: '20px', border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
          <h3>API Response:</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </div>
      )}

      {/* Error */}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default ChangePasswordForm;