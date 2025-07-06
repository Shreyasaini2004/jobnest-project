import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Save, Mail, Phone, MapPin, Globe, Palette, Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmployerSettings() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    companyName: user?.companyName || '',
    website: user?.website || '',
    bio: user?.bio || '',
  });
  const [saving, setSaving] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setUser({ ...user, ...formData });
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 fade-in">
      <div className="max-w-3xl mx-auto py-10 px-4">
        {/* Back to dashboard button */}
        <div className="flex justify-start mb-6">
          <button
            onClick={() => navigate('/employer-dashboard')}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium shadow hover:bg-indigo-200 hover:text-indigo-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-base"
            aria-label="Dashboard"
            tabIndex={0}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex gap-2 bg-white rounded-xl shadow p-2">
            <TabsTrigger value="profile" className="flex items-center gap-2"><Edit className="h-4 w-4" /> Profile</TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2"><Palette className="h-4 w-4" /> Appearance</TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          </TabsList>
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="rounded-2xl shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Contact Name</Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" value={formData.email} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="website">Company Website</Label>
                      <Input id="website" name="website" value={formData.website} onChange={handleInputChange} />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" name="location" value={formData.location} onChange={handleInputChange} />
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Label htmlFor="bio">About Company</Label>
                  <textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} className="w-full rounded-lg border p-2 min-h-[80px]" />
                </div>
                <div className="flex justify-end mt-6">
                  <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card className="rounded-2xl shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle>Appearance Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Theme</Label>
                    <div className="flex gap-4 mt-2">
                      <Button variant="outline">Light</Button>
                      <Button variant="outline">Dark</Button>
                      <Button variant="outline">System</Button>
                    </div>
                  </div>
                  <div>
                    <Label>Accent Color</Label>
                    <input type="color" className="ml-2 w-8 h-8 border rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="rounded-2xl shadow-lg border-0 mb-8">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Label>Email Notifications</Label>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Label>Job Alerts</Label>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Label>Newsletter</Label>
                    <input type="checkbox" className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 