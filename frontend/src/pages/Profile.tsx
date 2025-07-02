import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Edit, Mail, User, Briefcase, Save, XCircle, Phone, MapPin, GraduationCap } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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
  });

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

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      {/* Gradient Header */}
      <div className="rounded-2xl bg-gradient-to-r from-job-primary/80 to-job-accent/80 p-8 flex items-center gap-6 shadow-lg mb-8">
        <Avatar className="h-28 w-28 text-5xl ring-4 ring-white ring-offset-2">
          {form.firstName?.[0]?.toUpperCase() || <User className="h-14 w-14" />}
        </Avatar>
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
            {form.firstName || user?.firstName || 'Your Name'} {form.lastName || user?.lastName || ''}
            <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold ml-2">
              {user?.userType === 'employer' ? 'Employer' : 'Job Seeker'}
            </span>
          </h2>
          <div className="flex items-center gap-2 text-white/90">
            <Mail className="h-5 w-5" />
            <span>{form.email || user?.email || 'your@email.com'}</span>
          </div>
        </div>
        <div>
          {!editMode && (
            <Button variant="secondary" className="bg-white/90 text-job-primary hover:bg-white" onClick={() => setEditMode(true)}>
              <Edit className="h-4 w-4 mr-1" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Editable Card */}
      <Card>
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
                <div>
                  <div className="text-muted-foreground text-xs mb-1">First Name</div>
                  <div className="font-medium text-lg flex items-center gap-2">
                    <User className="h-4 w-4 text-job-primary" /> {user?.firstName || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Last Name</div>
                  <div className="font-medium text-lg flex items-center gap-2">
                    <User className="h-4 w-4 text-job-primary" /> {user?.lastName || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Email Address</div>
                  <div className="font-medium text-lg flex items-center gap-2">
                    <Mail className="h-4 w-4 text-job-primary" /> {user?.email || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Phone Number</div>
                  <div className="font-medium text-lg flex items-center gap-2">
                    <Phone className="h-4 w-4 text-job-primary" /> {user?.phone || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Location</div>
                  <div className="font-medium text-lg flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-job-primary" /> {user?.location || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Experience</div>
                  <div className="font-medium text-lg flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-job-primary" /> {user?.experience || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">Education</div>
                  <div className="font-medium text-lg flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-job-primary" /> {user?.education || '-'}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-muted-foreground text-xs mb-1">Skills</div>
                  <div className="font-medium text-lg flex items-center gap-2">
                    <span className="inline-block px-2 py-1 rounded bg-job-primary/10 text-job-primary text-xs font-semibold">
                      {user?.skills || '-'}
                    </span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-muted-foreground text-xs mb-1">Professional Bio</div>
                  <div className="font-medium text-base text-muted-foreground">
                    {user?.bio || '-'}
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