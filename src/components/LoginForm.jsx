import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: 'eway@gmail.com', password: 'Abcd@123456789' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [responseData, setResponseData] = useState(null);  // API Response

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponseData(null);

    // Headers
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    try {
      const response = await axios.post(
        'http://localhost:3001/proxy/login',
        formData,
        { headers }
      );

      setResponseData(response.data);

      if (response.data.status === 'SUCCESS') {
        localStorage.setItem('token', response.data.response.token);
        localStorage.setItem('companyId', response.data.response.companyid);
        alert('Login successful!');
      }
    } catch (err) {
      const errorResponse = err.response?.data || { error: err.message };
      setResponseData(errorResponse);
      setError(errorResponse.message || errorResponse.error || 'Login failed');
    }

    setLoading(false);
  };

  // Prepare live request info (payload + headers) before sending
  const liveRequestInfo = {
    payload: formData,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto', padding: '20px' }}>
      <h2>Login</h2>
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
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ display: 'block', margin: '10px 0', width: '100%', padding: '8px' }}
        />
        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px' }}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Live Request Info */}
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

      {/* Error Display */}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default LoginForm;
