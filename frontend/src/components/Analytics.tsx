import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// If you have a chart library like recharts or chart.js, import it here. Otherwise, use placeholder SVGs.

const mockViewsData = [
  { date: 'Jul 1', views: 40 },
  { date: 'Jul 2', views: 55 },
  { date: 'Jul 3', views: 60 },
  { date: 'Jul 4', views: 80 },
  { date: 'Jul 5', views: 90 },
  { date: 'Jul 6', views: 70 },
  { date: 'Jul 7', views: 100 },
];

const mockApplicationsData = [
  { role: 'Frontend Dev', applications: 12 },
  { role: 'Backend Eng', applications: 8 },
  { role: 'UI/UX Designer', applications: 5 },
  { role: 'DevOps', applications: 7 },
  { role: 'Product Mgr', applications: 4 },
];

const Analytics = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-indigo-700 mb-4">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Views Over Time */}
        <Card className="rounded-2xl shadow-xl border-0 bg-white/90">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-indigo-700">Job Views Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Simple SVG line chart as placeholder */}
            <svg width="100%" height="120" viewBox="0 0 320 120">
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                points="0,100 53,80 106,70 159,40 212,30 265,50 318,20"
              />
              {/* X-axis labels */}
              {mockViewsData.map((d, i) => (
                <text key={d.date} x={i * 53} y={115} fontSize="10" textAnchor="middle" fill="#64748b">{d.date}</text>
              ))}
            </svg>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              {mockViewsData.map((d) => <span key={d.date}>{d.views} views</span>)}
            </div>
          </CardContent>
        </Card>
        {/* Applications Per Role */}
        <Card className="rounded-2xl shadow-xl border-0 bg-white/90">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-indigo-700">Applications Per Role</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Simple SVG bar chart as placeholder */}
            <svg width="100%" height="120" viewBox="0 0 320 120">
              {mockApplicationsData.map((d, i) => (
                <rect
                  key={d.role}
                  x={i * 60 + 20}
                  y={120 - d.applications * 8}
                  width="40"
                  height={d.applications * 8}
                  fill="#a78bfa"
                  rx="6"
                />
              ))}
              {/* X-axis labels */}
              {mockApplicationsData.map((d, i) => (
                <text key={d.role} x={i * 60 + 40} y={115} fontSize="10" textAnchor="middle" fill="#64748b">{d.role}</text>
              ))}
            </svg>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              {mockApplicationsData.map((d) => <span key={d.role}>{d.applications} apps</span>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics; 