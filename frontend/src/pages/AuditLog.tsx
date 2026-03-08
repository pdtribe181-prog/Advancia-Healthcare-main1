import React, { useState, useEffect, useCallback, CSSProperties } from 'react';
import { api } from '../services/api';
import '../styles.css';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  category: 'auth' | 'payment' | 'admin' | 'user' | 'system' | 'security';
  actor: {
    id: string;
    email: string;
    role: string;
  };
  resource: {
    type: string;
    id: string;
  };
  details: Record<string, string | number | boolean>;
  ip_address: string;
  user_agent: string;
  status: 'success' | 'failure' | 'warning';
}

function inferCategory(action: string): AuditLogEntry['category'] {
  if (action.startsWith('auth') || action.includes('login') || action.includes('signup')) return 'auth';
  if (action.includes('payment') || action.includes('transaction') || action.includes('refund')) return 'payment';
  if (action.startsWith('admin') || action.includes('role')) return 'admin';
  if (action.includes('security') || action.includes('2fa') || action.includes('password')) return 'security';
  if (action.includes('system') || action.includes('rate_limit')) return 'system';
  return 'user';
}

const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: 'var(--bg)',
  padding: '120px 24px 80px',
};

const containerStyle: CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '24px',
  flexWrap: 'wrap',
  gap: '16px',
};

const titleStyle: CSSProperties = {
  fontSize: '28px',
  fontWeight: 800,
  color: '#ffffff',
  marginBottom: '4px',
};

const subtitleStyle: CSSProperties = {
  fontSize: '15px',
  color: 'rgba(255,255,255,0.6)',
};

const filtersCardStyle: CSSProperties = {
  background: 'var(--bg-card)',
  borderRadius: '16px',
  padding: '20px',
  border: '1px solid rgba(255,255,255,0.06)',
  marginBottom: '20px',
};

const filtersRowStyle: CSSProperties = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap',
};

const filterGroupStyle: CSSProperties = {
  flex: '1',
  minWidth: '150px',
};

const filterLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.5)',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.03)',
  color: '#ffffff',
  fontSize: '14px',
  outline: 'none',
};

const selectStyle: CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
  appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
};

const tableCardStyle: CSSProperties = {
  background: 'var(--bg-card)',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.06)',
  overflow: 'hidden',
};

const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const thStyle: CSSProperties = {
  padding: '14px 16px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.5)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  background: 'rgba(255,255,255,0.02)',
};

const tdStyle: CSSProperties = {
  padding: '14px 16px',
  fontSize: '14px',
  color: 'rgba(255,255,255,0.8)',
  borderBottom: '1px solid rgba(255,255,255,0.04)',
};

const rowHoverStyle: CSSProperties = {
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const badgeStyle = (type: 'success' | 'failure' | 'warning' | 'auth' | 'payment' | 'admin' | 'user' | 'system' | 'security'): CSSProperties => {
  const colors: Record<string, { bg: string; text: string }> = {
    success: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
    failure: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
    auth: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
    payment: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981' },
    admin: { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7' },
    user: { bg: 'rgba(96, 128, 245, 0.15)', text: 'var(--primary)' },
    system: { bg: 'rgba(107, 114, 128, 0.15)', text: '#6b7280' },
    security: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
  };
  const c = colors[type] || colors.system;
  return {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    background: c.bg,
    color: c.text,
    textTransform: 'capitalize',
  };
};

const codeStyle: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '12px',
  color: 'rgba(255,255,255,0.6)',
};

const modalOverlayStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px',
};

const modalStyle: CSSProperties = {
  background: 'var(--bg-card)',
  borderRadius: '20px',
  padding: '32px',
  width: '100%',
  maxWidth: '600px',
  maxHeight: '80vh',
  overflow: 'auto',
  border: '1px solid rgba(255,255,255,0.1)',
};

const modalHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
};

const modalTitleStyle: CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#ffffff',
};

const closeBtnStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.6)',
  fontSize: '24px',
  cursor: 'pointer',
};

const detailRowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '120px 1fr',
  gap: '8px',
  padding: '12px 0',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const detailLabelStyle: CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.5)',
};

const detailValueStyle: CSSProperties = {
  fontSize: '14px',
  color: '#ffffff',
  wordBreak: 'break-all',
};

const jsonBoxStyle: CSSProperties = {
  background: 'rgba(0,0,0,0.3)',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '16px',
  fontFamily: 'monospace',
  fontSize: '12px',
  color: '#10b981',
  whiteSpace: 'pre-wrap',
  overflow: 'auto',
};

const paginationStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 20px',
  borderTop: '1px solid rgba(255,255,255,0.06)',
};

const paginationInfoStyle: CSSProperties = {
  fontSize: '14px',
  color: 'rgba(255,255,255,0.5)',
};

const paginationBtnsStyle: CSSProperties = {
  display: 'flex',
  gap: '8px',
};

const pageBtnStyle = (disabled: boolean): CSSProperties => ({
  padding: '8px 16px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: disabled ? 'transparent' : 'rgba(255,255,255,0.05)',
  color: disabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontWeight: 500,
  fontSize: '13px',
});

const exportBtnStyle: CSSProperties = {
  padding: '10px 20px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.8)',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
};

export const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filters.category) params.set('action', filters.category);
      const res = await api.get<{ data: Record<string, unknown>[]; pagination: { total: number; totalPages: number } }>(
        `/admin/audit-log?${params.toString()}`
      );
      // Map backend compliance_logs to AuditLogEntry shape
      const mapped: AuditLogEntry[] = (res.data || []).map((log: Record<string, unknown>) => ({
        id: log.id,
        timestamp: log.created_at || log.timestamp,
        action: log.action_type || log.action || 'unknown',
        category: inferCategory(log.action_type || log.action || ''),
        actor: {
          id: log.user_id || log.user?.id || 'unknown',
          email: log.user?.email || log.user?.full_name || 'unknown',
          role: log.user?.role || 'unknown',
        },
        resource: {
          type: log.resource_type || 'unknown',
          id: log.resource_id || 'unknown',
        },
        details: log.details || {},
        ip_address: log.ip_address || '',
        user_agent: log.user_agent || '',
        status: log.status || 'success',
      }));
      setLogs(mapped);
      setTotal(res.pagination?.total ?? mapped.length);
      setTotalPages(res.pagination?.totalPages ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [page, filters.category]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filteredLogs = logs.filter(log => {
    if (filters.search && !log.action.toLowerCase().includes(filters.search.toLowerCase()) &&
        !log.actor.email.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status && log.status !== filters.status) return false;
    return true;
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleExport = () => {
    const data = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Audit Log</h1>
            <p style={subtitleStyle}>View all system activity and security events</p>
          </div>
          <button style={exportBtnStyle} onClick={handleExport}>
            ⬇️ Export JSON
          </button>
        </div>

        {/* Filters */}
        <div style={filtersCardStyle}>
          <div style={filtersRowStyle}>
            <div style={{ ...filterGroupStyle, minWidth: '200px' }}>
              <label style={filterLabelStyle}>Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                placeholder="Action or email..."
                style={inputStyle}
              />
            </div>
            <div style={filterGroupStyle}>
              <label style={filterLabelStyle}>Category</label>
              <select
                value={filters.category}
                onChange={e => setFilters({ ...filters, category: e.target.value })}
                style={selectStyle}
              >
                <option value="">All Categories</option>
                <option value="auth">Authentication</option>
                <option value="payment">Payment</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
                <option value="system">System</option>
                <option value="security">Security</option>
              </select>
            </div>
            <div style={filterGroupStyle}>
              <label style={filterLabelStyle}>Status</label>
              <select
                value={filters.status}
                onChange={e => setFilters({ ...filters, status: e.target.value })}
                style={selectStyle}
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="warning">Warning</option>
              </select>
            </div>
            <div style={filterGroupStyle}>
              <label style={filterLabelStyle}>From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => setFilters({ ...filters, dateFrom: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div style={filterGroupStyle}>
              <label style={filterLabelStyle}>To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => setFilters({ ...filters, dateTo: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ ...tableCardStyle, padding: '48px', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px' }}>Loading audit logs…</p>
          </div>
        ) : error ? (
          <div style={{ ...tableCardStyle, padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#ef4444', fontSize: '15px', marginBottom: '12px' }}>{error}</p>
            <button style={exportBtnStyle} onClick={fetchLogs}>Retry</button>
          </div>
        ) : (
        <div style={tableCardStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Timestamp</th>
                <th style={thStyle}>Action</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Actor</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr
                  key={log.id}
                  style={rowHoverStyle}
                  onClick={() => setSelectedLog(log)}
                  onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={tdStyle}>{formatDate(log.timestamp)}</td>
                  <td style={tdStyle}>
                    <span style={codeStyle}>{log.action}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={badgeStyle(log.category)}>{log.category}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: '14px', color: '#ffffff' }}>{log.actor.email}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{log.actor.role}</div>
                  </td>
                  <td style={tdStyle}>
                    <span style={badgeStyle(log.status)}>{log.status}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={codeStyle}>{log.ip_address}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={paginationStyle}>
            <span style={paginationInfoStyle}>
              Showing {filteredLogs.length} of {total} entries — Page {page} of {totalPages}
            </span>
            <div style={paginationBtnsStyle}>
              <button style={pageBtnStyle(page <= 1)} disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Previous</button>
              <button style={pageBtnStyle(page >= totalPages)} disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          </div>
        </div>
        )}

        {/* Detail Modal */}
        {selectedLog && (
          <div style={modalOverlayStyle} onClick={() => setSelectedLog(null)}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
              <div style={modalHeaderStyle}>
                <h2 style={modalTitleStyle}>Log Details</h2>
                <button style={closeBtnStyle} onClick={() => setSelectedLog(null)}>×</button>
              </div>

              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>ID</span>
                <span style={{ ...detailValueStyle, fontFamily: 'monospace' }}>{selectedLog.id}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>Timestamp</span>
                <span style={detailValueStyle}>{new Date(selectedLog.timestamp).toLocaleString()}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>Action</span>
                <span style={{ ...detailValueStyle, fontFamily: 'monospace' }}>{selectedLog.action}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>Category</span>
                <span style={badgeStyle(selectedLog.category)}>{selectedLog.category}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>Status</span>
                <span style={badgeStyle(selectedLog.status)}>{selectedLog.status}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>Actor</span>
                <div>
                  <div style={detailValueStyle}>{selectedLog.actor.email}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                    {selectedLog.actor.role} • {selectedLog.actor.id}
                  </div>
                </div>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>Resource</span>
                <div>
                  <div style={detailValueStyle}>{selectedLog.resource.type}</div>
                  <div style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>
                    {selectedLog.resource.id}
                  </div>
                </div>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>IP Address</span>
                <span style={{ ...detailValueStyle, fontFamily: 'monospace' }}>{selectedLog.ip_address}</span>
              </div>
              <div style={detailRowStyle}>
                <span style={detailLabelStyle}>User Agent</span>
                <span style={{ ...detailValueStyle, fontSize: '13px' }}>{selectedLog.user_agent}</span>
              </div>

              <div style={{ marginTop: '16px' }}>
                <span style={detailLabelStyle}>Details</span>
                <div style={jsonBoxStyle}>
                  {JSON.stringify(selectedLog.details, null, 2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;
