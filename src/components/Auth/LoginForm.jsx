import React, { useState } from 'react';
import axios from 'axios';

const LOGIN_RESPONSE_KEY = "iris_login_data";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "eway@gmail.com",
    password: "Abcd@123456789",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseData, setResponseData] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponseData(null);

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    try {
      const response = await axios.post(
        "http://localhost:3001/proxy/login",
        formData,
        { headers }
      );

      setResponseData(response.data);

      if (response.data.status === "SUCCESS") {
        const apiRes = response.data.response;

        // NEW FORMAT FOR ALL COMPONENTS
        const loginData = {
          token: apiRes.token,
          companyId: apiRes.companyid,
          userGstin: apiRes.userGstin || "", // API sometimes returns GSTIN
        };

        localStorage.setItem(LOGIN_RESPONSE_KEY, JSON.stringify(loginData));

        alert("Login Successful!");
      }
    } catch (err) {
      const errorResponse = err.response?.data || { error: err.message };
      setResponseData(errorResponse);
      setError(errorResponse.message || errorResponse.error || "Login failed");
    }

    setLoading(false);
  };

  // Live request preview
  const liveRequestInfo = {
    payload: formData,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };

  return (
    <div style={{ maxWidth: 500, margin: "auto", padding: 20 }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ display: "block", margin: "10px 0", width: "100%", padding: 8 }}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ display: "block", margin: "10px 0", width: "100%", padding: 8 }}
        />

        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* PREVIEW BEFORE API */}
      <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 10, borderRadius: 4 }}>
        <h3>Request About To Be Sent:</h3>

        <strong>Payload:</strong>
        <pre style={{ background: "#f5f5f5", padding: 10 }}>
          {JSON.stringify(liveRequestInfo.payload, null, 2)}
        </pre>

        <strong>Headers:</strong>
        <pre style={{ background: "#f5f5f5", padding: 10 }}>
          {JSON.stringify(liveRequestInfo.headers, null, 2)}
        </pre>
      </div>

      {/* RESPONSE */}
      {responseData && (
        <div style={{ marginTop: 20, border: "1px solid #ddd", padding: 10, borderRadius: 4 }}>
          <h3>API Response:</h3>
          <pre style={{ background: "#f5f5f5", padding: 10 }}>
            {JSON.stringify(responseData, null, 2)}
          </pre>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default LoginForm;
