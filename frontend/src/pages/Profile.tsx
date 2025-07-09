import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Mail, User, Briefcase, Save, XCircle, Phone, MapPin, GraduationCap, Camera, ArrowLeft, Share2, Download, Upload, Copy, Check } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axiosInstance from '@/lib/axios';
import { toast as sonnerToast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const initials = (user?.firstName || 'U')[0]?.toUpperCase() + (user?.lastName || '')[0]?.toUpperCase();

  // Profile completion calculation (simple example: count filled fields)
  const profileFields = ['firstName', 'lastName', 'email', 'phone', 'location', 'experience', 'education', 'skills', 'bio'];
  const completedFields = profileFields.filter(f => user?.[f]);
  const profileCompletion = Math.round((completedFields.length / profileFields.length) * 100);

  // Share profile handler
  const handleShare = () => {
    const url = window.location.origin + '/profile/' + (user?._id || '');
    navigator.clipboard.writeText(url);
    toast({ title: 'Profile link copied!', description: 'You can now share your profile.' });
  };

  // Download resume handler (placeholder)
  const handleDownloadResume = () => {
    toast({ title: 'Resume downloaded', description: 'Your resume has been downloaded.' });
  };

  const handleSave = async () => {
    if (!user || !user._id) {
      sonnerToast.error("User ID not available. Please log in again.");
      return;
    }
  
    // Optional: Validate required fields
    if (!form.firstName || !form.lastName || !form.email) {
      sonnerToast.error("Please fill in all required fields.");
      return;
    }
  
    try {
      const response = await axiosInstance.post("/api/auth/users/update-profile", {
        userId: user._id,
        ...form,
      });
  
      if (response.status === 200) {
        const updatedUser = response.data;
  
        setUser(updatedUser); // Update context
        setForm((prevForm) => ({ ...prevForm, ...updatedUser }));
        setEditMode(false);
  
        sonnerToast.success("Profile updated successfully!");
        console.log("✅ Profile updated:", updatedUser);
      } else {
        sonnerToast.error("Failed to update profile.");
        console.error("❌ Server responded with non-200:", response.status);
      }
    } catch (error: any) {
      console.error("❌ Error saving profile:", error?.response?.data || error.message);
      sonnerToast.error("Something went wrong. Please try again.");
    }
  };
  
  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!user) return 0;
    const fields = ['firstName', 'lastName', 'phone', 'location', 'experience', 'education', 'skills', 'bio'];
    const completedFields = fields.filter(field => user[field as keyof typeof user] && user[field as keyof typeof user] !== '');
    return Math.round((completedFields.length / fields.length) * 100);
  };
  

  const completionPercentage = calculateProfileCompletion();
  const missingFields = ['skills', 'location', 'education'].filter(field => !user?.[field as keyof typeof user]);

  // Mock skills data
  const skills = user?.skills ? user.skills.split(',').map(skill => skill.trim()) : ['React', 'Node.js', 'MongoDB', 'UI/UX Design'];

  // Mock achievements
  const achievements = [
    { id: 1, title: 'Uploaded First Resume', icon: '📄', earned: true },
    { id: 2, title: 'Applied to 5 Jobs', icon: '📩', earned: true },
    { id: 3, title: 'Profile 100% Complete', icon: '🏆', earned: completionPercentage === 100 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 fade-in">
      <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
        <style>
          {`
            @keyframes fadeSlideInLeft {
              0% { opacity: 0; transform: translateX(-24px); }
              100% { opacity: 1; transform: translateX(0); }
            }
          `}
        </style>
        {/* Left-aligned, soft dashboard button above cover */}
        <div className="flex justify-start mb-6">
          <button
            onClick={() => navigate('/dashboard?section=dashboard-home')}
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
          {/* Cover image without blur effect */}
          <div className="h-40 md:h-56 w-full bg-cover bg-center relative" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80)' }}></div>
          {/* Centered avatar, name, and title */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div>
              <img src={user?.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-white" />
                </div>
            <div className="flex flex-col items-center mt-4">
              <h2 className="text-2xl font-bold text-white drop-shadow mb-1">{user?.firstName} {user?.lastName}</h2>
              <p className="text-white text-sm opacity-90">{user?.userType === 'employer' ? 'Employer' : 'Job Seeker'}</p>
            </div>
          </div>
        </div>
        <div className="h-14 sm:h-16" /> {/* Spacer for avatar overlay, responsive */}
        {/* About Me snippet */}
        <div className="max-w-2xl mx-auto mb-8 px-2 sm:px-0">
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 text-center border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-indigo-700 mb-2">About Me</h3>
            <p className="text-gray-700 text-sm sm:text-base min-h-[2.5rem]">
              {user?.bio ? user.bio : <span className="text-gray-400">No bio provided yet.</span>}
            </p>
          </div>
        </div>
        {/* Pinned Projects / Highlights */}
        <div className="max-w-2xl mx-auto mb-8 px-2 sm:px-0">
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-base sm:text-lg font-semibold text-indigo-700 mb-4 text-center">Pinned Projects</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Example static projects - replace with dynamic content in the future */}
              <div className="bg-indigo-50 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col gap-2 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-800 text-sm sm:text-base">JobNest ATS Analyzer</span>
                  <span className="text-xs text-indigo-600">🚀</span>
                  </div>
                <span className="text-gray-600 text-xs sm:text-sm">A smart resume and job description analyzer for job seekers and employers.</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">#React</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">#AI</span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">#Node.js</span>
                </div>
                <a href="#" className="text-indigo-600 text-xs font-medium hover:underline mt-2">View Project →</a>
                  </div>
              <div className="bg-indigo-50 rounded-lg p-3 sm:p-4 shadow-sm flex flex-col gap-2 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-800 text-sm sm:text-base">Event Bulletin Board</span>
                  <span className="text-xs text-indigo-600">📅</span>
                </div>
                <span className="text-gray-600 text-xs sm:text-sm">A real-time events and deadlines dashboard for job seekers.</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">#Firebase</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">#React</span>
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">#TypeScript</span>
                </div>
                <a href="#" className="text-indigo-600 text-xs font-medium hover:underline mt-2">View Project →</a>
                  </div>
              {/* Placeholder for no projects */}
              {/* <div className="col-span-full text-gray-400 text-center">No pinned projects yet.</div> */}
                  </div>
                </div>
                </div>
        {/* Info Card */}
        <Card className="rounded-2xl shadow-lg border-0 max-w-2xl mx-auto mb-8 px-2 sm:px-0 hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base sm:text-lg">Personal & Professional Information</CardTitle>
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
                      <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><User className="h-4 w-4" /> First Name</div>
                    <div className="font-semibold text-blue-900 text-sm sm:text-base">{user?.firstName || <span className="text-gray-400">-</span>}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Mail className="h-4 w-4" /> Email Address</div>
                    <div className="font-semibold text-blue-900 text-sm sm:text-base">{user?.email || <span className="text-gray-400">-</span>}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><MapPin className="h-4 w-4" /> Location</div>
                    <div className="text-sm sm:text-base flex items-center gap-2">
                      {user?.location || <span className="text-gray-400">-</span>}
                      <Edit className="w-3 h-3 text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors duration-200" />
                    </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><GraduationCap className="h-4 w-4" /> Education</div>
                    <div className="text-sm sm:text-base flex items-center gap-2">
                      {user?.education || <span className="text-gray-400">-</span>}
                      <Edit className="w-3 h-3 text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors duration-200" />
                    </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Briefcase className="h-4 w-4" /> Experience</div>
                    <div className="text-sm sm:text-base flex items-center gap-2">
                      {user?.experience || <span className="text-gray-400">-</span>}
                      <Edit className="w-3 h-3 text-gray-400 hover:text-indigo-600 cursor-pointer transition-colors duration-200" />
                    </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><User className="h-4 w-4" /> Last Name</div>
                    <div className="font-semibold text-blue-900 text-sm sm:text-base">{user?.lastName || <span className="text-gray-400">-</span>}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Phone className="h-4 w-4" /> Phone Number</div>
                    <div className="text-sm sm:text-base">{user?.phone || <span className="text-gray-400">-</span>}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><User className="h-4 w-4" /> Skills</div>
                    <div className="text-sm sm:text-base">{user?.skills ? user.skills.split(',').map(skill => <span key={skill} className="inline-block bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs mr-1 mb-1">{skill.trim()}</span>) : <span className="text-gray-400">-</span>}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><User className="h-4 w-4" /> Professional Bio</div>
                    <div className="text-sm sm:text-base">{user?.bio || <span className="text-gray-400">-</span>}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Stat Widgets */}
        <div className="max-w-2xl mx-auto mb-8 px-2 sm:px-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-200">
              <span className="text-2xl mb-1">👥</span>
              <span className="text-xl font-bold text-indigo-700">120</span>
              <span className="text-xs text-gray-500">Followers</span>
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-200">
              <span className="text-2xl mb-1">📈</span>
              <span className="text-xl font-bold text-indigo-700">75</span>
              <span className="text-xs text-gray-500">Following</span>
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-200">
              <span className="text-2xl mb-1">💼</span>
              <span className="text-xl font-bold text-indigo-700">3</span>
              <span className="text-xs text-gray-500">Projects</span>
            </div>
            <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-200">
              <span className="text-2xl mb-1">👁️</span>
              <span className="text-xl font-bold text-indigo-700">1,024</span>
              <span className="text-xs text-gray-500">Profile Views</span>
            </div>
          </div>
        </div>
        {/* Timeline / Activity Feed */}
        <div className="max-w-2xl mx-auto mb-8 px-2 sm:px-0">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-base sm:text-lg font-semibold text-indigo-700 mb-4">Timeline</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="text-lg">✅</span>
                <span>Joined on <span className="font-semibold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span></span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-lg">🔄</span>
                <span>Updated profile <span className="font-semibold">2 days ago</span></span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-lg">🚀</span>
                <span>Applied to <span className="font-semibold">2 jobs</span> last week</span>
              </li>
            </ul>
          </div>
        </div>
        {/* Custom URL and QR Code */}
        <div className="max-w-2xl mx-auto mb-8 px-2 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Custom URL */}
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
              <h3 className="text-base sm:text-lg font-semibold text-indigo-700 mb-4">Profile URL</h3>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-600 flex-1 truncate">
                {window.location.origin}/profile/{user?._id || 'user'}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/profile/${user?._id || 'user'}`);
                  toast({
                    title: "✅ Copied!",
                    description: "Profile URL has been copied to clipboard.",
                  });
                }}
                className="hover:bg-green-50 hover:text-green-700 transition-colors duration-200"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              </div>
            </div>
            {/* QR Code */}
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-base sm:text-lg font-semibold text-indigo-700 mb-4">QR Code</h3>
              <div className="flex flex-col items-center gap-4">
                <Tooltip>
                  <TooltipTrigger>
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center cursor-help">
                      <span className="text-xs text-gray-500">QR Code</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Scan to view public profile</p>
                  </TooltipContent>
                </Tooltip>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toast({
                      title: "QR Code downloaded!",
                      description: "QR code has been saved to your device.",
                    });
                  }}
                  className="hover:bg-indigo-50 transition-colors duration-200"
                >
                  Download QR
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Resume Section */}
        <Card className="rounded-2xl shadow-lg border-0 max-w-2xl mx-auto mb-8 px-2 sm:px-0 hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Resume.pdf</p>
                  <p className="text-sm text-gray-500">Last updated 2 days ago</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleDownloadResume} variant="outline" size="sm" className="hover:bg-indigo-50 transition-colors duration-200">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download your resume as PDF</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="hover:bg-green-50 transition-colors duration-200">
                      <Upload className="w-4 h-4 mr-1" />
                      Upload
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload a new resume (PDF, DOC, DOCX)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Recent Activity Card */}
        <Card className="rounded-2xl shadow-lg border-0 max-w-2xl mx-auto px-2 sm:px-0 hover:shadow-xl transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground text-xs sm:text-sm">
              <li>Jobs applied: <span className="font-semibold">5</span></li>
              <li>Resumes uploaded: <span className="font-semibold">2</span></li>
              <li>Saved jobs: <span className="font-semibold">8</span></li>
              <li>Last login: <span className="font-semibold">2 days ago</span></li>
            </ul>
          </CardContent>
        </Card>
        {/* Top Skills Section */}
        {skills.length > 0 && (
          <div className="max-w-2xl mx-auto mb-8 px-2 sm:px-0">
            <div className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
              <h3 className="text-base sm:text-lg font-semibold text-indigo-700 mb-4">Top Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 transition-colors duration-200"
                  >
                    🔹 {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Achievements Section */}
        <div className="max-w-2xl mx-auto mb-8 px-2 sm:px-0">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-200">
            <h3 className="text-base sm:text-lg font-semibold text-indigo-700 mb-4">Achievements</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {achievements.map((achievement) => (
                  <Tooltip key={achievement.id}>
                    <TooltipTrigger asChild>
                      <div 
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-help ${
                          achievement.earned 
                            ? 'bg-green-50 border border-green-200 hover:bg-green-100' 
                            : 'bg-gray-50 border border-gray-200 opacity-50'
                        }`}
                      >
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <p className={`text-sm font-medium ${
                            achievement.earned ? 'text-green-800' : 'text-gray-500'
                          }`}>
                            {achievement.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {achievement.earned ? 'Earned' : 'Locked'}
                          </p>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {achievement.id === 1 && 'Upload your first resume to earn this badge'}
                        {achievement.id === 2 && 'Apply to 5 jobs to earn this badge'}
                        {achievement.id === 3 && 'Complete all profile fields to earn this badge'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}