import { useState, useEffect } from 'react';
import { FileText, Shield, User, Clock, RefreshCw } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  user: string;
  details?: string;
  created_at: string;
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">System Audit Logs</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time administrative tracking of catalog mutations, discounts, and inventory events.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
        {loading ? (
          <p className="text-center py-8 text-xs text-gray-400">Loading audit history...</p>
        ) : logs.length === 0 ? (
          <p className="text-center py-8 text-xs text-gray-400">No audit activity logged yet.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-4 p-3.5 border rounded-xl hover:bg-gray-50/80 transition-colors text-xs"
              >
                <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-700 shrink-0">
                  <FileText size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-900">{log.action}</p>
                    <span className="px-2 py-0.5 rounded-md bg-zinc-100 text-[10px] font-mono text-zinc-600 font-semibold">
                      {log.entity}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-gray-500 truncate text-[11px] mt-0.5">{log.details}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-gray-700 flex items-center gap-1 justify-end">
                    <User size={12} className="text-gray-400" /> {log.user}
                  </p>
                  <p className="text-gray-400 font-mono text-[10px] flex items-center gap-1 justify-end mt-0.5">
                    <Clock size={11} /> {new Date(log.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
