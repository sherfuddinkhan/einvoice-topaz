import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * useFetch - Custom hook for fetching data
 * @param {string} url - API endpoint
 * @param {object} options - Axios config (optional)
 */
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevent state update if component unmounted
    setLoading(true);

    axios(url, options)
      .then((res) => {
        if (isMounted) {
          setData(res.data);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setData(null);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [url, JSON.stringify(options)]); // Re-run if URL or options change

  return { data, loading, error };
};

export default useFetch;
