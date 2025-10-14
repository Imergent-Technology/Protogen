/**
 * useDeckManagement Hook
 * 
 * React hook for managing decks with loading states and error handling.
 */

import { useState, useCallback } from 'react';
import { deckManagementService } from '../services/DeckManagementService';
import type {
  DeckConfig,
  CreateDeckInput,
  UpdateDeckInput,
  DeckPermissions
} from '../types/deck-config';

export interface UseDeckManagementReturn {
  decks: DeckConfig[];
  loading: boolean;
  error: string | null;
  loadDecks: (params?: Parameters<typeof deckManagementService.getDecks>[0]) => Promise<void>;
  getDeck: (id: string) => Promise<DeckConfig | null>;
  createDeck: (input: CreateDeckInput) => Promise<DeckConfig | null>;
  updateDeck: (id: string, input: UpdateDeckInput) => Promise<DeckConfig | null>;
  deleteDeck: (id: string) => Promise<boolean>;
  reorderSlides: (id: string, slideOrder: string[]) => Promise<DeckConfig | null>;
  duplicateDeck: (id: string, newName?: string) => Promise<DeckConfig | null>;
  getPermissions: (id: string) => Promise<DeckPermissions | null>;
  linkScenes: (id: string, sceneIds: string[]) => Promise<DeckConfig | null>;
  unlinkScenes: (id: string, sceneIds: string[]) => Promise<DeckConfig | null>;
}

export function useDeckManagement(): UseDeckManagementReturn {
  const [decks, setDecks] = useState<DeckConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDecks = useCallback(async (params?: Parameters<typeof deckManagementService.getDecks>[0]) => {
    setLoading(true);
    setError(null);
    try {
      const data = await deckManagementService.getDecks(params);
      setDecks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load decks');
      console.error('Failed to load decks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getDeck = useCallback(async (id: string): Promise<DeckConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const deck = await deckManagementService.getDeck(id);
      return deck;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get deck');
      console.error('Failed to get deck:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDeck = useCallback(async (input: CreateDeckInput): Promise<DeckConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const deck = await deckManagementService.createDeck(input);
      setDecks(prev => [...prev, deck]);
      return deck;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deck');
      console.error('Failed to create deck:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDeck = useCallback(async (id: string, input: UpdateDeckInput): Promise<DeckConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const deck = await deckManagementService.updateDeck(id, input);
      setDecks(prev => prev.map(d => d.id === id ? deck : d));
      return deck;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update deck');
      console.error('Failed to update deck:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDeck = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await deckManagementService.deleteDeck(id);
      setDecks(prev => prev.filter(d => d.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete deck');
      console.error('Failed to delete deck:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reorderSlides = useCallback(async (id: string, slideOrder: string[]): Promise<DeckConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const deck = await deckManagementService.reorderSlides(id, slideOrder);
      setDecks(prev => prev.map(d => d.id === id ? deck : d));
      return deck;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder slides');
      console.error('Failed to reorder slides:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const duplicateDeck = useCallback(async (id: string, newName?: string): Promise<DeckConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const deck = await deckManagementService.duplicateDeck(id, newName);
      setDecks(prev => [...prev, deck]);
      return deck;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate deck');
      console.error('Failed to duplicate deck:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPermissions = useCallback(async (id: string): Promise<DeckPermissions | null> => {
    try {
      return await deckManagementService.getDeckPermissions(id);
    } catch (err) {
      console.error('Failed to get deck permissions:', err);
      return null;
    }
  }, []);

  const linkScenes = useCallback(async (id: string, sceneIds: string[]): Promise<DeckConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const deck = await deckManagementService.linkScenes(id, sceneIds);
      setDecks(prev => prev.map(d => d.id === id ? deck : d));
      return deck;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to link scenes');
      console.error('Failed to link scenes:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const unlinkScenes = useCallback(async (id: string, sceneIds: string[]): Promise<DeckConfig | null> => {
    setLoading(true);
    setError(null);
    try {
      const deck = await deckManagementService.unlinkScenes(id, sceneIds);
      setDecks(prev => prev.map(d => d.id === id ? deck : d));
      return deck;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlink scenes');
      console.error('Failed to unlink scenes:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    decks,
    loading,
    error,
    loadDecks,
    getDeck,
    createDeck,
    updateDeck,
    deleteDeck,
    reorderSlides,
    duplicateDeck,
    getPermissions,
    linkScenes,
    unlinkScenes,
  };
}

