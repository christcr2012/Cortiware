import { useState } from 'react';

interface Client {
  id: string;
  name: string;
  userCount: number;
  subscription: {
    plan: string;
    status: string;
    price: string;
  } | null;
  createdAt: string;
  status: string;
}

interface ClientListTableProps {
  clients: Client[];
  loading: boolean;
  page: number;
  limit: number;
  total: number;
  sortBy: string;
  sortOrder: string;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSortChange: (field: string, order: string) => void;
  onViewDetails: (clientId: string) => void;
  onRefresh: () => void;
}

export default function ClientListTable({
  clients,
  loading,
  page,
  limit,
  total,
  sortBy,
  sortOrder,
  onPageChange,
  onLimitChange,
  onSortChange,
  onViewDetails,
  onRefresh
}: ClientListTableProps) {
  const [actionClientId, setActionClientId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'suspend' | 'delete' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const totalPages = Math.ceil(total / limit);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'asc');
    }
  };

  const handleAction = async (clientId: string, action: 'suspend' | 'delete') => {
    setActionClientId(clientId);
    setActionType(action);
  };

  const confirmAction = async () => {
    if (!actionClientId || !actionType) return;

    setActionLoading(true);
    try {
      if (actionType === 'suspend') {
        const res = await fetch(`/api/provider/clients/${actionClientId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'suspended' })
        });
        if (res.ok) {
          onRefresh();
        }
      } else if (actionType === 'delete') {
        const res = await fetch(`/api/provider/clients/${actionClientId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setActionLoading(false);
      setActionClientId(null);
      setActionType(null);
    }
  };

  const cancelAction = () => {
    setActionClientId(null);
    setActionType(null);
  };

  if (loading) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <th className="px-4 py-3 text-left cursor-pointer hover:opacity-80" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--text-primary)' }}>Name</span>
                  {sortBy === 'name' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th className="px-4 py-3 text-left" style={{ color: 'var(--text-primary)' }}>Users</th>
              <th className="px-4 py-3 text-left" style={{ color: 'var(--text-primary)' }}>Subscription</th>
              <th className="px-4 py-3 text-left" style={{ color: 'var(--text-primary)' }}>Status</th>
              <th className="px-4 py-3 text-left cursor-pointer hover:opacity-80" onClick={() => handleSort('createdAt')}>
                <div className="flex items-center gap-2">
                  <span style={{ color: 'var(--text-primary)' }}>Created</span>
                  {sortBy === 'createdAt' && <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                </div>
              </th>
              <th className="px-4 py-3 text-right" style={{ color: 'var(--text-primary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                  No clients found
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{client.name}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{client.userCount}</td>
                  <td className="px-4 py-3">
                    {client.subscription ? (
                      <div>
                        <div style={{ color: 'var(--text-primary)' }}>{client.subscription.plan}</div>
                        <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{client.subscription.price}</div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)' }}>No subscription</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        background: client.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: client.status === 'active' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                      }}
                    >
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onViewDetails(client.id)}
                        className="px-3 py-1 rounded text-sm font-medium transition-colors"
                        style={{
                          background: 'var(--brand-primary)',
                          color: 'var(--text-on-brand)'
                        }}
                      >
                        View
                      </button>
                      {client.status !== 'suspended' && (
                        <button
                          onClick={() => handleAction(client.id, 'suspend')}
                          className="px-3 py-1 rounded text-sm font-medium transition-colors"
                          style={{
                            background: 'rgba(251, 191, 36, 0.1)',
                            color: 'rgb(251, 191, 36)'
                          }}
                        >
                          Suspend
                        </button>
                      )}
                      <button
                        onClick={() => handleAction(client.id, 'delete')}
                        className="px-3 py-1 rounded text-sm font-medium transition-colors"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: 'rgb(239, 68, 68)'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span style={{ color: 'var(--text-secondary)' }}>
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} clients
          </span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            className="px-3 py-1 rounded"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
            style={{
              background: 'var(--brand-primary)',
              color: 'var(--text-on-brand)'
            }}
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
            style={{
              background: 'var(--brand-primary)',
              color: 'var(--text-on-brand)'
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {actionClientId && actionType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 max-w-md w-full mx-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Confirm {actionType === 'suspend' ? 'Suspend' : 'Delete'}
            </h3>
            <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to {actionType} this client? This action {actionType === 'delete' ? 'cannot be undone' : 'can be reversed later'}.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelAction}
                disabled={actionLoading}
                className="px-4 py-2 rounded font-medium transition-colors"
                style={{
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={actionLoading}
                className="px-4 py-2 rounded font-medium transition-colors"
                style={{
                  background: actionType === 'delete' ? 'rgb(239, 68, 68)' : 'rgb(251, 191, 36)',
                  color: 'white'
                }}
              >
                {actionLoading ? 'Processing...' : `Confirm ${actionType === 'suspend' ? 'Suspend' : 'Delete'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

