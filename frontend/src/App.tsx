// import React, { useState, useEffect } from 'react';
// import WorkItemDetail from './components/WorkItemDetail';

// export default function App() {
//   const [items, setItems] = useState<any[]>([]);
//   const [selectedItem, setSelectedItem] = useState<any | null>(null);
//   const [filterStatus, setFilterStatus] = useState<string>('ALL');
//   const [loading, setLoading] = useState<boolean>(true);
  
//   // Dynamic IDs fetched automatically from your database seeds on mount
//   const [userId, setUserId] = useState<string>('');
//   const [teamId, setTeamId] = useState<string>('');

//   // 1. Dynamic Initialization: Fetch valid infrastructure IDs from backend on mount
//   useEffect(() => {
//     async function initAuth() {
//       try {
//         //Query your baseline database records to extract real seeded operational scopes
//        const res = await fetch('http://localhost:4000/items?limit=1');
//        const data = await res.json();
        
//         if (data.data && data.data.length > 0) {
//           const sampleItem = data.data[0];
//           setTeamId(sampleItem.teamId);
//           // Fall back onto the item's creator tracking column to seed valid user state definitions
//           setUserId(sampleItem.creatorId);
//         }
//       } catch (e) {
//         console.error('⚠️ Identity context auto-initialization exception caught:', e);
//       }
//     }
//     initAuth();
//   }, []);

//   // 2. Fetch items using strict active identity contexts and filter parameters
//   const fetchWorkItems = async () => {
//     setLoading(true);
//     try {
//       let url = 'http://localhost:4000/items?limit=20';
//       if (filterStatus !== 'ALL') {
//         url += `&status=${filterStatus}`;
//       }

//       // Pass required system headers to fulfill backend cross-tenant middleware guards
//       const res = await fetch(url, {
//         headers: {
//           'x-user-id': userId || 'system-anonymous',
//           'x-team-id': teamId || 'system-fallback',
//         },
//       });
//       const data = await res.json();
//       setItems(data.data || []);
      
//       // Keep selected detail items synced with the newest server parameters if changed
//       if (selectedItem) {
//         const freshSelected = (data.data || []).find((i: any) => i.id === selectedItem.id);
//         if (freshSelected) setSelectedItem(freshSelected);
//       }
//     } catch (error) {
//       console.error('❌ Failed to fetch work items:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Re-fetch automatically whenever filter configurations or auth variables update
//   useEffect(() => {
//     if (userId && teamId) {
//       fetchWorkItems();
//     }
//   }, [filterStatus, userId, teamId]);

//   return (
//     <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', padding: '2rem', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
//       <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
//         <div>
//           <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#38bdf8' }}>🚨 Operations Under Pressure</h1>
//           <p style={{ margin: '0.2rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Enterprise Incident Command & Concurrency Dashboard</p>
//         </div>
//         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
//           <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
//             Filter Status:
//             <select 
//               value={filterStatus} 
//               onChange={(e) => setFilterStatus(e.target.value)}
//               style={{ marginLeft: '0.5rem', padding: '0.4rem', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', cursor: 'pointer' }}
//             >
//               <option value="ALL">ALL</option>
//               <option value="OPEN">OPEN</option>
//               <option value="IN_PROGRESS">IN_PROGRESS</option>
//               <option value="RESOLVED">RESOLVED</option>
//               <option value="CLOSED">CLOSED</option>
//             </select>
//           </label>
//         </div>
//       </header>

//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
//         {/* Left Column: Work Item Queue */}
//         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155' }}>
//           <h2 style={{ marginTop: 0, fontSize: '1.2rem', color: '#e2e8f0' }}>Tactical Work Item Queue</h2>
//           {loading ? (
//             <p style={{ color: '#94a3b8' }}>Synchronizing streams...</p>
//           ) : items.length === 0 ? (
//             <p style={{ color: '#94a3b8' }}>No items found. Verify that the backend database seeding remains populated.</p>
//           ) : (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '600px', overflowY: 'auto' }}>
//               {items.map((item) => (
//                 <div 
//                   key={item.id}
//                   onClick={() => setSelectedItem(item)}
//                   style={{
//                     padding: '1rem',
//                     borderRadius: '6px',
//                     background: selectedItem?.id === item.id ? '#334155' : '#0f172a',
//                     border: '1px solid #475569',
//                     cursor: 'pointer',
//                     transition: 'all 0.2s ease',
//                   }}
//                 >
//                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' }}>
//                     <span>{item.type}</span>
//                     <span style={{ color: item.priority === 'URGENT' ? '#f87171' : '#38bdf8', fontWeight: 'bold' }}>{item.priority}</span>
//                   </div>
//                   {/* ✅ Fixed: Mended brackets syntax error to clear the compiler build crash */}
//                   <div style={{ fontWeight: 'bold', margin: '0.4rem 0', color: '#f1f5f9' }}>{item.title}</div>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
//                     <span>Status: {item.status}</span>
//                     <span>v{item.version}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Right Column: Work Item Detail & Concurrency Reconciler */}
//         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155' }}>
//           {selectedItem ? (
//             <WorkItemDetail 
//               item={selectedItem} 
//               userId={userId} 
//               teamId={teamId} 
//               onUpdateSuccess={() => {
//                 fetchWorkItems();
//               }} 
//             />
//           ) : (
//             <div style={{ display: 'flex', height: '100%', minHeight: '300px', alignItems: 'center', justifyContent: 'center', color: '#64748b', textAlign: 'center' }}>
//               Select a work item from the queue to inspect and execute concurrency actions.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect, useCallback } from 'react';
// import WorkItemDetail from './components/WorkItemDetail';

// export default function App() {
//   const [items, setItems] = useState<any[]>([]);
//   const [selectedItem, setSelectedItem] = useState<any | null>(null);
//   const [filterStatus, setFilterStatus] = useState<string>('ALL');
//   const [loading, setLoading] = useState<boolean>(true);
  
//   // Dynamic IDs fetched automatically from your database seeds on mount
//   const [userId, setUserId] = useState<string>('');
//   const [teamId, setTeamId] = useState<string>('');

//   // 1. Optimized Telemetry Data Fetcher Engine
//   const fetchWorkItems = useCallback(async (activeUserId: string, activeTeamId: string) => {
//     setLoading(true);
//     try {
//       let url = 'http://localhost:4000/items?limit=20';
//       if (filterStatus !== 'ALL') {
//         url += `&status=${filterStatus}`;
//       }

//       // Pass explicit authentication contexts to satisfy backend middleware guards
//       const res = await fetch(url, {
//         headers: {
//           'x-user-id': activeUserId,
//           'x-team-id': activeTeamId,
//         },
//       });
//       const data = await res.json();
//       setItems(data.data || []);
      
//       // Maintain state alignment for the active detail panel if it changes
//       if (selectedItem) {
//         const freshSelected = (data.data || []).find((i: any) => i.id === selectedItem.id);
//         if (freshSelected) setSelectedItem(freshSelected);
//       }
//     } catch (error) {
//       console.error('❌ Failed to stream active queue updates:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [filterStatus, selectedItem]);

//   // 2. Unified Bootloader Sequence: Fixes authorization race conditions safely
//   useEffect(() => {
//     async function bootstrapWorkspace() {
//       try {
//         // Query baseline item with administrative system parameters to ensure unblocked retrieval
//         const res = await fetch('http://localhost:4000/items?limit=1', {
//           headers: {
//             'x-user-id': 'system-admin-bypass',
//             'x-team-id': 'system-admin-bypass'
//           }
//         });
//         const data = await res.json();
        
//         // Setup initial default contexts matching your database seeding script parameters
//         let targetUser = 'operator-uuid-fallback'; 
//         let targetTeam = 'team-uuid-fallback';

//         if (data.data && data.data.length > 0) {
//           const sampleItem = data.data[0]; // Safely index target data array structure
//           targetUser = sampleItem.creatorId;
//           targetTeam = sampleItem.teamId;
//         }

//         // Apply state values atomically
//         setUserId(targetUser);
//         setTeamId(targetTeam);

//         // Immediately chain the secondary fetch synchronously using verified scope tokens
//         await fetchWorkItems(targetUser, targetTeam);
//       } catch (e) {
//         console.error('⚠️ Critical application workspace initialization exception caught:', e);
//         setLoading(false); // Closes structural lockup loop to allow interface elements to load fallback matrices
//       }
//     }

//     bootstrapWorkspace();
//   }, [filterStatus, fetchWorkItems]); 

//   return (
//     <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', padding: '2rem', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
//       <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
//         <div>
//           <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#38bdf8' }}>🚨 Operations Under Pressure</h1>
//           <p style={{ margin: '0.2rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Enterprise Incident Command & Concurrency Dashboard</p>
//         </div>
//         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
//           <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
//             Filter Status:
//             <select 
//               value={filterStatus} 
//               onChange={(e) => setFilterStatus(e.target.value)}
//               style={{ marginLeft: '0.5rem', padding: '0.4rem', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', cursor: 'pointer' }}
//             >
//               <option value="ALL">ALL</option>
//               <option value="OPEN">OPEN</option>
//               <option value="IN_PROGRESS">IN_PROGRESS</option>
//               <option value="RESOLVED">RESOLVED</option>
//               <option value="CLOSED">CLOSED</option>
//             </select>
//           </label>
//         </div>
//       </header>

//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
//         {/* Left Column: Work Item Queue */}
//         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155' }}>
//           <h2 style={{ marginTop: 0, fontSize: '1.2rem', color: '#e2e8f0' }}>Tactical Work Item Queue</h2>
//           {loading ? (
//             <p style={{ color: '#94a3b8' }}>Synchronizing streams...</p>
//           ) : items.length === 0 ? (
//             <p style={{ color: '#94a3b8' }}>No items found. Verify that the backend database seeding remains populated.</p>
//           ) : (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '600px', overflowY: 'auto' }}>
//               {items.map((item) => (
//                 <div 
//                   key={item.id}
//                   onClick={() => setSelectedItem(item)}
//                   style={{
//                     padding: '1rem',
//                     borderRadius: '6px',
//                     background: selectedItem?.id === item.id ? '#334155' : '#0f172a',
//                     border: '1px solid #475569',
//                     cursor: 'pointer',
//                     transition: 'all 0.2s ease',
//                   }}
//                 >
//                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' }}>
//                     <span>{item.type}</span>
//                     <span style={{ color: item.priority === 'URGENT' ? '#f87171' : '#38bdf8', fontWeight: 'bold' }}>{item.priority}</span>
//                   </div>
//                   <div style={{ fontWeight: 'bold', margin: '0.4rem 0', color: '#f1f5f9' }}>{item.title}</div>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b' }}>
//                     <span>Status: {item.status}</span>
//                     <span>v{item.version}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Right Column: Work Item Detail & Concurrency Reconciler */}
//         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155' }}>
//           {selectedItem ? (
//             <WorkItemDetail 
//               item={selectedItem} 
//               userId={userId} 
//               teamId={teamId} 
//               onUpdateSuccess={() => {
//                 fetchWorkItems(userId, teamId);
//               }} 
//             />
//           ) : (
//             <div style={{ display: 'flex', height: '100%', minHeight: '300px', alignItems: 'center', justifyContent: 'center', color: '#64748b', textAlign: 'center' }}>
//               Select a work item from the queue to inspect and execute concurrency actions.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import WorkItemDetail from './components/WorkItemDetail';

// export default function App() {
//   const [items, setItems] = useState<any[]>([]);
//   const [selectedItem, setSelectedItem] = useState<any | null>(null);
//   const [filterStatus, setFilterStatus] = useState<string>('ALL');
//   const [loading, setLoading] = useState<boolean>(true);
  
//   // Storage for live seeded dynamic UUIDs fetched on boot
//   const [userId, setUserId] = useState<string>('');
//   const [teamId, setTeamId] = useState<string>('');

//   // 1. Core Telemetry Data Fetcher Engine
//   const fetchWorkItems = async (activeUserId: string, activeTeamId: string) => {
//     setLoading(true);
//     try {
//       let url = 'http://localhost:4000/items?limit=20';
//       if (filterStatus !== 'ALL') {
//         url += `&status=${filterStatus}`;
//       }

//       // Explicitly pass active dynamic IDs inside the request headers
//       const res = await fetch(url, {
//         headers: {
//           'x-user-id': activeUserId,
//           'x-team-id': activeTeamId,
//         },
//       });
//       const data = await res.json();
//       setItems(data.data || []);
      
//       if (selectedItem) {
//         const freshSelected = (data.data || []).find((i: any) => i.id === selectedItem.id);
//         if (freshSelected) setSelectedItem(freshSelected);
//       }
//     } catch (error) {
//       console.error('❌ Data stream synchronization exception:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 2. Lifecycle Bootloader: Dynamically extracts authentic database tracking IDs
//   useEffect(() => {
//     async function bootstrapWorkspace() {
//       try {
//         // Query a single item block with bypass headers to harvest real UUID tokens
//         const res = await fetch('http://localhost:4000/items?limit=1', {
//           headers: {
//             'x-user-id': 'bypass',
//             'x-team-id': 'bypass'
//           }
//         });
//         const data = await res.json();
        
//         if (data.data && data.data.length > 0) {
//           const sampleItem = data.data[0]; // Extract the first item array index object slot
//           const realUserUuid = sampleItem.creatorId;
//           const realTeamUuid = sampleItem.teamId;

//           // Commit valid dynamic parameters directly to application state layers
//           setUserId(realUserUuid);
//           setTeamId(realTeamUuid);

//           // Synchronously run the secondary database data stream fetch loop instantly
//           await fetchWorkItems(realUserUuid, realTeamUuid);
//         } else {
//           console.warn("⚠️ Database returns an empty dataset. Re-run npx tsx prisma/seed.ts");
//           setLoading(false);
//         }
//       } catch (e) {
//         console.error('⚠️ Critical UI bootloader fault caught:', e);
//         setLoading(false);
//       }
//     }

//     bootstrapWorkspace();
//   }, [filterStatus]); // Syncs perfectly with dashboard selector triggers

//   return (
//     <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', padding: '2rem', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
//       <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
//         <div>
//           <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#38bdf8' }}>🚨 Operations Under Pressure</h1>
//           <p style={{ margin: '0.2rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Enterprise Incident Command & Concurrency Dashboard</p>
//         </div>
//         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
//           <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
//             Filter Status:
//             <select 
//               value={filterStatus} 
//               onChange={(e) => setFilterStatus(e.target.value)}
//               style={{ marginLeft: '0.5rem', padding: '0.4rem', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', cursor: 'pointer' }}
//             >
//               <option value="ALL">ALL</option>
//               <option value="OPEN">OPEN</option>
//               <option value="IN_PROGRESS">IN_PROGRESS</option>
//               <option value="RESOLVED">RESOLVED</option>
//               <option value="CLOSED">CLOSED</option>
//             </select>
//           </label>
//         </div>
//       </header>

//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
//         {/* Left Column: Work Item List */}
//         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155' }}>
//           <h2 style={{ marginTop: 0, fontSize: '1.2rem', color: '#e2e8f0' }}>Tactical Work Item Queue</h2>
//           {loading ? (
//             <p style={{ color: '#94a3b8' }}>Synchronizing streams...</p>
//           ) : items.length === 0 ? (
//             <p style={{ color: '#94a3b8' }}>No items found. Verify that the backend database seeding remains populated.</p>
//           ) : (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '600px', overflowY: 'auto' }}>
//               {items.map((item) => (
//                 <div 
//                   key={item.id}
//                   onClick={() => setSelectedItem(item)}
//                   style={{
//                     padding: '1rem',
//                     borderRadius: '6px',
//                     background: selectedItem?.id === item.id ? '#334155' : '#0f172a',
//                     border: '1px solid #475569',
//                     cursor: 'pointer',
//                     transition: 'all 0.2s ease',
//                   }}
//                 >
//                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' }}>
//                     <span>{item.type}</span>
//                     <span style={{ color: item.priority === 'URGENT' ? '#f87171' : '#38bdf8', fontWeight: 'bold' }}>{item.priority}</span>
//                   </div>
//                   <div style={{ fontWeight: 'bold', margin: '0.4rem 0', color: '#f1f5f9' }}>{item.title}</div>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8' }}>
//                     <span>Status: {item.status}</span>
//                     <span>v{item.version}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Right Column: Work Item Detail & Concurrency Actions */}
//         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155' }}>
//           {selectedItem ? (
//             <WorkItemDetail 
//               item={selectedItem} 
//               userId={userId} 
//               teamId={teamId} 
//               onUpdateSuccess={() => fetchWorkItems(userId, teamId)} 
//             />
//           ) : (
//             <div style={{ display: 'flex', height: '100%', minHeight: '300px', alignItems: 'center', justifyContent: 'center', color: '#64748b', textAlign: 'center' }}>
//               Select a work item from the queue to inspect and execute concurrency actions.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import WorkItemDetail from './components/WorkItemDetail';

// export default function App() {
//   const [items, setItems] = useState<any[]>([]);
//   const [selectedItem, setSelectedItem] = useState<any | null>(null);
//   const [filterStatus, setFilterStatus] = useState<string>('ALL');
//   const [loading, setLoading] = useState<boolean>(true);
  
//   // Storage for live seeded dynamic UUIDs fetched on boot
//   const [userId, setUserId] = useState<string>('');
//   const [teamId, setTeamId] = useState<string>('');

//   // 1. Core Telemetry Data Fetcher Engine
//   const fetchWorkItems = async (activeUserId: string, activeTeamId: string) => {
//     setLoading(true);
//     try {
//       let url = 'http://localhost:4000/items?limit=20';
//       if (filterStatus !== 'ALL') {
//         url += `&status=${filterStatus}`;
//       }

//       // Explicitly pass active dynamic IDs inside the request headers
//       const res = await fetch(url, {
//         headers: {
//           'x-user-id': activeUserId,
//           'x-team-id': activeTeamId,
//         },
//       });
//       const data = await res.json();
//       setItems(data.data || []);
      
//       if (selectedItem) {
//         const freshSelected = (data.data || []).find((i: any) => i.id === selectedItem.id);
//         if (freshSelected) setSelectedItem(freshSelected);
//       }
//     } catch (error) {
//       console.error('❌ Data stream synchronization exception:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 2. Lifecycle Bootloader: Automatically bypasses initialization auth blocks
//   useEffect(() => {
//     async function bootstrapWorkspace() {
//       try {
//         // ✅ FIXED: Pass valid fallback system headers to satisfy the backend auth middleware
//         const res = await fetch('http://localhost:4000/items?limit=1', {
//           headers: {
//             'x-user-id': 'system-anonymous',
//             'x-team-id': 'system-fallback'
//           }
//         });
//         const data = await res.json();
        
//         if (data.data && data.data.length > 0) {
//           const sampleItem = data.data[0]; // Extract the first item array index object slot
//           const realUserUuid = sampleItem.creatorId;
//           const realTeamUuid = sampleItem.teamId;

//           // Commit valid dynamic parameters directly to application state layers
//           setUserId(realUserUuid);
//           setTeamId(realTeamUuid);

//           // Synchronously run the secondary database data stream fetch loop instantly
//           await fetchWorkItems(realUserUuid, realTeamUuid);
//         } else {
//           console.warn("⚠️ Database returns an empty dataset. Re-run npx tsx prisma/seed.ts");
//           setLoading(false);
//         }
//       } catch (e) {
//         console.error('⚠️ Critical UI bootloader fault caught:', e);
//         setLoading(false);
//       }
//     }

//     bootstrapWorkspace();
//   }, [filterStatus]); // Syncs perfectly with dashboard selector triggers

//   return (
//     <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', padding: '2rem', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
//       <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
//         <div>
//           <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#38bdf8' }}>🚨 Operations Under Pressure</h1>
//           <p style={{ margin: '0.2rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Enterprise Incident Command & Concurrency Dashboard</p>
//         </div>
//         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
//           <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
//             Filter Status:
//             <select 
//               value={filterStatus} 
//               onChange={(e) => setFilterStatus(e.target.value)}
//               style={{ marginLeft: '0.5rem', padding: '0.4rem', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', cursor: 'pointer' }}
//             >
//               <option value="ALL">ALL</option>
//               <option value="OPEN">OPEN</option>
//               <option value="IN_PROGRESS">IN_PROGRESS</option>
//               <option value="RESOLVED">RESOLVED</option>
//               <option value="CLOSED">CLOSED</option>
//             </select>
//           </label>
//         </div>
//       </header>

//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
//         {/* Left Column: Work Item List */}
//         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155' }}>
//           <h2 style={{ marginTop: 0, fontSize: '1.2rem', color: '#e2e8f0' }}>Tactical Work Item Queue</h2>
//           {loading ? (
//             <p style={{ color: '#94a3b8' }}>Synchronizing streams...</p>
//           ) : items.length === 0 ? (
//             <p style={{ color: '#94a3b8' }}>No items found. Verify that the backend database seeding remains populated.</p>
//           ) : (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '600px', overflowY: 'auto' }}>
//               {items.map((item) => (
//                 <div 
//                   key={item.id}
//                   onClick={() => setSelectedItem(item)}
//                   style={{
//                     padding: '1rem',
//                     borderRadius: '6px',
//                     background: selectedItem?.id === item.id ? '#334155' : '#0f172a',
//                     border: '1px solid #475569',
//                     cursor: 'pointer',
//                     transition: 'all 0.2s ease',
//                   }}
//                 >
//                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' }}>
//                     <span>{item.type}</span>
//                     <span style={{ color: item.priority === 'URGENT' ? '#f87171' : '#38bdf8', fontWeight: 'bold' }}>{item.priority}</span>
//                   </div>
//                   <div style={{ fontWeight: 'bold', margin: '0.4rem 0', color: '#f1f5f9' }}>{item.title}</div>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
//                     <span>Status: {item.status}</span>
//                     <span>v{item.version}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Right Column: Work Item Detail & Concurrency Actions */}
//         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155' }}>
//           {selectedItem ? (
//             <WorkItemDetail 
//               item={selectedItem} 
//               userId={userId} 
//               teamId={teamId} 
//               onUpdateSuccess={() => fetchWorkItems(userId, teamId)} 
//             />
//           ) : (
//             <div style={{ display: 'flex', height: '100%', minHeight: '300px', alignItems: 'center', justifyContent: 'center', color: '#64748b', textAlign: 'center' }}>
//               Select a work item from the queue to inspect and execute concurrency actions.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from 'react';
// import WorkItemDetail from './components/WorkItemDetail';

// export default function App() {
//   const [items, setItems] = useState<any[]>([]);
//   const [selectedItem, setSelectedItem] = useState<any | null>(null);
//   const [filterStatus, setFilterStatus] = useState<string>('ALL');
//   const [loading, setLoading] = useState<boolean>(true);
//   const [errorBanner, setErrorBanner] = useState<string | null>(null);
  
//   // Session State
//   const [userId, setUserId] = useState<string>('');
//   const [teamId, setTeamId] = useState<string>('');
//   const [isInitialized, setIsInitialized] = useState<boolean>(false);

//   // 1. Phase 1: Initialize Session Credentials on Mount Only
//   useEffect(() => {
//     async function initializeSession() {
//       try {
//         // Fetch a single item to dynamically extract valid seeded foreign keys
//         const res = await fetch('http://localhost:4000/items?limit=1');
//         const json = await res.json();

//         if (json.data && json.data.length > 0) {
//           const sample = json.data[0];
//           setUserId(sample.creatorId);
//           setTeamId(sample.teamId);
//           setIsInitialized(true);
//         } else {
//           // Fallback to known default seed IDs if table is unseeded or empty
//           console.warn('⚠️ No items found in response. Falling back to default seed credentials.');
//           setUserId('default-user-id');
//           setTeamId('default-team-id');
//           setIsInitialized(true);
//         }
//       } catch (err) {
//         console.error('❌ Critical session initialization failure:', err);
//         setErrorBanner('Failed to connect to backend engine on http://localhost:4000. Verify server status.');
//         setLoading(false);
//       }
//     }

//     initializeSession();
//   }, []); // Runs strictly once on mount

//   // 2. Phase 2: Reactive Data Fetcher (Triggered when Session is Ready or Filter Changes)
//   const fetchWorkItems = async (activeUser: string, activeTeam: string) => {
//     if (!activeUser || !activeTeam) return;
    
//     setLoading(true);
//     setErrorBanner(null);

//     try {
//       let url = 'http://localhost:4000/items?limit=20';
//       if (filterStatus !== 'ALL') {
//         url += `&status=${filterStatus}`;
//       }

//       const res = await fetch(url, {
//         headers: {
//           'x-user-id': activeUser,
//           'x-team-id': activeTeam,
//         },
//       });

//       if (!res.ok) {
//         throw new Error(`Server responded with status ${res.status}`);
//       }

//       const data = await res.json();
//       setItems(data.data || []);

//       // Maintain selection sync if active item updates
//       if (selectedItem) {
//         const freshSelected = (data.data || []).find((i: any) => i.id === selectedItem.id);
//         if (freshSelected) setSelectedItem(freshSelected);
//       }
//     } catch (error: any) {
//       console.error('❌ Data stream synchronization exception:', error);
//       setErrorBanner(`Data fetch error: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Trigger data fetch whenever session is initialized or filter changes
//   useEffect(() => {
//     if (isInitialized && userId && teamId) {
//       fetchWorkItems(userId, teamId);
//     }
//   }, [isInitialized, filterStatus]);

//   return (
//     <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', padding: '2rem', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
//       <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
//         <div>
//           <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#38bdf8' }}>🚨 Operations Under Pressure</h1>
//           <p style={{ margin: '0.2rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Enterprise Incident Command & Concurrency Dashboard</p>
//         </div>
//         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
//           <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
//             Filter Status:
//             <select 
//               value={filterStatus} 
//               onChange={(e) => setFilterStatus(e.target.value)}
//               style={{ marginLeft: '0.5rem', padding: '0.4rem', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', cursor: 'pointer' }}
//             >
//               <option value="ALL">ALL</option>
//               <option value="OPEN">OPEN</option>
//               <option value="IN_PROGRESS">IN_PROGRESS</option>
//               <option value="RESOLVED">RESOLVED</option>
//               <option value="CLOSED">CLOSED</option>
//             </select>
//           </label>
//         </div>
//       </header>

//       {errorBanner && (
//         <div style={{ background: '#7f1d1d', border: '1px solid #f87171', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', color: '#fca5a5' }}>
//           <strong>System Alert:</strong> {errorBanner}
//         </div>
//       )}

//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
//         {/* Left Column: Work Item List */}
//         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155' }}>
//           <h2 style={{ marginTop: 0, fontSize: '1.2rem', color: '#e2e8f0' }}>Tactical Work Item Queue</h2>
//           {loading ? (
//             <p style={{ color: '#94a3b8' }}>Synchronizing streams...</p>
//           ) : items.length === 0 ? (
//             <p style={{ color: '#94a3b8' }}>No items found matching criteria.</p>
//           ) : (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '600px', overflowY: 'auto' }}>
//               {items.map((item) => (
//                 <div 
//                   key={item.id}
//                   onClick={() => setSelectedItem(item)}
//                   style={{
//                     padding: '1rem',
//                     borderRadius: '6px',
//                     background: selectedItem?.id === item.id ? '#334155' : '#0f172a',
//                     border: '1px solid #475569',
//                     cursor: 'pointer',
//                     transition: 'all 0.2s ease',
//                   }}
//                 >
//                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' }}>
//                     <span>{item.type}</span>
//                     <span style={{ color: item.priority === 'URGENT' ? '#f87171' : '#38bdf8', fontWeight: 'bold' }}>{item.priority}</span>
//                   </div>
//                   <div style={{ fontWeight: 'bold', margin: '0.4rem 0', color: '#f1f5f9' }}>{item.title}</div>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
//                     <span>Status: {item.status}</span>
//                     <span>v{item.version}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Right Column: Work Item Detail & Concurrency Actions */}
//         <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155' }}>
//           {selectedItem ? (
//             <WorkItemDetail 
//               item={selectedItem} 
//               userId={userId} 
//               teamId={teamId} 
//               onUpdateSuccess={() => fetchWorkItems(userId, teamId)} 
//             />
//           ) : (
//             <div style={{ display: 'flex', height: '100%', minHeight: '300px', alignItems: 'center', justifyContent: 'center', color: '#64748b', textAlign: 'center' }}>
//               Select a work item from the queue to inspect and execute concurrency actions.
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import WorkItemDetail from './components/WorkItemDetail';

export default function App() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  
  // Session State
  const [userId, setUserId] = useState<string>('');
  const [teamId, setTeamId] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // 1. Phase 1: Initialize Session Credentials on Mount Securely
  useEffect(() => {
    async function initializeSession() {
      try {
        // ✅ FIXED: Targets the public bootstrap endpoint instead of the protected root route
        const res = await fetch('http://localhost:4000/items/bootstrap');
        
        if (!res.ok) {
          throw new Error(`Server bootstrap error with status: ${res.status}`);
        }
        
        const json = await res.json();

        // Safely extract from your custom backend structure mapping: { data: sampleItem }
        if (json.data) {
          const sample = json.data;
          setUserId(sample.creatorId);
          setTeamId(sample.teamId);
          setIsInitialized(true);
        } else {
          console.warn('⚠️ No seeded items found in response database. Falling back to default seed credentials.');
          setUserId('default-user-id');
          setTeamId('default-team-id');
          setIsInitialized(true);
        }
      } catch (err: any) {
        console.error('❌ Critical session initialization failure:', err);
        setErrorBanner(`Failed to connect to backend engine on http://localhost:4000: ${err.message || err}`);
        setLoading(false);
      }
    }

    initializeSession();
  }, []); // Runs strictly once on mount

  // 2. Phase 2: Reactive Data Fetcher Engine
  const fetchWorkItems = async (activeUser: string, activeTeam: string) => {
    if (!activeUser || !activeTeam) return;
    
    setLoading(true);
    setErrorBanner(null);

    try {
      let url = 'http://localhost:4000/items?limit=20';
      if (filterStatus !== 'ALL') {
        url += `&status=${filterStatus}`;
      }

      const res = await fetch(url, {
        headers: {
          'x-user-id': activeUser,
          'x-team-id': activeTeam,
        },
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setItems(data.data || []);

      // Maintain selection sync if active item updates
      if (selectedItem) {
        const freshSelected = (data.data || []).find((i: any) => i.id === selectedItem.id);
        if (freshSelected) setSelectedItem(freshSelected);
      }
    } catch (error: any) {
      console.error('❌ Data stream synchronization exception:', error);
      setErrorBanner(`Data fetch error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Trigger data fetch whenever session is initialized or filter changes
  useEffect(() => {
    if (isInitialized && userId && teamId) {
      fetchWorkItems(userId, teamId);
    }
  }, [isInitialized, filterStatus]);

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', padding: '2rem', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#38bdf8' }}>🚨 Operations Under Pressure</h1>
          <p style={{ margin: '0.2rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Enterprise Incident Command & Concurrency Dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            Filter Status:
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ marginLeft: '0.5rem', padding: '0.4rem', borderRadius: '4px', background: '#1e293b', color: '#fff', border: '1px solid #475569', cursor: 'pointer' }}
            >
              <option value="ALL">ALL</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </label>
        </div>
      </header>

      {errorBanner && (
        <div style={{ background: '#7f1d1d', border: '1px solid #f87171', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', color: '#fca5a5' }}>
          <strong>System Alert:</strong> {errorBanner}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left Column: Work Item List */}
        <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155' }}>
          <h2 style={{ marginTop: 0, fontSize: '1.2rem', color: '#e2e8f0' }}>Tactical Work Item Queue</h2>
          {loading ? (
            <p style={{ color: '#94a3b8' }}>Synchronizing streams...</p>
          ) : items.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No items found matching criteria.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '600px', overflowY: 'auto' }}>
              {items.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    padding: '1rem',
                    borderRadius: '6px',
                    background: selectedItem?.id === item.id ? '#334155' : '#0f172a',
                    border: '1px solid #475569',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8' }}>
                    <span>{item.type}</span>
                    <span style={{ color: item.priority === 'URGENT' ? '#f87171' : '#38bdf8', fontWeight: 'bold' }}>{item.priority}</span>
                  </div>
                  <div style={{ fontWeight: 'bold', margin: '0.4rem 0', color: '#f1f5f9' }}>{item.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                    <span>Status: {item.status}</span>
                    <span>v{item.version}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Work Item Detail & Concurrency Actions */}
        <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #334155' }}>
          {selectedItem ? (
            <WorkItemDetail 
              item={selectedItem} 
              userId={userId} 
              teamId={teamId} 
              onUpdateSuccess={() => fetchWorkItems(userId, teamId)} 
            />
          ) : (
            <div style={{ display: 'flex', height: '100%', minHeight: '300px', alignItems: 'center', justifyContent: 'center', color: '#64748b', textAlign: 'center' }}>
              Select a work item from the queue to inspect and execute concurrency actions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
