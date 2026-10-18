import React, { useState } from 'react';

interface WorkItemDetailProps {
  item: any;
  userId: string;
  teamId: string;
  onUpdateSuccess: () => void;
}

export default function WorkItemDetail({ item, userId, teamId, onUpdateSuccess }: WorkItemDetailProps) {
  const [title, setTitle] = useState(item.title);
  const [priority, setPriority] = useState(item.priority);
  const [conflictData, setConflictData] = useState<{ client: any; server: any } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Handle atomic claim
  const handleClaim = async () => {
    try {
      const res = await fetch(`http://localhost:4000/items/${item.id}/claim`, {
        method: 'POST',
        headers: {
          'x-user-id': userId,
          'x-team-id': teamId,
          'idempotency-key': `claim-${item.id}-${Date.now()}`,
        },
      });

      if (res.status === 409) {
        alert('⚠️ Conflict: Work item has already been claimed by another operator.');
        return;
      }

      if (res.ok) {
        alert('✅ Work item successfully claimed!');
        onUpdateSuccess();
      }
    } catch (err) {
      console.error('Claim network error:', err);
    }
  };

  // Handle OCC update with 409 conflict diff detection
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setConflictData(null);

    const payload = {
      version: item.version, // Client's optimistic version view
      title,
      priority,
    };

    try {
      const res = await fetch(`http://localhost:4000/items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-team-id': teamId,
          'idempotency-key': `update-${item.id}-${Date.now()}`,
        },
        body: JSON.stringify(payload),
      });

      const responseJson = await res.json();

      if (res.status === 409) {
        // Optimistic Concurrency Control (OCC) collision detected!
        setConflictData({
          client: payload,
          server: responseJson, // Server state diff
        });
        return;
      }

      if (res.ok) {
        alert('✅ Work item updated successfully under OCC guardrail.');
        onUpdateSuccess();
      }
    } catch (err) {
      console.error('Update network error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <h2 style={{ marginTop: 0, fontSize: '1.3rem', color: '#38bdf8' }}>Work Item Inspector</h2>
      
      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', background: '#0f172a', color: '#fff', border: '1px solid #475569' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Priority</label>
          <select 
            value={priority} 
            onChange={(e) => setPriority(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', background: '#0f172a', color: '#fff', border: '1px solid #475569' }}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button 
            type="button" 
            onClick={handleClaim}
            style={{ flex: 1, padding: '0.7rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ⚡ Atomic Claim
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            style={{ flex: 1, padding: '0.7rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {submitting ? 'Saving...' : '💾 Save with OCC'}
          </button>
        </div>
      </form>

      {/* OCC Conflict & Diff Modal Overlay */}
      {conflictData && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#1e293b', border: '2px solid #f87171', padding: '2rem', borderRadius: '8px', width: '500px', maxWidth: '90%' }}>
            <h3 style={{ color: '#f87171', marginTop: 0 }}>🚨 Optimistic Concurrency Conflict (409)</h3>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
              Another operator has modified this work item while you were editing. Your version is out of sync.
            </p>

            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '6px', margin: '1rem 0', fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '0.5rem', color: '#38bdf8' }}><strong>Your Attempted Payload:</strong> {JSON.stringify(conflictData.client)}</div>
              <div style={{ color: '#f87171' }}><strong>Server Conflict Message:</strong> {JSON.stringify(conflictData.server)}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button 
                onClick={() => setConflictData(null)}
                style={{ padding: '0.6rem 1.2rem', background: '#475569', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Dismiss & Discard Changes
              </button>
              <button 
                onClick={() => {
                  setConflictData(null);
                  onUpdateSuccess(); // Reload fresh state
                }}
                style={{ padding: '0.6rem 1.2rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                🔄 Reload Latest State
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}