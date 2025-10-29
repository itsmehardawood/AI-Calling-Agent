"use client";
import { useState, useCallback } from 'react';
import * as promptApi from '../lib/promptApi';

export function usePrompts() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrompts = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await promptApi.getPrompts(filters);
      setPrompts(response.prompts || []);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPrompt = useCallback(async (promptData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await promptApi.createPrompt(promptData);
      await fetchPrompts(); // Refresh the list
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPrompts]);

  const updatePrompt = useCallback(async (promptId, promptData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await promptApi.updatePrompt(promptId, promptData);
      await fetchPrompts(); // Refresh the list
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPrompts]);

  const deletePrompt = useCallback(async (promptId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await promptApi.deletePrompt(promptId);
      await fetchPrompts(); // Refresh the list
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchPrompts]);

  const generatePrompt = useCallback(async (promptData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await promptApi.generatePrompt(promptData);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    prompts,
    loading,
    error,
    fetchPrompts,
    createPrompt,
    updatePrompt,
    deletePrompt,
    generatePrompt,
  };
}