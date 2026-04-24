import { useQuery } from '@tanstack/react-query';
import { getMyReports } from '../../api/reports';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils/formatDate';

const statusColors = {
  pending:      'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  reviewed:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  action_taken: 'bg-green-500/10 text-green-400 border-green-500/20',
  dismissed:    'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function ReportsSettingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['myReports'],
    queryFn: () => getMyReports().then((r) => r.data.data),
  });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-100">My Reports</h2>
        <p className="text-sm text-gray-500 mt-1">Track reports you've submitted</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && data?.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500 text-sm">You haven't submitted any reports yet.</p>
        </div>
      )}

      {!isLoading && data?.length > 0 && (
        <div className="space-y-3">
          {data.map((report) => (
            <div
              key={report.id}
              className="border border-gray-800 rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded capitalize">
                    {report.target_type}
                  </span>
                  <span className="text-sm font-medium text-gray-200">{report.reason}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded border capitalize ${statusColors[report.status] || statusColors.dismissed}`}>
                  {report.status.replace('_', ' ')}
                </span>
              </div>
              {report.description && (
                <p className="text-xs text-gray-500">{report.description}</p>
              )}
              <p className="text-xs text-gray-600">{formatDate(report.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}