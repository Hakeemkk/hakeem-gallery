import { useState, useEffect } from 'react';
import { api, endpoints, ApiError } from '../lib/api';

export const useApi = (endpoint, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.get(endpoint);
      setData(result);
    } catch (err) {
      setError(err);
      console.error(`API Error fetching ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  const refetch = () => fetchData();

  return { data, loading, error, refetch };
};

export const useProducts = () => {
  return useApi(endpoints.products);
};

export const useOrders = () => {
  return useApi(endpoints.orders);
};
