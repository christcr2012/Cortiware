interface ClientFiltersProps {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onRefresh: () => void;
}

export default function ClientFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onRefresh
}: ClientFiltersProps) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-accent)' }}>
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full px-3 py-2 rounded-lg"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        <div className="min-w-[150px]">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg"
            style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--border-primary)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <button
          onClick={onRefresh}
          className="px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            background: 'var(--brand-primary)',
            color: 'var(--text-on-brand)'
          }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

