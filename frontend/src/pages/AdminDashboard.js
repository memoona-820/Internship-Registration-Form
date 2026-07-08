import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import EditModal from '../components/EditModal';
import ConfirmModal from '../components/ConfirmModal';
import DashboardCharts from '../components/DashboardCharts';

const STATUS_COLORS = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };

function downloadCSV(rows, filename) {
  const headers = ['Name', 'Father Name', 'Email', 'Phone', 'CNIC', 'Program', 'Qualification', 'Institution', 'Status', 'Applied On'];
  const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const lines = [
    headers.join(','),
    ...rows.map(r => [
      r.name, r.fatherName, r.email, r.phone, r.cnic, r.program,
      r.qualification, r.institution, r.status, new Date(r.createdAt).toLocaleDateString()
    ].map(escape).join(','))
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');
  const [programs, setPrograms] = useState([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchApplicants = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: pageSize };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (programFilter !== 'all') params.program = programFilter;
      const res = await api.get('/internships', { params });
      setApplicants(res.data.data);
      setTotalPages(res.data.pages);
      setTotalCount(res.data.total);
      if (res.data.page !== page) setPage(res.data.page);
    } catch {
      toast.error('Failed to load applicants');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, programFilter, page, pageSize]);

  useEffect(() => { fetchApplicants(); }, [fetchApplicants]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [search, statusFilter, programFilter]);

  // Clear selection whenever the visible list changes (new page, filter, or refresh)
  useEffect(() => { setSelectedIds([]); }, [applicants]);

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev => prev.length === applicants.length ? [] : applicants.map(a => a._id));
  };

  const handleBulkStatus = async (status) => {
    if (selectedIds.length === 0) return;
    setBulkActing(true);
    try {
      const res = await api.patch('/internships/bulk/status', { ids: selectedIds, status });
      toast.success(res.data.message || 'Updated');
      setSelectedIds([]);
      fetchApplicants();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk update failed');
    } finally {
      setBulkActing(false);
    }
  };

  const handleBulkDelete = async () => {
    setBulkActing(true);
    try {
      const res = await api.post('/internships/bulk/delete', { ids: selectedIds });
      toast.success(res.data.message || 'Deleted');
      setSelectedIds([]);
      setBulkDeleteConfirm(false);
      fetchApplicants();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk delete failed');
    } finally {
      setBulkActing(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = { exportAll: 'true' };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (programFilter !== 'all') params.program = programFilter;
      const res = await api.get('/internships', { params });
      if (!res.data.data.length) {
        toast.error('No records to export');
        return;
      }
      downloadCSV(res.data.data, `applicants-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success(`Exported ${res.data.data.length} record(s)`);
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0, byProgram: [], trend: [] });
  const [selectedIds, setSelectedIds] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [bulkActing, setBulkActing] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/internships/stats/summary');
      setStats(res.data);
    } catch {
      // Non-critical, silently ignore
    }
  }, []);

  useEffect(() => {
    api.get('/programs').then(res => setPrograms(res.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/internships/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchApplicants();
      fetchStats();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/internships/${deleteId}`);
      toast.success('Record deleted');
      setDeleteId(null);
      fetchApplicants();
      fetchStats();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleEditSave = async (id, data) => {
    try {
      await api.put(`/internships/${id}`, data);
      toast.success('Record updated successfully!');
      setEditItem(null);
      fetchApplicants();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📋 Internship Dashboard</h1>
        <p className="page-subtitle">Manage and review all internship applications</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Applications', value: stats.total, icon: '📄', cls: 'blue' },
          { label: 'Pending Review', value: stats.pending, icon: '⏳', cls: 'yellow' },
          { label: 'Approved', value: stats.approved, icon: '✅', cls: 'green' },
          { label: 'Rejected', value: stats.rejected, icon: '❌', cls: 'red' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <DashboardCharts stats={stats} />

      {/* Table Card */}
      <div className="card">
        <div className="card-header">
          <div className="filter-bar" style={{ flex: 1 }}>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search by name, email, CNIC, institution..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="filter-select" value={programFilter} onChange={e => setProgramFilter(e.target.value)}>
              <option value="all">All Programs</option>
              {programs.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
            </select>
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setStatusFilter('all'); setProgramFilter('all'); }}>
              Reset
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleExport} disabled={exporting}>
              {exporting ? '⏳ Exporting...' : '⬇️ Export CSV'}
            </button>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="bulk-toolbar">
            <span>{selectedIds.length} selected</span>
            <div className="bulk-toolbar-actions">
              <button className="btn btn-sm bulk-btn approve" disabled={bulkActing} onClick={() => handleBulkStatus('approved')}>✅ Approve</button>
              <button className="btn btn-sm bulk-btn reject" disabled={bulkActing} onClick={() => handleBulkStatus('rejected')}>❌ Reject</button>
              <button className="btn btn-sm bulk-btn pending" disabled={bulkActing} onClick={() => handleBulkStatus('pending')}>⏳ Mark Pending</button>
              <button className="btn btn-sm bulk-btn delete" disabled={bulkActing} onClick={() => setBulkDeleteConfirm(true)}>🗑️ Delete</button>
              <button className="btn btn-sm btn-secondary" onClick={() => setSelectedIds([])}>Clear</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <p>Loading applicants...</p>
          </div>
        ) : applicants.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No records found</div>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>
                      <input
                        type="checkbox"
                        checked={applicants.length > 0 && selectedIds.length === applicants.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Program</th>
                    <th>Institution</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((a, i) => (
                    <tr key={a._id} className={selectedIds.includes(a._id) ? 'row-selected' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(a._id)}
                          onChange={() => toggleSelectOne(a._id)}
                        />
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{i + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{a.qualification}</div>
                      </td>
                      <td>{a.email}</td>
                      <td>{a.phone}</td>
                      <td>
                        <span style={{
                          background: 'var(--primary-light)', color: 'var(--primary)',
                          padding: '3px 9px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600
                        }}>{a.program}</span>
                      </td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.institution}
                      </td>
                      <td>
                        <select
                          className={`badge ${STATUS_COLORS[a.status]}`}
                          value={a.status}
                          onChange={e => handleStatusChange(a._id, e.target.value)}
                          style={{ border: 'none', cursor: 'pointer', background: 'transparent' }}
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="approved">✅ Approved</option>
                          <option value="rejected">❌ Rejected</option>
                        </select>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn-icon btn-icon-edit"
                            title="Edit Record"
                            onClick={() => setEditItem(a)}
                          >✏️</button>
                          <button
                            className="btn-icon btn-icon-delete"
                            title="Delete Record"
                            onClick={() => setDeleteId(a._id)}
                          >🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <span>
                Showing {applicants.length === 0 ? 0 : (page - 1) * pageSize + 1}
                –{Math.min(page * pageSize, totalCount)} of {totalCount} result{totalCount !== 1 ? 's' : ''}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <select
                  className="page-size-select"
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                >
                  {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
                </select>
                <div className="pagination-controls">
                  <button className="page-btn" disabled={page <= 1} onClick={() => setPage(1)}>«</button>
                  <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, idx) =>
                      p === '...' ? (
                        <span key={`ellipsis-${idx}`} className="page-ellipsis">…</span>
                      ) : (
                        <button
                          key={p}
                          className={`page-btn ${p === page ? 'active' : ''}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      )
                    )}
                  <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
                  <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <EditModal
          item={editItem}
          programs={programs}
          onClose={() => setEditItem(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <ConfirmModal
          title="Delete Record?"
          message="This action cannot be undone. The applicant's record will be permanently removed."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Bulk Delete Confirm */}
      {bulkDeleteConfirm && (
        <ConfirmModal
          title={`Delete ${selectedIds.length} Record(s)?`}
          message="This action cannot be undone. All selected applicant records will be permanently removed."
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
