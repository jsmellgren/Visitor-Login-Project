import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [visitors, setVisitors] = useState([]);
  const [isAdminVisible, setIsAdminVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchVisitors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/visitors');
      const data = await response.json();
      setVisitors(data);
    } catch (err) {
      console.error("Error fetching visitor data:", err);
    }
  };

  useEffect(() => {
    if (isAdminVisible) fetchVisitors();
  }, [isAdminVisible]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!name || !purpose) {
      setStatusMessage("⚠️ Please enter both your name and purpose.");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, purpose })
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage(`✅ ${data.message}`);
        setName('');
        setPurpose('');
        if (isAdminVisible) fetchVisitors();
      } else {
        setStatusMessage(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage("❌ Could not connect to the server.");
    }
  };

  const handleCheckOut = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/checkout/${id}`, { method: 'PUT' });
      if (response.ok) fetchVisitors();
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  const handleAdminToggle = () => {
    if (isAdminVisible) {
      setIsAdminVisible(false);
    } else {
      const password = prompt("Enter Admin Passcode to view logs:");
      if (password === "admin123") setIsAdminVisible(true);
    }
  };

  // LIVE METRICS CALCULATIONS
  const totalVisitors = visitors.length;
  const currentlyInLobby = visitors.filter(v => !v.checked_out_at).length;
  
  const completedVisits = visitors.filter(v => v.checked_out_at);
  let avgStayText = "—";
  if (completedVisits.length > 0) {
    const totalMinutes = completedVisits.reduce((acc, v) => {
      const start = new Date(v.checked_in_at);
      const end = new Date(v.checked_out_at);
      return acc + ((end - start) / 1000 / 60);
    }, 0);
    const avgMinutes = Math.round(totalMinutes / completedVisits.length);
    avgStayText = `${avgMinutes} mins`;
  }

  // FILTER LOGIC
  const filteredVisitors = visitors.filter(visitor => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      visitor.name.toLowerCase().includes(lowerSearch) ||
      visitor.purpose.toLowerCase().includes(lowerSearch)
    );
  });

  // 1. ADVANCED FEATURE: PURE JAVASCRIPT CSV EXPORTER
  const downloadCSV = () => {
    if (filteredVisitors.length === 0) {
      alert("No data available to export.");
      return;
    }

    // Define the spreadsheet headers
    const headers = ["ID", "Visitor Name", "Purpose of Visit", "Check-In Time", "Check-Out Time"];
    
    // Map data rows into comma-separated text strings
    const rows = filteredVisitors.map(v => [
      v.id,
      `"${v.name.replace(/"/g, '""')}"`, // Escape quotes for CSV safety
      `"${v.purpose.replace(/"/g, '""')}"`,
      new Date(v.checked_in_at).toLocaleString(),
      v.checked_out_at ? new Date(v.checked_out_at).toLocaleString() : "Still In Lobby"
    ]);

    // Combine headers and rows with line breaks
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    // Create a secure virtual download link in browser memory
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Lobby_Visitor_Log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click(); // Programmatically click the hidden link to force download
    document.body.removeChild(link);
  };

  return (
    <div className="app-container">
      
      {/* FORM CARD */}
      <div className="card form-card">
        <h2 style={{ textAlign: 'center', color: '#2563eb', marginTop: 0 }}>Lobby Check-In</h2>
        <form onSubmit={handleCheckIn}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label>Purpose of Visit</label>
            <input type="text" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g., Interview" />
          </div>
          <button type="submit" className="btn-primary">Check In</button>
        </form>
        {statusMessage && <p style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>{statusMessage}</p>}
      </div>

      {/* SECURE ADMIN VIEW */}
      {isAdminVisible && (
        <div>
          {/* ANALYTICS METRICS BAR */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div className="card" style={{ flex: 1, margin: 0, textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Visitors</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb', marginTop: '5px' }}>{totalVisitors}</div>
            </div>
            <div className="card" style={{ flex: 1, margin: 0, textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Currently In Lobby</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b', marginTop: '5px' }}>{currentlyInLobby}</div>
            </div>
            <div className="card" style={{ flex: 1, margin: 0, textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Avg. Visit Time</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981', marginTop: '5px' }}>{avgStayText}</div>
            </div>
          </div>

          {/* VISITOR LOG TABLE SECTION */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, flex: 1 }}>🔒 Visitor Log</h3>
              
              {/* 2. THE EXPORT DATA BUTTON */}
              <button 
                onClick={downloadCSV}
                style={{ padding: '8px 14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', marginRight: '10px' }}
              >
                📥 Export to CSV
              </button>

              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Search by name or purpose..." 
                style={{ maxWidth: '250px', padding: '8px 12px', fontSize: '14px', margin: 0 }}
              />
            </div>

            {filteredVisitors.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No matching visitors found.</p>
            ) : (
              <table className="visitor-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Purpose</th>
                    <th>Checked In</th>
                    <th>Checked Out</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitors.map((visitor) => (
                    <tr key={visitor.id} style={{ opacity: visitor.checked_out_at ? 0.6 : 1 }}>
                      <td>{visitor.id}</td>
                      <td>{visitor.name}</td>
                      <td>{visitor.purpose}</td>
                      <td>{new Date(visitor.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td style={{ color: visitor.checked_out_at ? '#ef4444' : '#64748b' }}>
                        {visitor.checked_out_at ? new Date(visitor.checked_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {!visitor.checked_out_at ? (
                          <button onClick={() => handleCheckOut(visitor.id)} className="btn-danger">Check Out</button>
                        ) : (
                          <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '13px' }}>Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* FOOTER TOGGLE */}
      <div style={{ textAlign: 'center' }}>
        <button onClick={handleAdminToggle} style={{ background: 'none', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}>
          {isAdminVisible ? "Close Admin Panel" : "Open Admin Panel"}
        </button>
      </div>

    </div>
  );
}

export default App;