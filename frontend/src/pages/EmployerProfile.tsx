import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Mail, Phone, MapPin, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function EmployerProfile() {
  const { user } = useUser();
  const navigate = useNavigate();
  const initials = (user?.companyName || 'C')[0]?.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 fade-in">
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
        {/* Back to dashboard button */}
        <div className="flex justify-start mb-6">
          <button
            onClick={() => navigate(user?.userType === 'employer' ? '/employer-dashboard' : '/dashboard?section=dashboard-home')}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium shadow hover:bg-indigo-200 hover:text-indigo-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-base"
            aria-label="Dashboard"
            tabIndex={0}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
        {/* Hero Section with Cover Image */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl mb-8">
          <div className="h-40 md:h-56 w-full bg-cover bg-center relative" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80)' }}></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div>
              {user?.avatar ? (
                <img src={user.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-white" />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-indigo-200 flex items-center justify-center text-3xl font-bold text-indigo-700">{initials}</div>
              )}
            </div>
            <div className="flex flex-col items-center mt-4">
              <h2 className="text-2xl font-bold text-white drop-shadow mb-1">{user?.name || 'Employer'}</h2>
              <p className="text-white text-sm opacity-90">{user?.companyName || 'Your Company'}</p>
            </div>
          </div>
        </div>
        <div className="h-14 sm:h-16" />
        {/* About Company */}
        <div className="max-w-2xl mx-auto mb-8 px-2 sm:px-0">
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 text-center border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-indigo-700 mb-2">About Company</h3>
            <p className="text-gray-700 text-sm sm:text-base min-h-[2.5rem]">
              {user?.bio ? user.bio : <span className="text-gray-400">No company bio provided yet.</span>}
            </p>
          </div>
        </div>
        {/* Info Card */}
        <Card className="rounded-2xl shadow-lg border-0 max-w-2xl mx-auto mb-8 px-2 sm:px-0 hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Company Information</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/settings?tab=profile')}
              className="hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4">
                  <div>
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Mail className="h-4 w-4" /> Email Address</div>
                    <div className="font-semibold text-blue-900 text-sm sm:text-base">{user?.email || <span className="text-gray-400">-</span>}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Phone className="h-4 w-4" /> Phone Number</div>
                    <div className="font-semibold text-blue-900 text-sm sm:text-base">{user?.phone || <span className="text-gray-400">-</span>}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><MapPin className="h-4 w-4" /> Location</div>
                    <div className="font-semibold text-blue-900 text-sm sm:text-base">{user?.location || <span className="text-gray-400">-</span>}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Globe className="h-4 w-4" /> Company Website</div>
                    <div className="font-semibold text-blue-900 text-sm sm:text-base">{user?.website || <span className="text-gray-400">-</span>}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 