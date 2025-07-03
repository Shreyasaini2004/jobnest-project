import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Mail, User, Briefcase, Save, XCircle, Phone, MapPin, GraduationCap, Camera } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axiosInstance from '@/lib/axios';

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    experience: user?.experience || '',
    education: user?.education || '',
    skills: user?.skills || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });
  const [avatarHover, setAvatarHover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const initials = (form.firstName || user?.firstName || 'U')[0]?.toUpperCase() + (form.lastName || user?.lastName || '')[0]?.toUpperCase();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = () => {
    setUser({ ...user, ...form });
    setEditMode(false);
  };

  // Handle avatar upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File selected", e.target.files);
    const file = e.target.files?.[0];
    if (!file) {
      console.error('No file selected');
      return;
    }
    
    // Check if user exists and has an ID
    if (!user) {
      console.error('No user available');
      return;
    }
    
    if (!user._id) {
      console.error('No user ID available');
      return;
    }
    
    console.log('User object:', user);
    console.log('User ID:', user._id);
    console.log('File name:', file.name);
    console.log('File size:', file.size);
    console.log('File type:', file.type);
    
    setUploading(true);
    setUploadError('');
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', user._id);
      
      // Log form data contents
      console.log('Form data entries:');
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      // Direct fetch approach as a fallback
      console.log('Using direct fetch with URL:', `${backendUrl}/api/auth/users/upload-avatar`);
      
      // Make the request using fetch instead of axios
      const response = await fetch(`${backendUrl}/api/auth/users/upload-avatar`, {
        method: 'POST',
        body: formData,
        // No need to set Content-Type header with fetch API for FormData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const data = await response.json();
      console.log('Response received:', data);
      const avatarUrl = data.avatar;
      console.log('Avatar URL from response:', avatarUrl);
      
      // Update local state and user context
      setForm(f => ({ ...f, avatar: avatarUrl }));
      setUser({ ...user, avatar: avatarUrl });
      console.log('Avatar uploaded successfully:', avatarUrl);
      console.log('Updated user object:', { ...user, avatar: avatarUrl });
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      setUploadError(`Failed to upload image: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      {/* Gradient Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl mb-8 relative">
        {/* Custom Avatar */}
        <div
          className={`relative group h-28 w-28 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-400 shadow-lg border-4 border-white transition-all duration-300 cursor-pointer overflow-hidden`}
          onMouseEnter={() => setAvatarHover(true)}
          onMouseLeave={() => setAvatarHover(false)}
          tabIndex={0}
          aria-label="Profile Picture"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          {form.avatar ? (
            <>
              <img
                src={form.avatar.startsWith('http') ? form.avatar : `${backendUrl}${form.avatar}`}
                alt="Profile"
                className="object-cover w-full h-full rounded-full"
                onLoad={() => console.log('Image loaded successfully:', form.avatar.startsWith('http') ? form.avatar : `${backendUrl}${form.avatar}`)}
                onError={(e) => {
                  console.error('Image failed to load:', form.avatar);
                  console.error('Full image URL:', form.avatar.startsWith('http') ? form.avatar : `${backendUrl}${form.avatar}`);
                  e.currentTarget.onerror = null; // Prevent infinite loop
                  e.currentTarget.src = ''; // Clear the src
                  // Fall back to initials
                  e.currentTarget.style.display = 'none';
                  // Show the initials as fallback
                  setForm(prev => ({ ...prev, avatar: '' }));
                }}
              />
              {/* Debug info */}
              <div className="hidden">
                Avatar path: {form.avatar}<br/>
                Full URL: {form.avatar.startsWith('http') ? form.avatar : `${backendUrl}${form.avatar}`}
              </div>
            </>
          ) : (
            <span className="text-5xl font-bold text-white select-none">{initials}</span>
          )}
          {/* Upload button on hover */}
          <button
            type="button"
            onClick={e => { e.stopPropagation(); fileInputRef.current && fileInputRef.current.click(); }}
            className={`absolute inset-0 flex items-center justify-center bg-black/60 rounded-full transition-opacity duration-200 ${avatarHover ? 'opacity-100' : 'opacity-0'} focus-visible:opacity-100`}
            aria-label="Upload Photo"
          >
            {uploading ? (
              <span className="text-white text-sm">Uploading...</span>
            ) : (
              <Camera className="h-8 w-8 text-white" />
            )}
          </button>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            aria-label="Choose profile photo"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-2 flex-wrap">
            {form.firstName || user?.firstName || 'Your Name'} {form.lastName || user?.lastName || ''}
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold ml-2">
              {user?.userType === 'employer' ? 'Employer' : 'Job Seeker'}
            </span>
          </h2>
          <div className="flex items-center gap-2 text-white/90 flex-wrap">
            <Mail className="h-5 w-5" />
            <span className="truncate">{form.email || user?.email || 'your@email.com'}</span>
          </div>
        </div>
        <div className="mt-4 sm:mt-0">
          {!editMode && (
            <Button variant="outline" className="bg-white/90 text-blue-600 border-blue-200 hover:bg-white shadow font-semibold focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2" onClick={() => setEditMode(true)}>
              <Edit className="h-4 w-4 mr-1" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Editable Card */}
      <Card className="rounded-2xl shadow-lg border-0">
        <CardHeader>
          <CardTitle>Personal & Professional Information</CardTitle>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <form className="space-y-8 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="City, State, Country"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Select value={form.experience} onValueChange={value => handleSelectChange('experience', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="2-3">2-3 years</SelectItem>
                      <SelectItem value="4-5">4-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Select value={form.education} onValueChange={value => handleSelectChange('education', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="associate">Associate Degree</SelectItem>
                      <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                      <SelectItem value="master">Master's Degree</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="e.g., React, Node.js, Python, Project Management"
                />
                <p className="text-xs text-muted-foreground">Separate skills with commas</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself, your experience, and what you're looking for..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">This will be visible to potential employers</p>
              </div>
              <div className="flex gap-4 justify-end mt-6">
                <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                  <XCircle className="h-4 w-4 mr-1" /> Cancel
                </Button>
                <Button type="button" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" /> Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><User className="h-4 w-4" /> First Name</div>
                    <div className="font-semibold text-blue-900 text-base">{form.firstName || <span className="text-gray-400">-</span>}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Mail className="h-4 w-4" /> Email Address</div>
                    <div className="font-semibold text-blue-900 text-base">{form.email || <span className="text-gray-400">-</span>}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><MapPin className="h-4 w-4" /> Location</div>
                    <div className="text-base">{form.location || <span className="text-gray-400">-</span>}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><GraduationCap className="h-4 w-4" /> Education</div>
                    <div className="text-base">{form.education || <span className="text-gray-400">-</span>}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Briefcase className="h-4 w-4" /> Experience</div>
                    <div className="text-base">{form.experience || <span className="text-gray-400">-</span>}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><User className="h-4 w-4" /> Last Name</div>
                    <div className="font-semibold text-blue-900 text-base">{form.lastName || <span className="text-gray-400">-</span>}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Phone className="h-4 w-4" /> Phone Number</div>
                    <div className="text-base">{form.phone || <span className="text-gray-400">-</span>}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><User className="h-4 w-4" /> Skills</div>
                    <div className="text-base">{form.skills ? form.skills.split(',').map(skill => <span key={skill} className="inline-block bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs mr-1 mb-1">{skill.trim()}</span>) : <span className="text-gray-400">-</span>}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><User className="h-4 w-4" /> Professional Bio</div>
                    <div className="text-base">{form.bio || <span className="text-gray-400">-</span>}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Card */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li>Jobs applied: <span className="font-semibold">5</span></li>
            <li>Resumes uploaded: <span className="font-semibold">2</span></li>
            <li>Saved jobs: <span className="font-semibold">8</span></li>
            <li>Last login: <span className="font-semibold">2 days ago</span></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}