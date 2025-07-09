import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Bell, Loader2, AlertTriangle } from "lucide-react";

// Mock API for employer notifications
const fetchEmployerNotifications = async () => {
  return new Promise<any[]>((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, message: "New application received for Frontend Developer.", date: "2024-07-10" },
        { id: 2, message: "Interview scheduled with Alice Smith on 2024-07-15.", date: "2024-07-11" },
        { id: 3, message: "Message from John Doe: 'Looking forward to the interview.'", date: "2024-07-12" },
      ]);
    }, 1000);
  });
};

function NotificationsList({ notifications }: { notifications: any[] }) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-200">
          <Bell className="h-5 w-5 text-indigo-400" /> Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-muted-foreground text-sm">No notifications.</div>
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-start gap-3 p-3 bg-indigo-50/60 dark:bg-indigo-900/30 rounded-xl">
                <div className="h-2 w-2 rounded-full bg-green-400 dark:bg-green-300 mt-2" aria-hidden="true"></div>
                <div>
                  <p className="text-xs sm:text-sm text-indigo-900 dark:text-indigo-100">{n.message}</p>
                  <div className="text-xs text-indigo-400 dark:text-indigo-300">{new Date(n.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default function EmployerNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchEmployerNotifications()
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load notifications. Please try again later.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <section className="p-2 sm:p-4 md:p-6">
      <NotificationsList notifications={notifications} />
    </section>
  );
} 