'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  deleteCloudData, mergeCloudPayload, readCloudSnapshot, type CloudPayload, writeCloudSnapshot,
} from '@/lib/cloud-sync';
import { getSupabaseClient } from '@/lib/supabase-client';

export type CloudSyncState = 'local' | 'syncing' | 'synced' | 'error';

export function useCloudSync({ enabled, payload, onCloudState }: {
  enabled: boolean;
  payload: CloudPayload;
  onCloudState: (payload: CloudPayload) => void;
}) {
  const client = getSupabaseClient();
  const payloadRef = useRef(payload);
  const initialisedUserRef = useRef<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [syncState, setSyncState] = useState<CloudSyncState>('local');
  const [message, setMessage] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  payloadRef.current = payload;

  const syncNow = useCallback(async () => {
    if (!client || !session || !enabled) return;
    setSyncState('syncing');
    setMessage('');
    try {
      const cloud = await readCloudSnapshot(client, session.user.id);
      const nextPayload = cloud ? mergeCloudPayload(payloadRef.current, cloud.payload) : payloadRef.current;
      initialisedUserRef.current = session.user.id;
      if (cloud) onCloudState(nextPayload);
      const syncedAt = new Date().toISOString();
      await writeCloudSnapshot(client, session, nextPayload, syncedAt);
      payloadRef.current = nextPayload;
      setLastSyncedAt(syncedAt);
      setSyncState('synced');
      setMessage(cloud ? 'Device and cloud data are up to date.' : 'This device is now backed up.');
    } catch (error) {
      initialisedUserRef.current = null;
      setSyncState('error');
      setMessage(cloudErrorMessage(error));
    }
  }, [client, enabled, onCloudState, session]);

  useEffect(() => {
    if (!client) return;
    client.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) {
        initialisedUserRef.current = null;
        setSyncState('local');
        setLastSyncedAt(null);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [client]);

  useEffect(() => {
    if (!session || !enabled || initialisedUserRef.current === session.user.id) return;
    void syncNow();
  }, [enabled, session, syncNow]);

  useEffect(() => {
    if (!client || !session || !enabled || initialisedUserRef.current !== session.user.id) return;
    const timeout = window.setTimeout(async () => {
      setSyncState('syncing');
      try {
        const syncedAt = new Date().toISOString();
        await writeCloudSnapshot(client, session, payloadRef.current, syncedAt);
        setLastSyncedAt(syncedAt);
        setSyncState('synced');
        setMessage('Changes saved to cloud.');
      } catch (error) {
        setSyncState('error');
        setMessage(cloudErrorMessage(error));
      }
    }, 1200);
    return () => window.clearTimeout(timeout);
  }, [client, enabled, payload, session]);

  async function sendMagicLink(email: string) {
    if (!client) throw new Error('Cloud sync is not configured yet.');
    const { error } = await client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin, shouldCreateUser: true },
    });
    if (error) throw error;
    setMessage('Check your email and open the secure sign-in link.');
  }

  async function signOut() {
    if (!client) return;
    const { error } = await client.auth.signOut();
    if (error) throw error;
    setMessage('Signed out. Your data remains available on this device.');
  }

  async function removeCloudData() {
    if (!client || !session) return;
    await deleteCloudData(client, session.user.id);
    const { error } = await client.auth.signOut();
    if (error) throw error;
    initialisedUserRef.current = null;
    setSyncState('local');
    setLastSyncedAt(null);
    setMessage('Cloud backup deleted and account signed out. Local data remains on this device.');
  }

  function exportData() {
    const blob = new Blob([JSON.stringify({
      app: 'Spectra Calculator',
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      data: payloadRef.current,
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spectra-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return {
    configured: Boolean(client),
    session,
    syncState,
    message,
    lastSyncedAt,
    sendMagicLink,
    syncNow,
    signOut,
    removeCloudData,
    exportData,
  };
}

function cloudErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'message' in error) return String(error.message);
  return 'Cloud sync could not complete. Your local data is safe.';
}
