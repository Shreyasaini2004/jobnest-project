import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function SettingsPage() {
  const { user } = useUser();
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
            <Button className="mt-2" size="sm">Update Email</Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Change Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="New password"
            />
            <Button className="mt-2" size="sm">Update Password</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium">Email Notifications</p>
            <p className="text-muted-foreground text-sm">Receive updates about jobs, reminders, and news.</p>
          </div>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </CardContent>
      </Card>
    </div>
  );
} 