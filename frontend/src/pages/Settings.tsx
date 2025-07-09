import { useState, useEffect, useRef } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, User, Bell, Lock, Mail, Palette, Globe, CreditCard, Save, XCircle, Camera, Sun, Moon, Monitor, Check, ArrowLeft, GripVertical, Info, Phone, Menu, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

// Channel icons for legend and headers (move outside component)
const channelIcons = {
  'Email': { icon: '✉️', label: 'Email' },
  'SMS': { icon: '📱', label: 'SMS' },
  'Web Notifications': { icon: '🔔', label: 'Web Notifications' },
};

export default function SettingsPage() {
  const { user, setUser } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Settings states
  const [settings, setSettings] = useState(() => {
    // Try to load theme from localStorage
    let darkMode: boolean;
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') darkMode = true;
    else if (storedTheme === 'light') darkMode = false;
    else darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return {
      emailNotifications: true,
      jobAlerts: true,
      newsletter: false,
      darkMode,
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      theme: storedTheme || 'system',
      accent: '#6366f1',
      font: 'normal',
      highContrast: false,
      reducedMotion: false,
    };
  });

  // Apply theme on mount and when settings.theme changes
  useEffect(() => {
    if (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Handle theme switching
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    let darkMode: boolean;
    if (theme === 'dark') darkMode = true;
    else if (theme === 'light') darkMode = false;
    else darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setSettings(prev => ({ ...prev, darkMode, theme }));
    if (theme === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', theme);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSettingChange = (name: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [name]: value }));
    
    // Apply theme change immediately
    if (name === 'darkMode') {
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const toastRef = useRef<HTMLDivElement>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (!toastRef.current) return;
    toastRef.current.innerText = message;
    toastRef.current.className = `toast toast-container toast-${type}`;
    toastRef.current.style.opacity = '1';
    toastRef.current.style.pointerEvents = 'auto';
    setTimeout(() => {
      if (toastRef.current) {
        toastRef.current.style.opacity = '0';
        toastRef.current.style.pointerEvents = 'none';
      }
    }, 2500);
  };

  // Confetti logic
  const confettiRef = useRef<HTMLDivElement>(null);
  const showConfetti = () => {
    if (!confettiRef.current) return;
    confettiRef.current.innerHTML = '';
    const colors = ['#6366f1', '#22d3ee', '#f472b6', '#facc15', '#22c55e', '#3b82f6'];
    for (let i = 0; i < 24; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = `${Math.random() * 100}%`;
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDelay = `${Math.random() * 0.5}s`;
      confettiRef.current.appendChild(el);
    }
    setTimeout(() => { if (confettiRef.current) confettiRef.current.innerHTML = ''; }, 2000);
  };

  const handleSaveChanges = (section: string) => {
    // Update user context with new data
    if (section === 'profile') {
      setUser({ ...user, ...formData });
      showToast('Profile settings saved!', 'info');
    } else if (section === 'appearance') {
      showToast('Appearance settings saved!', 'success');
      showConfetti();
    } else {
      showToast('Settings saved!', 'info');
    }
    console.log(`Saved ${section} settings`);
  };

  const initials = (formData.firstName || 'U')[0] + (formData.lastName || '')[0];

  const navigate = useNavigate();
  const { toast } = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [touched, setTouched] = useState<{ [k: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [dirty, setDirty] = useState(false);

  // Validation logic
  useEffect(() => {
    const newErrors: { [k: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (formData.phone && !/^\+?\d[\d\s\-()]{7,}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';
    setErrors(newErrors);
  }, [formData]);

  // Profile completion calculation
  const profileFields = ['firstName', 'lastName', 'email', 'phone', 'location', 'bio'];
  const completedFields = profileFields.filter(f => formData[f as keyof typeof formData] && !errors[f]);
  const profileCompletion = Math.round((completedFields.length / profileFields.length) * 100);

  // Avatar upload logic
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setDirty(true);
    }
  };
  const handleAvatarDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setDirty(true);
    }
  };
  const handleAvatarRemove = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setDirty(true);
  };

  // Track dirty state
  useEffect(() => {
    setDirty(
      avatarFile !== null ||
      Object.keys(formData).some(
        k => formData[k as keyof typeof formData] !== (user?.[k as keyof typeof user] || '')
      )
    );
  }, [formData, avatarFile, user]);

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password strength utility
  function getPasswordStrength(password: string) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 12) score++;
    return score;
  }
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const strengthColors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-green-600'];

  // Notifications tab states
  const [showSnoozeMenu, setShowSnoozeMenu] = useState(false);
  const [customSnooze, setCustomSnooze] = useState('');
  const [dndStart, setDndStart] = useState('');
  const [dndEnd, setDndEnd] = useState('');

  const handleSnooze = (duration: string) => {
    // Implement snooze logic based on the duration
    console.log(`Snoozing notifications for ${duration}`);
    setShowSnoozeMenu(false);
  };

  // Channel priority state
  const [channelPriority, setChannelPriority] = useState(['SMS', 'Email', 'In-App']);
  // Per-category channel control state
  const [categoryChannels, setCategoryChannels] = useState({
    'Job Alerts': ['Email'],
    'Security Alerts': ['SMS', 'Email'],
    'Newsletter': ['In-App'],
    'Product Updates': ['In-App', 'Email'],
  });
  // Saved status indicator
  const [showSaved, setShowSaved] = useState(false);

  // Drag-and-drop reorder handler (mock)
  const handlePriorityDrag = (from: number, to: number) => {
    const updated = [...channelPriority];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setChannelPriority(updated);
  };
  // Per-category channel toggle handler
  const handleCategoryChannelToggle = (cat: string, channel: string) => {
    setCategoryChannels(prev => {
      const current = prev[cat] || [];
      return {
        ...prev,
        [cat]: current.includes(channel)
          ? current.filter(c => c !== channel)
          : [...current, channel],
      };
    });
  };
  // Save handler
  const handleSaveNotifications = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  // For granular matrix
  const notificationCategories = ['Job Alerts', 'Security Alerts', 'Newsletter', 'Product Updates'];
  const notificationChannels = [
    { key: 'Email', icon: <Mail className="w-4 h-4 inline mr-1" />, tooltip: 'Email notifications' },
    { key: 'SMS', icon: <Phone className="w-4 h-4 inline mr-1" />, tooltip: 'Used only for urgent security updates.' },
    { key: 'In-App', icon: <Bell className="w-4 h-4 inline mr-1" />, tooltip: 'In-app and push notifications' },
  ];
  const [matrix, setMatrix] = useState({
    'Job Alerts': { Email: true, SMS: false, 'In-App': true },
    'Security Alerts': { Email: true, SMS: true, 'In-App': false },
    'Newsletter': { Email: false, SMS: false, 'In-App': true },
    'Product Updates': { Email: false, SMS: false, 'In-App': true },
  });
  const [masterToggles, setMasterToggles] = useState({ Email: true, SMS: false, 'In-App': true });
  // DND & Digest
  const [digest, setDigest] = useState(true);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  // Unsaved changes
  const [unsaved, setUnsaved] = useState(false);
  // Activity summary
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Matrix handlers
  const handleMatrixToggle = (cat, channel) => {
    setMatrix(prev => {
      const updated = { ...prev, [cat]: { ...prev[cat], [channel]: !prev[cat][channel] } };
      setUnsaved(true);
      return updated;
    });
  };
  const handleMasterToggle = (channel) => {
    const newVal = !masterToggles[channel];
    setMasterToggles(prev => ({ ...prev, [channel]: newVal }));
    setMatrix(prev => {
      const updated = { ...prev };
      notificationCategories.forEach(cat => { updated[cat][channel] = newVal; });
      setUnsaved(true);
      return updated;
    });
  };

  // For test notification dropdown
  const [showTestDropdown, setShowTestDropdown] = useState(false);
  // For summary preview
  const getSummary = () => {
    return notificationCategories.map(cat => {
      const enabled = Object.entries(matrix[cat]).filter(([ch, v]) => v).map(([ch]) => ch.replace('In-App', 'Web Notifications'));
      return enabled.length ? `${cat} via ${enabled.join(' & ')}` : null;
    }).filter(Boolean).join(', ');
  };

  // For test notification feedback
  const [testSent, setTestSent] = useState('');
  // For audit trail
  const lastChanged = 'July 3, 2025 · by you';

  // --- Advanced Notification Features State (mock for now) ---
  const [quietHours, setQuietHours] = useState({
    Email: { start: '00:00', end: '23:59', enabled: false },
    SMS: { start: '09:00', end: '18:00', enabled: true },
    'Web Notifications': { start: '00:00', end: '23:59', enabled: false },
  });
  const [respectTimezone, setRespectTimezone] = useState(true);
  const [thresholds, setThresholds] = useState({
    'Security Alerts': 'All',
    'Job Alerts': 80,
    'Product Updates': false,
  });
  // Conditional Routing state
  const [routingRules, setRoutingRules] = useState([
    { id: 1, ifType: 'Priority', ifValue: 'High', channel: 'SMS' },
  ]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  // Helper for adding/removing rules
  const addRoutingRule = () => setRoutingRules(rules => [...rules, { id: Date.now(), ifType: 'Type', ifValue: 'Newsletter', channel: 'Email' }]);
  const removeRoutingRule = id => setRoutingRules(rules => rules.filter(r => r.id !== id));
  const updateRoutingRule = (id, key, value) => setRoutingRules(rules => rules.map(r => r.id === id ? { ...r, [key]: value } : r));

  // Custom Labels/Tags state
  const [tags, setTags] = useState([
    { id: 1, emoji: '📢', label: 'Announcements', muted: false, highlighted: false },
    { id: 2, emoji: '🛠', label: 'Maintenance', muted: false, highlighted: true },
    { id: 3, emoji: '💡', label: 'Tips & Tricks', muted: true, highlighted: false },
  ]);
  const [newTagEmoji, setNewTagEmoji] = useState('');
  const [newTagLabel, setNewTagLabel] = useState('');
  const addTag = () => {
    if (newTagEmoji && newTagLabel) {
      setTags(ts => [...ts, { id: Date.now(), emoji: newTagEmoji, label: newTagLabel, muted: false, highlighted: false }]);
      setNewTagEmoji('');
      setNewTagLabel('');
    }
  };
  const removeTag = id => setTags(ts => ts.filter(t => t.id !== id));
  const toggleTag = (id, key) => setTags(ts => ts.map(t => t.id === id ? { ...t, [key]: !t[key] } : t));

  // Notification History / Log state
  const [history, setHistory] = useState([
    { id: 1, date: '2024-07-01 10:15', type: 'Job Alert', channel: 'Email', status: 'Delivered', content: 'New job match: Frontend Developer' },
    { id: 2, date: '2024-07-01 11:00', type: 'Security Alert', channel: 'SMS', status: 'Delivered', content: 'Suspicious login detected' },
    { id: 3, date: '2024-07-02 09:30', type: 'Newsletter', channel: 'Email', status: 'Bounced', content: 'July Newsletter' },
    { id: 4, date: '2024-07-02 14:00', type: 'Product Update', channel: 'Web Notifications', status: 'Delivered', content: 'New feature: Dark mode' },
    { id: 5, date: '2024-07-03 08:45', type: 'Job Alert', channel: 'Web Notifications', status: 'Delivered', content: 'New job match: Backend Engineer' },
  ]);
  const [filterType, setFilterType] = useState('All');
  const [filterChannel, setFilterChannel] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const filteredHistory = history.filter(h =>
    (filterType === 'All' || h.type === filterType) &&
    (filterChannel === 'All' || h.channel === filterChannel) &&
    (!filterDate || h.date.startsWith(filterDate))
  );

  // Multi-user Notification Control (Team Settings) state
  const isAdmin = true; // mock: only show for admins
  const teamRoles = ['Admin', 'Security', 'Marketing', 'All Users'];
  const teamCategories = ['Security Alerts', 'Job Alerts', 'Newsletter', 'Product Updates'];
  const teamChannels = ['Email', 'SMS', 'Web Notifications'];
  const [teamMatrix, setTeamMatrix] = useState(() => {
    // mock: all enabled except SMS for Marketing
    const matrix = {};
    teamRoles.forEach(role => {
      matrix[role] = {};
      teamCategories.forEach(cat => {
        matrix[role][cat] = {};
        teamChannels.forEach(ch => {
          matrix[role][cat][ch] = !(role === 'Marketing' && ch === 'SMS');
        });
      });
    });
    return matrix;
  });
  const toggleTeamMatrix = (role, cat, ch) => setTeamMatrix(m => ({
    ...m,
    [role]: {
      ...m[role],
      [cat]: {
        ...m[role][cat],
        [ch]: !m[role][cat][ch],
      },
    },
  }));

  // Fallback Channel state
  const fallbackCategories = ['Security Alerts', 'Job Alerts', 'Newsletter', 'Product Updates'];
  const fallbackChannels = ['None', 'Email', 'SMS', 'Web Notifications'];
  const [fallback, setFallback] = useState({
    'Security Alerts': 'SMS',
    'Job Alerts': 'Email',
    'Newsletter': 'None',
    'Product Updates': 'Web Notifications',
  });

  // Info/tips banner state
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-10">
      <div className="container mx-auto max-w-3xl">
        {/* Left-aligned, soft dashboard button above tabs */}
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
        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:flex mb-8 bg-muted/50 h-12 rounded-lg overflow-hidden">
            <TabsTrigger value="profile" className="settings-tab flex items-center gap-2">
              <User className="h-4 w-4 settings-icon-animated" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="settings-tab flex items-center gap-2">
              <Lock className="h-4 w-4 settings-icon-animated" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="settings-tab flex items-center gap-2">
              <Bell className="h-4 w-4 settings-icon-animated" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="settings-tab flex items-center gap-2">
              <Palette className="h-4 w-4 settings-icon-animated" />
              Appearance
            </TabsTrigger>
          </TabsList>
          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-0 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-8 flex flex-col items-center">
                <div className="relative group">
                  <Avatar className="w-28 h-28 shadow-xl border-4 border-white">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="Avatar preview" />
                    ) : (
                      <AvatarFallback className="text-4xl font-bold">{initials}</AvatarFallback>
                    )}
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleAvatarChange}
                    aria-label="Upload avatar"
                  />
                  {avatarPreview && (
                    <button
                      type="button"
                      className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow hover:bg-indigo-100 transition"
                      onClick={handleAvatarRemove}
                      aria-label="Remove avatar"
                    >
                      <XCircle className="w-5 h-5 text-red-500" />
                    </button>
                  )}
                </div>
                <div className="mt-4 text-white text-2xl font-semibold">{formData.firstName} {formData.lastName}</div>
                <div className="w-full max-w-xs mt-4">
                  <Progress value={profileCompletion} />
                  <div className="text-xs text-center mt-1 text-indigo-100">Profile completion: {profileCompletion}%</div>
                </div>
              </div>
              {/* Form */}
              <form
                className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white"
                onSubmit={e => {
                  e.preventDefault();
                  if (Object.keys(errors).length === 0 && dirty) {
                    setIsSaving(true);
                    setTimeout(() => {
                      setIsSaving(false);
                      setDirty(false);
                      toast({ title: 'Profile updated!', description: 'Your profile changes have been saved.' });
                    }, 1200);
                  }
                }}
                noValidate
              >
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-base font-medium">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={e => { handleInputChange(e); setTouched(t => ({ ...t, firstName: true })); }}
                    placeholder="John"
                    className={`transition-all ${errors.firstName && touched.firstName ? 'border-red-500' : 'focus:border-indigo-500'} bg-white`}
                    aria-invalid={!!errors.firstName}
                    aria-describedby="firstName-error"
                  />
                  {errors.firstName && touched.firstName && (
                    <div id="firstName-error" className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.firstName}</div>
                  )}
                </div>
                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-base font-medium">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={e => { handleInputChange(e); setTouched(t => ({ ...t, lastName: true })); }}
                    placeholder="Doe"
                    className={`transition-all ${errors.lastName && touched.lastName ? 'border-red-500' : 'focus:border-indigo-500'} bg-white`}
                    aria-invalid={!!errors.lastName}
                    aria-describedby="lastName-error"
                  />
                  {errors.lastName && touched.lastName && (
                    <div id="lastName-error" className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.lastName}</div>
                  )}
                </div>
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-medium">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={e => { handleInputChange(e); setTouched(t => ({ ...t, email: true })); }}
                    placeholder="your@email.com"
                    className={`transition-all ${errors.email && touched.email ? 'border-red-500' : 'focus:border-indigo-500'} bg-white`}
                    aria-invalid={!!errors.email}
                    aria-describedby="email-error"
                  />
                  {errors.email && touched.email && (
                    <div id="email-error" className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.email}</div>
                  )}
                </div>
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-medium">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => { handleInputChange(e); setTouched(t => ({ ...t, phone: true })); }}
                    placeholder="+1 (555) 000-0000"
                    className={`transition-all ${errors.phone && touched.phone ? 'border-red-500' : 'focus:border-indigo-500'} bg-white`}
                    aria-invalid={!!errors.phone}
                    aria-describedby="phone-error"
                  />
                  {errors.phone && touched.phone && (
                    <div id="phone-error" className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.phone}</div>
                  )}
                </div>
                {/* Location */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location" className="text-base font-medium">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={e => { handleInputChange(e); setTouched(t => ({ ...t, location: true })); }}
                    placeholder="City, Country"
                    className="transition-all focus:border-indigo-500 bg-white"
                  />
                </div>
                {/* Bio */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio" className="text-base font-medium">Bio</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={e => { handleInputChange(e as any); setTouched(t => ({ ...t, bio: true })); }}
                    placeholder="Tell us about yourself..."
                    className="transition-all focus:border-indigo-500 bg-white flex min-h-[100px] w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-describedby="bio-error"
                  />
                </div>
                {/* Save/Cancel Buttons */}
                <div className="md:col-span-2 flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="settings-btn-animated settings-focus-glow"
                    onClick={() => {
                      setFormData({
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        location: user?.location || '',
                        bio: user?.bio || '',
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setAvatarFile(null);
                      setAvatarPreview(null);
                      setDirty(false);
                      setTouched({});
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="settings-btn-animated settings-focus-glow bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg px-6 py-2 shadow-lg transition-all"
                    disabled={isSaving || !dirty || Object.keys(errors).length > 0}
                  >
                    {isSaving ? <span className="animate-spin mr-2">🔄</span> : <Save className="mr-2 h-4 w-4 settings-icon-animated" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>
          {/* Security Tab */}
          <TabsContent value="security">
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
              {/* Security Checklist & Rating */}
              <div className="w-full max-w-2xl mx-auto flex flex-col md:flex-row gap-6 mb-8">
                {/* Security Checklist */}
                <div className="flex-1 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 flex flex-col gap-3">
                  <h3 className="text-base font-semibold mb-2 flex items-center gap-2"><Lock className="w-5 h-5 text-indigo-500" /> Security Checklist</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">✅</span>
                      <span>Strong password</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">❌</span>
                      <span>2FA not enabled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">✅</span>
                      <span>No suspicious logins</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">✅</span>
                      <span>Only 1 active session</span>
                    </div>
                  </div>
                </div>
                {/* Security Rating */}
                <div className="flex flex-col items-center justify-center bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 min-w-[180px]">
                  <div className="mb-2 text-sm text-gray-500">Security Rating</div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">🛡️</span>
                    <span className="text-lg font-bold text-green-600">Excellent</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                    <div className="h-2 rounded-full bg-green-400 transition-all" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
              {/* Change Password Card with Strength Meter */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 flex flex-col items-center">
                <Lock className="w-10 h-10 text-indigo-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Change Password</h2>
                <form className="w-full max-w-sm flex flex-col gap-4 mt-4" onSubmit={e => { e.preventDefault(); /* handle password change */ }}>
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required className="mt-1"
                      onChange={e => setNewPassword(e.target.value)}
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`h-2 w-24 rounded-full ${strengthColors[getPasswordStrength(newPassword)]} transition-all`}></div>
                      <span className="text-xs text-gray-500">{strengthLabels[getPasswordStrength(newPassword)]}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Use at least 8 characters, a number, a symbol, and uppercase letter.</div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required className="mt-1"
                      onChange={e => setConfirmPassword(e.target.value)}
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <div className="text-xs text-red-500 mt-1">Passwords do not match</div>
                    )}
                  </div>
                  <Button type="submit" className="mt-2 w-full" disabled={getPasswordStrength(newPassword) < 3 || newPassword !== confirmPassword}>Update Password</Button>
                </form>
              </div>
              {/* Helpful Tips Accordion */}
              <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 mt-8">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-indigo-500" /> Helpful Security Tips</h3>
                <div className="divide-y divide-gray-200">
                  <details className="py-2 group">
                    <summary className="cursor-pointer font-medium text-indigo-700 group-open:text-indigo-900 transition-all">How to spot phishing attempts?</summary>
                    <div className="text-gray-600 mt-2 text-sm">Never click suspicious links or provide your credentials to untrusted sources. Always check the sender's email and website URL.</div>
                  </details>
                  <details className="py-2 group">
                    <summary className="cursor-pointer font-medium text-indigo-700 group-open:text-indigo-900 transition-all">Tips for creating a strong password</summary>
                    <div className="text-gray-600 mt-2 text-sm">Use a mix of uppercase, lowercase, numbers, and symbols. Avoid common words and update your password regularly.</div>
                  </details>
                  <details className="py-2 group">
                    <summary className="cursor-pointer font-medium text-indigo-700 group-open:text-indigo-900 transition-all">How to secure your devices?</summary>
                    <div className="text-gray-600 mt-2 text-sm">Keep your OS and apps updated, use antivirus software, and enable device encryption where possible.</div>
                  </details>
                </div>
              </div>
              {/* 2FA Card */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 flex flex-col items-center">
                <div className="flex items-center gap-3 mb-2">
                  <Lock className="w-7 h-7 text-indigo-500" />
                  <h2 className="text-lg font-semibold">Two-Factor Authentication (2FA)</h2>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{false ? 'Enabled' : 'Not Set'}</span>
                </div>
                <p className="text-gray-500 text-center mb-4">Add an extra layer of security to your account by enabling 2FA. You'll be asked for a code from your mobile device when logging in.</p>
                {/* 2FA Setup UI */}
                {false ? (
                  <>
                    <Switch id="2fa-toggle" checked={true} onCheckedChange={() => {}} className="mb-2" />
                    <span className="text-xs text-green-600">2FA is enabled</span>
                  </>
                ) : (
                  <>
                    <button
                      className="px-4 py-2 rounded-lg bg-indigo-100 text-indigo-700 font-medium shadow hover:bg-indigo-200 transition mb-2"
                      onClick={() => setShow2FAModal(true)}
                    >
                      Set up 2FA
                    </button>
                    {show2FAModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center animate-fade-in">
                          <h3 className="text-lg font-semibold mb-2">Set up Two-Factor Authentication</h3>
                          <p className="text-gray-500 text-center mb-4">Scan this QR code with your authenticator app, then save your recovery keys.</p>
                          <div className="bg-gray-100 rounded-lg p-4 mb-4 flex flex-col items-center">
                            {/* Placeholder QR code */}
                            <div className="w-32 h-32 bg-gray-300 rounded mb-2 flex items-center justify-center text-gray-400">QR</div>
                            <span className="text-xs text-gray-500">Secret: <span className="font-mono">JBSWY3DPEHPK3PXP</span></span>
                          </div>
                          <div className="w-full mb-4">
                            <div className="font-semibold text-sm mb-1">Recovery Keys</div>
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-gray-50 p-2 rounded">
                              <span>1A2B-3C4D</span>
                              <span>5E6F-7G8H</span>
                              <span>9I0J-1K2L</span>
                              <span>3M4N-5O6P</span>
                            </div>
                            <button className="mt-2 text-indigo-600 hover:underline text-xs" onClick={() => {navigator.clipboard.writeText('1A2B-3C4D 5E6F-7G8H 9I0J-1K2L 3M4N-5O6P')}}>Copy All</button>
                          </div>
                          <button
                            className="w-full mt-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                            onClick={() => { setShow2FAModal(false); /* set 2FA enabled state */ }}
                          >
                            I've set up 2FA
                          </button>
                          <button className="mt-4 text-xs text-gray-400 hover:underline" onClick={() => setShow2FAModal(false)}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              {/* Login History Timeline */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 flex flex-col items-center w-full">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-500" /> Login History
                </h2>
                <ul className="w-full max-w-md mx-auto text-gray-600 text-sm space-y-4">
                  {/* Mock login history data */}
                  {[
                    { id: 1, device: 'Chrome on Windows', location: 'New York, USA', time: 'Today, 09:12 AM', status: 'normal' },
                    { id: 2, device: 'Safari on iPhone', location: 'San Francisco, USA', time: 'Yesterday, 10:45 PM', status: 'new' },
                    { id: 3, device: 'Edge on Windows', location: 'London, UK', time: '2 days ago, 6:30 PM', status: 'suspicious' },
                  ].map(login => (
                    <li key={login.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3 shadow-sm">
                      <div className="flex flex-col flex-1">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {login.device}
                          {login.status === 'new' && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">New Device</span>}
                          {login.status === 'suspicious' && <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Suspicious</span>}
                        </div>
                        <div className="text-xs text-gray-500">{login.location} • {login.time}</div>
                      </div>
                      <div className="flex-shrink-0">
                        {/* Browser/OS icon placeholder */}
                        <User className="w-5 h-5 text-indigo-400" />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="w-full max-w-3xl mx-auto flex flex-col gap-10 pb-32">
              {/* Global Notification Controls */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 flex flex-col items-center w-full mb-6 transition-all duration-200 hover:shadow-indigo-200">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2 w-full text-indigo-700"><span className="text-2xl">🔔</span> Global Notification Controls</h3>
                <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-6 h-6 text-indigo-500" />
                    <span className="font-semibold">Snooze All Notifications</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowSnoozeMenu(!showSnoozeMenu)} className="transition-all duration-200">Snooze</Button>
                    {showSnoozeMenu && (
                      <div className="absolute mt-10 bg-white border rounded-lg shadow-lg p-2 z-50 flex flex-col gap-1 animate-fade-in">
                        <button className="px-4 py-1 hover:bg-indigo-50 rounded text-sm text-left transition-all duration-200" onClick={() => handleSnooze('1h')}>For 1 hour</button>
                        <button className="px-4 py-1 hover:bg-indigo-50 rounded text-sm text-left transition-all duration-200" onClick={() => handleSnooze('tomorrow')}>Until tomorrow</button>
                        <div className="flex items-center gap-2 px-4 py-1">
                          <span className="text-sm">Custom:</span>
                          <input type="time" className="border rounded px-2 py-0.5 text-xs" onChange={e => setCustomSnooze(e.target.value)} />
                          <Button size="sm" onClick={() => handleSnooze(customSnooze)} className="transition-all duration-200">Set</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-6 border-t pt-6">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-400" />
                    <span className="font-semibold">Do Not Disturb</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">From</span>
                    <input type="time" className="border rounded px-2 py-0.5 text-xs" value={dndStart} onChange={e => setDndStart(e.target.value)} />
                    <span className="text-sm">to</span>
                    <input type="time" className="border rounded px-2 py-0.5 text-xs" value={dndEnd} onChange={e => setDndEnd(e.target.value)} />
                    <span className="ml-4 text-xs text-indigo-600 underline cursor-pointer" onClick={() => alert('Change timezone in profile settings.')}>Change timezone ({timezone} detected)</span>
                  </div>
                </div>
                <div className="w-full flex items-center gap-2 mt-6">
                  <input type="checkbox" checked={digest} onChange={e => setDigest(e.target.checked)} className="accent-indigo-500" id="digest-toggle" />
                  <label htmlFor="digest-toggle" className="text-sm">Send me a weekly digest summary email <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">NEW</span></label>
                </div>
              </div>
              {/* Channel Priority Settings */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 flex flex-col items-center w-full mb-6 transition-all duration-200 hover:shadow-indigo-200">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2 w-full text-indigo-700"><span className="text-2xl">⚙️</span> Channel Priority</h3>
                <div className="w-full max-w-md mx-auto flex flex-col gap-2 mt-2">
                  {channelPriority.map((channel, idx) => (
                    <div key={channel} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2 shadow-sm cursor-move transition-all duration-200 hover:bg-indigo-50">
                      <GripVertical className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{channel === 'In-App' ? 'Web Notifications' : channel}</span>
                      <span className="ml-auto text-xs text-gray-400">Priority {idx + 1}</span>
                    </div>
                  ))}
                  <div className="text-xs text-gray-400 mt-2">(Drag to reorder priority. Highest priority at top.)</div>
                </div>
              </div>
              {/* Per-Category Channel Control */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 flex flex-col items-center w-full mb-6 transition-all duration-200 hover:shadow-indigo-200">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2 w-full text-indigo-700"><span className="text-2xl">📑</span> Per-Category Control</h3>
                <div className="w-full max-w-md mx-auto flex flex-col gap-3 sm:gap-2">
                  {Object.entries(categoryChannels).map(([cat, channels]) => (
                    <div key={cat} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
                      <span className="w-32 font-medium flex-shrink-0">{cat}</span>
                      <div className="flex gap-2 flex-wrap">
                        {['Email', 'SMS', 'Web Notifications'].map(channel => (
                          <Tooltip key={channel}>
                            <TooltipTrigger asChild>
                              <label className="flex items-center gap-1 text-xs font-medium cursor-pointer transition-all duration-200">
                                <input
                                  type="checkbox"
                                  checked={channels.includes(channel.replace('Web Notifications', 'In-App'))}
                                  onChange={() => handleCategoryChannelToggle(cat, channel.replace('Web Notifications', 'In-App'))}
                                  className="accent-indigo-500 transition-all duration-200"
                                />
                                {channel}
                              </label>
                            </TooltipTrigger>
                            <TooltipContent>
                              {channel === 'Email' && 'Email notifications for important updates.'}
                              {channel === 'SMS' && 'Used only for urgent security updates.'}
                              {channel === 'Web Notifications' && 'Browser popups and dashboard alerts.'}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Granular Settings Matrix */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 flex flex-col items-center w-full mb-6 transition-all duration-200 hover:shadow-indigo-200">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b pb-2 w-full text-indigo-700"><span className="text-2xl">📋</span> Notification Channels by Category</h3>
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full text-sm border-separate border-spacing-y-2">
                    <thead>
                      <tr>
                        <th className="text-left font-medium">Category</th>
                        {notificationChannels.map(ch => (
                          <th key={ch.key} className="text-center font-medium max-w-[90px]">
                            <div className="flex flex-col items-center">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="mb-1" onClick={() => handleMasterToggle(ch.key)} title={`Toggle all ${ch.key}`}>
                                    {ch.icon}
                                    <span className="sr-only">Toggle all {ch.key}</span>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {ch.key === 'Email' && 'Email notifications for important updates.'}
                                  {ch.key === 'SMS' && 'Used only for urgent security updates.'}
                                  {ch.key === 'In-App' && 'Browser popups and dashboard alerts.'}
                                </TooltipContent>
                              </Tooltip>
                              <span className="flex items-center gap-1 text-xs font-medium text-gray-700 text-center break-words max-w-[80px]">
                                {ch.key === 'In-App' ? 'Web Notifications' : ch.key}
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="ml-1 cursor-help"><Info className="w-3 h-3 text-gray-400" /></span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {ch.tooltip}
                                  </TooltipContent>
                                </Tooltip>
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {notificationCategories.map(cat => (
                        <tr key={cat} className="bg-gray-50 rounded">
                          <td className="py-2 px-3 font-medium">{cat}</td>
                          {notificationChannels.map(ch => (
                            <td key={ch.key} className="text-center">
                              <button
                                className={`rounded-full w-8 h-8 flex items-center justify-center border transition-all duration-200 ${matrix[cat][ch.key] ? 'bg-indigo-100 border-indigo-400 text-indigo-700' : 'bg-gray-100 border-gray-200 text-gray-400'} hover:scale-105 hover:border-indigo-500`}
                                onClick={() => handleMatrixToggle(cat, ch.key)}
                                title={ch.tooltip}
                              >
                                {matrix[cat][ch.key] ? <Check className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Smart Suggestions */}
                {Object.values(matrix).some(row => Object.values(row).every(v => !v)) && (
                  <div className="mt-4 text-yellow-700 bg-yellow-50 rounded p-2 text-xs flex items-center gap-2 transition-all duration-200">
                    <AlertCircle className="w-4 h-4" />
                    ⚠️ You might miss critical updates. Want to enable Web Notifications instead?
                  </div>
                )}
              </div>
              {/* Notification Summary */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 flex flex-col items-center w-full mb-6 transition-all duration-200 hover:shadow-indigo-200">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2 border-b pb-2 w-full text-indigo-700"><span className="text-2xl">📊</span> Notification Summary</h3>
                <div className="w-full border-t pt-3 text-sm text-gray-700 text-center transition-all duration-200">You will receive: {getSummary() || 'No notifications enabled.'}</div>
              </div>
              {/* Live Feedback & Test Mode */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-2 w-full max-w-md mx-auto mb-2 sticky bottom-24 bg-white/90 p-2 rounded-xl shadow z-40 transition-all duration-200 border border-indigo-100">
                <div className="relative">
                  <Button type="button" variant="secondary" onClick={() => setShowTestDropdown(v => !v)} className="transition-all flex items-center gap-1">
                    <ChevronDown className="w-4 h-4" /> Send Test Notification
                  </Button>
                  {showTestDropdown && (
                    <div className="absolute left-0 mt-2 bg-white border rounded-lg shadow-lg p-2 z-50 flex flex-col gap-1 animate-fade-in">
                      {notificationChannels.map(ch => (
                        <button key={ch.key} className="px-4 py-1 hover:bg-indigo-50 rounded text-sm text-left transition-all duration-200 flex items-center gap-2" onClick={() => { setShowTestDropdown(false); setTestSent(ch.key); setTimeout(() => setTestSent(''), 2000); }}>
                          {ch.icon}
                          {ch.key === 'In-App' ? 'Web Notifications' : ch.key}
                        </button>
                      ))}
                    </div>
                  )}
                  {testSent && (
                    <div className="absolute left-0 mt-14 bg-green-100 text-green-800 px-3 py-1 rounded shadow animate-fade-in text-xs">✔ Test {testSent === 'In-App' ? 'Web Notifications' : testSent} Sent</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => {}} className="transition-all">Reset</Button>
                  <Button type="button" onClick={handleSaveNotifications} className="transition-all">Save Changes</Button>
                </div>
              </div>
              {/* Unsaved Changes Snackbar */}
              {unsaved && !showSaved && (
                <div className="w-full max-w-md mx-auto sticky bottom-16 z-50 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-lg animate-fade-in mt-2 text-center border border-yellow-300">
                  You have unsaved changes. Save before leaving.
                </div>
              )}
              {/* Saved Status Indicator */}
              {showSaved && (
                <div className="fixed top-6 right-6 z-50 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg animate-fade-in border border-green-300">
                  Notification preferences updated!
                </div>
              )}
              {/* Advanced Notification Settings Accordion (unchanged, but now spaced below main controls) */}
              <details className="group mt-12" style={{ transition: 'all 0.3s' }}>
                <summary className="cursor-pointer font-semibold text-lg flex items-center gap-2 py-4 px-4 rounded-2xl hover:bg-indigo-50 transition-all group-open:bg-indigo-50 group-open:shadow text-indigo-800 border border-indigo-100">
                  <span className="text-2xl">⚙️</span> Advanced Notification Settings
                  <span className="ml-2 text-xs text-gray-500 font-normal">(Power-user & team controls: quiet hours, thresholds, routing, tags, history, team, fallback)</span>
                </summary>
                <div className="flex flex-col gap-10 mt-6">
                  {/* 1. Quiet Hours per Channel */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 flex flex-col gap-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><span className="text-2xl">⏰</span> Quiet Hours per Channel</h3>
                    <div className="flex flex-col gap-4">
                      {['Email', 'SMS', 'Web Notifications'].map(channel => (
                        <div key={channel} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                          <label className="font-medium w-40 flex-shrink-0 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={quietHours[channel].enabled}
                              onChange={e => setQuietHours(qh => ({ ...qh, [channel]: { ...qh[channel], enabled: e.target.checked } }))}
                              className="accent-indigo-500"
                            />
                            {channel}
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Allowed:</span>
                            <input
                              type="time"
                              value={quietHours[channel].start}
                              onChange={e => setQuietHours(qh => ({ ...qh, [channel]: { ...qh[channel], start: e.target.value } }))}
                              disabled={!quietHours[channel].enabled}
                              className="border rounded px-2 py-1 text-xs w-24"
                            />
                            <span className="text-xs">to</span>
                            <input
                              type="time"
                              value={quietHours[channel].end}
                              onChange={e => setQuietHours(qh => ({ ...qh, [channel]: { ...qh[channel], end: e.target.value } }))}
                              disabled={!quietHours[channel].enabled}
                              className="border rounded px-2 py-1 text-xs w-24"
                            />
                          </div>
                          <span className="text-xs text-gray-400 ml-2">{quietHours[channel].enabled ? `${channel} allowed ${quietHours[channel].start}–${quietHours[channel].end}` : 'Anytime'}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" checked={respectTimezone} onChange={e => setRespectTimezone(e.target.checked)} className="accent-indigo-500" id="tz-auto" />
                        <label htmlFor="tz-auto" className="text-xs text-gray-600 cursor-pointer">Respect time zone automatically</label>
                      </div>
                    </div>
                  </div>
                  {/* 2. Threshold-based Alerts */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><span className="text-2xl">📏</span> Threshold-based Alerts</h3>
                    <div className="flex flex-col gap-6">
                      {/* Security Alerts */}
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                        <span className="w-40 font-medium flex-shrink-0">Security Alerts</span>
                        <select
                          value={thresholds['Security Alerts']}
                          onChange={e => setThresholds(t => ({ ...t, 'Security Alerts': e.target.value }))}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="All">All</option>
                          <option value="Only Critical">Only Critical</option>
                          <option value="Only High/Critical">Only High/Critical</option>
                        </select>
                        <span className="text-xs text-gray-400 ml-2">Current: {thresholds['Security Alerts']}</span>
                      </div>
                      {/* Job Alerts */}
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                        <span className="w-40 font-medium flex-shrink-0">Job Alerts</span>
                        <input
                          type="range"
                          min={50}
                          max={100}
                          step={1}
                          value={thresholds['Job Alerts']}
                          onChange={e => setThresholds(t => ({ ...t, 'Job Alerts': Number(e.target.value) }))}
                          className="accent-indigo-500 w-40"
                        />
                        <span className="text-xs text-gray-500 ml-2">Only notify if match score &ge; <b>{thresholds['Job Alerts']}%</b></span>
                      </div>
                      {/* Product Updates */}
                      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                        <span className="w-40 font-medium flex-shrink-0">Product Updates</span>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={thresholds['Product Updates']}
                            onChange={e => setThresholds(t => ({ ...t, 'Product Updates': e.target.checked }))}
                            className="accent-indigo-500"
                          />
                          Only major releases
                        </label>
                        <span className="text-xs text-gray-400 ml-2">Current: {thresholds['Product Updates'] ? 'Major only' : 'All updates'}</span>
                      </div>
                    </div>
                  </div>
                  {/* 3. Conditional Routing */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><span className="text-2xl">🔀</span> Conditional Routing</h3>
                    <div className="flex flex-col gap-4">
                      {routingRules.map(rule => (
                        <div key={rule.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 border-b pb-2 last:border-b-0 last:pb-0">
                          <span className="text-xs text-gray-500">If</span>
                          <select value={rule.ifType} onChange={e => updateRoutingRule(rule.id, 'ifType', e.target.value)} className="border rounded px-2 py-1 text-sm">
                            <option value="Priority">Priority</option>
                            <option value="Type">Type</option>
                          </select>
                          {rule.ifType === 'Priority' ? (
                            <select value={rule.ifValue} onChange={e => updateRoutingRule(rule.id, 'ifValue', e.target.value)} className="border rounded px-2 py-1 text-sm">
                              <option value="High">High</option>
                              <option value="Critical">Critical</option>
                              <option value="Normal">Normal</option>
                            </select>
                          ) : (
                            <select value={rule.ifValue} onChange={e => updateRoutingRule(rule.id, 'ifValue', e.target.value)} className="border rounded px-2 py-1 text-sm">
                              <option value="Newsletter">Newsletter</option>
                              <option value="Product Update">Product Update</option>
                              <option value="Job Alert">Job Alert</option>
                            </select>
                          )}
                          <span className="text-xs text-gray-500">send via</span>
                          <select value={rule.channel} onChange={e => updateRoutingRule(rule.id, 'channel', e.target.value)} className="border rounded px-2 py-1 text-sm">
                            <option value="Email">Email</option>
                            <option value="SMS">SMS</option>
                            <option value="Web Notifications">Web Notifications</option>
                          </select>
                          <button onClick={() => removeRoutingRule(rule.id)} className="text-xs text-red-500 hover:underline ml-2">Remove</button>
                        </div>
                      ))}
                      <button onClick={addRoutingRule} className="text-xs text-indigo-600 underline w-fit">+ Add Routing Rule</button>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mt-4">
                        <span className="font-medium w-40 flex-shrink-0">Newsletters to alternate email:</span>
                        <input
                          type="email"
                          value={newsletterEmail}
                          onChange={e => setNewsletterEmail(e.target.value)}
                          placeholder="Enter alternate email"
                          className="border rounded px-2 py-1 text-sm w-64"
                        />
                        {newsletterEmail && <span className="text-xs text-gray-400 ml-2">Current: {newsletterEmail}</span>}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">Summary: {routingRules.length === 0 && !newsletterEmail ? 'No custom routing rules.' : routingRules.map(r => `If ${r.ifType} is ${r.ifValue}, send via ${r.channel}`).join('; ') + (newsletterEmail ? `; Newsletters to ${newsletterEmail}` : '')}</div>
                    </div>
                  </div>
                  {/* 4. Custom Labels/Tags */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><span className="text-2xl">🏷️</span> Custom Labels & Tags</h3>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap gap-2">
                        {tags.map(tag => (
                          <div key={tag.id} className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm ${tag.muted ? 'bg-gray-100 text-gray-400 border-gray-200' : tag.highlighted ? 'bg-yellow-50 border-yellow-300 text-yellow-800 font-semibold' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
                            <span>{tag.emoji}</span>
                            <span>{tag.label}</span>
                            <button onClick={() => toggleTag(tag.id, 'muted')} className={`text-xs px-2 py-0.5 rounded ${tag.muted ? 'bg-gray-300 text-gray-700' : 'bg-gray-100 text-gray-500'} hover:bg-gray-200 ml-1`}>{tag.muted ? 'Muted' : 'Mute'}</button>
                            <button onClick={() => toggleTag(tag.id, 'highlighted')} className={`text-xs px-2 py-0.5 rounded ${tag.highlighted ? 'bg-yellow-300 text-yellow-900' : 'bg-yellow-50 text-yellow-700'} hover:bg-yellow-100 ml-1`}>{tag.highlighted ? 'Highlighted' : 'Highlight'}</button>
                            <button onClick={() => removeTag(tag.id)} className="text-xs text-red-500 hover:underline ml-1">Remove</button>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="text"
                          value={newTagEmoji}
                          onChange={e => setNewTagEmoji(e.target.value)}
                          placeholder="Emoji"
                          className="border rounded px-2 py-1 text-sm w-16"
                          maxLength={2}
                        />
                        <input
                          type="text"
                          value={newTagLabel}
                          onChange={e => setNewTagLabel(e.target.value)}
                          placeholder="Label"
                          className="border rounded px-2 py-1 text-sm w-40"
                        />
                        <button onClick={addTag} className="text-xs text-indigo-600 underline">+ Add Tag</button>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">Summary: {tags.length === 0 ? 'No tags.' : `${tags.filter(t => t.muted).length} muted, ${tags.filter(t => t.highlighted).length} highlighted`}</div>
                    </div>
                  </div>
                  {/* 5. Notification History/Log */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 overflow-x-auto">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><span className="text-2xl">📜</span> Notification History / Log</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border rounded px-2 py-1 text-sm">
                        <option value="All">All Types</option>
                        <option value="Job Alert">Job Alert</option>
                        <option value="Security Alert">Security Alert</option>
                        <option value="Newsletter">Newsletter</option>
                        <option value="Product Update">Product Update</option>
                      </select>
                      <select value={filterChannel} onChange={e => setFilterChannel(e.target.value)} className="border rounded px-2 py-1 text-sm">
                        <option value="All">All Channels</option>
                        <option value="Email">Email</option>
                        <option value="SMS">SMS</option>
                        <option value="Web Notifications">Web Notifications</option>
                      </select>
                      <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="border rounded px-2 py-1 text-sm" />
                    </div>
                    <table className="min-w-full text-sm border-separate border-spacing-y-2">
                      <thead>
                        <tr>
                          <th className="text-left font-medium">Date</th>
                          <th className="text-left font-medium">Type</th>
                          <th className="text-left font-medium">Channel</th>
                          <th className="text-left font-medium">Status</th>
                          <th className="text-left font-medium">Content</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHistory.length === 0 ? (
                          <tr><td colSpan={5} className="text-center text-gray-400 py-4">No notifications found.</td></tr>
                        ) : (
                          filteredHistory.map(h => (
                            <tr key={h.id} className="bg-gray-50 rounded">
                              <td className="py-2 px-3 whitespace-nowrap">{h.date}</td>
                              <td className="py-2 px-3 whitespace-nowrap">{h.type}</td>
                              <td className="py-2 px-3 whitespace-nowrap">{h.channel}</td>
                              <td className={`py-2 px-3 whitespace-nowrap font-medium ${h.status === 'Delivered' ? 'text-green-700' : 'text-red-600'}`}>{h.status}</td>
                              <td className="py-2 px-3 truncate max-w-xs" title={h.content}>{h.content}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* 6. Multi-user Notification Control (Team Settings) */}
                  {isAdmin && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 overflow-x-auto">
                      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><span className="text-2xl">👥</span> Team Notification Settings</h3>
                      <div className="text-gray-500 text-sm mb-2">Control which team roles receive which notifications.</div>
                      <table className="min-w-full text-sm border-separate border-spacing-y-2">
                        <thead>
                          <tr>
                            <th className="sticky left-0 bg-white z-10 text-left font-medium">Role</th>
                            {teamCategories.map((cat, i) => (
                              <th key={cat} colSpan={teamChannels.length} className={`text-center font-medium border-l ${i === 0 ? 'border-l-0' : 'border-l-gray-200'} px-6`}>{cat}
                                <div className="mt-1">
                                  <button
                                    className="text-xs text-indigo-600 underline mr-2"
                                    onClick={e => {
                                      e.preventDefault();
                                      const allChecked = teamRoles.every(role => teamChannels.every(ch => teamMatrix[role][cat][ch]));
                                      setTeamMatrix(m => {
                                        const newM = { ...m };
                                        teamRoles.forEach(role => teamChannels.forEach(ch => { newM[role][cat][ch] = !allChecked; }));
                                        return newM;
                                      });
                                    }}
                                    aria-label={`Toggle all for ${cat}`}
                                  >{teamRoles.every(role => teamChannels.every(ch => teamMatrix[role][cat][ch])) ? 'Deselect All' : 'Select All'}</button>
                                </div>
                              </th>
                            ))}
                          </tr>
                          <tr>
                            <th className="sticky left-0 bg-white z-10"></th>
                            {teamCategories.map((cat, i) => teamChannels.map(ch => (
                              <th key={cat + ch} className={`text-center font-normal text-xs border-l ${i === 0 && ch === teamChannels[0] ? 'border-l-0' : 'border-l-gray-100'} px-4`}>
                                <span role="img" aria-label={channelIcons[ch].label} title={channelIcons[ch].label} className="cursor-help">?</span>
                              </th>
                            )))}
                          </tr>
                        </thead>
                        <tbody>
                          {teamRoles.map((role, rowIdx) => (
                            <tr key={role} className={rowIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="py-4 px-4 font-medium whitespace-nowrap sticky left-0 bg-inherit z-10" style={{ boxShadow: '2px 0 0 #f3f4f6' }}>{role}
                                <button
                                  className="ml-2 text-xs text-indigo-600 underline"
                                  onClick={e => {
                                    e.preventDefault();
                                    const allChecked = teamCategories.every(cat => teamChannels.every(ch => teamMatrix[role][cat][ch]));
                                    setTeamMatrix(m => {
                                      const newM = { ...m };
                                      teamCategories.forEach(cat => teamChannels.forEach(ch => { newM[role][cat][ch] = !allChecked; }));
                                      return newM;
                                    });
                                  }}
                                  aria-label={`Toggle all for ${role}`}
                                >{teamCategories.every(cat => teamChannels.every(ch => teamMatrix[role][cat][ch])) ? 'Deselect All' : 'Select All'}</button>
                              </td>
                              {teamCategories.map((cat, i) => (
                                <td key={role + cat} colSpan={teamChannels.length} className={`px-0 border-l ${i === 0 ? 'border-l-0' : 'border-l-gray-100'} bg-indigo-50/30 rounded-lg`}> 
                                  <div className="flex justify-center gap-4 py-2">
                                    {teamChannels.map(ch => (
                                      <label key={role + cat + ch} className="flex flex-col items-center gap-1 px-2">
                                        <input
                                          type="checkbox"
                                          checked={teamMatrix[role][cat][ch]}
                                          onChange={() => toggleTeamMatrix(role, cat, ch)}
                                          className="accent-indigo-500 w-6 h-6"
                                          aria-label={`Toggle ${ch} for ${role} (${cat})`}
                                        />
                                        <span className="sr-only">{channelIcons[ch].label}</span>
                                      </label>
                                    ))}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {/* Channel legend */}
                      <div className="flex gap-4 mt-4 text-xs text-gray-500 items-center">
                        <span className="font-semibold">Legend:</span>
                        {teamChannels.map(ch => (
                          <span key={ch} className="flex items-center gap-1"><span role="img" aria-label={channelIcons[ch].label}>{channelIcons[ch].icon}</span> {channelIcons[ch].label}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* 7. Fallback Channel */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <h3 className="text-lg font-semibold flex items-center gap-2 mb-2"><span className="text-2xl">🔁</span> Fallback Channel</h3>
                    <div className="flex flex-col gap-4">
                      {fallbackCategories.map(cat => (
                        <div key={cat} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                          <span className="w-40 font-medium flex-shrink-0">{cat}</span>
                          <select
                            value={fallback[cat]}
                            onChange={e => setFallback(f => ({ ...f, [cat]: e.target.value }))}
                            className="border rounded px-2 py-1 text-sm w-48"
                          >
                            {fallbackChannels.map(ch => (
                              <option key={ch} value={ch}>{ch === 'None' ? 'No fallback' : ch}</option>
                            ))}
                          </select>
                          <span className="text-xs text-gray-400 ml-2">Current: {fallback[cat] === 'None' ? 'No fallback' : fallback[cat]}</span>
                        </div>
                      ))}
                      <div className="mt-2 text-xs text-gray-500">If the primary channel fails, notifications will be retried on the selected fallback channel.</div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          </TabsContent>
          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
              {/* Theme Selection Card */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 flex flex-col items-center w-full mb-2">
                <Palette className="w-10 h-10 text-indigo-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Theme</h2>
                <div className="flex gap-4 mt-2">
                  {['light', 'dark', 'system'].map(opt => (
                    <button
                      key={opt}
                      className={`flex flex-col items-center px-4 py-2 rounded-lg border transition-all ${settings.theme === opt ? 'bg-indigo-100 border-indigo-400 text-indigo-700' : 'bg-gray-100 border-gray-200 text-gray-400'} hover:scale-105`}
                      onClick={() => handleThemeChange(opt as 'light' | 'dark' | 'system')}
                    >
                      {opt === 'light' && <Sun className="w-6 h-6 mb-1" />}
                      {opt === 'dark' && <Moon className="w-6 h-6 mb-1" />}
                      {opt === 'system' && <Monitor className="w-6 h-6 mb-1" />}
                      <span className="capitalize text-xs">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Accent Color Picker */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 flex flex-col items-center w-full mb-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2 w-full">Accent Color</h3>
                <div className="flex gap-3 mt-2">
                  {["#6366f1", "#f472b6", "#22d3ee", "#facc15", "#22c55e", "#3b82f6"].map(color => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${settings.accent === color ? 'border-indigo-500 scale-110' : 'border-gray-200'} focus:outline-none`}
                      style={{ background: color }}
                      onClick={() => setSettings(s => ({ ...s, accent: color }))}
                      aria-label={`Set accent color ${color}`}
                    />
                  ))}
                </div>
              </div>
              {/* Font Size & Typography */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 flex flex-col items-center w-full mb-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2 w-full">Font & Typography</h3>
                <div className="flex gap-4 mt-2">
                  {['normal', 'large', 'dyslexia'].map(opt => (
                    <button
                      key={opt}
                      className={`px-4 py-2 rounded-lg border transition-all ${settings.font === opt ? 'bg-indigo-100 border-indigo-400 text-indigo-700' : 'bg-gray-100 border-gray-200 text-gray-400'} hover:scale-105`}
                      onClick={() => setSettings(s => ({ ...s, font: opt }))}
                    >
                      <span className="capitalize">{opt === 'dyslexia' ? 'Dyslexia-friendly' : opt}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Accessibility Toggles */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 flex flex-col items-center w-full mb-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2 w-full">Accessibility</h3>
                <div className="flex flex-col gap-3 w-full max-w-md mx-auto mt-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={settings.highContrast} onChange={e => setSettings(s => ({ ...s, highContrast: e.target.checked }))} className="accent-indigo-500" />
                    High Contrast Mode
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={settings.reducedMotion} onChange={e => setSettings(s => ({ ...s, reducedMotion: e.target.checked }))} className="accent-indigo-500" />
                    Reduce Motion
                  </label>
                </div>
              </div>
              {/* Live Preview Area */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 flex flex-col items-center w-full mb-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2 w-full">Live Preview</h3>
                <div className="w-full flex flex-col items-center gap-2">
                  <div className="w-64 h-20 rounded-xl flex items-center justify-center" style={{ background: settings.accent || '#6366f1', color: '#fff', fontSize: settings.font === 'large' ? '1.5rem' : '1rem', fontFamily: settings.font === 'dyslexia' ? 'OpenDyslexic, Arial, sans-serif' : 'inherit', filter: settings.highContrast ? 'contrast(1.5)' : 'none' }}>
                    {settings.theme === 'dark' ? 'Dark Mode' : settings.theme === 'light' ? 'Light Mode' : 'System Theme'}
                  </div>
                  <span className="text-xs text-gray-400">This is a preview of your selected appearance settings.</span>
                </div>
              </div>
              {/* Save/Reset Buttons */}
              <div className="flex justify-end gap-2 w-full max-w-md mx-auto mb-2">
                <Button type="button" variant="outline" onClick={() => {}} className="transition-all">Reset</Button>
                <Button type="button" onClick={() => { setShowSaved(true); setTimeout(() => setShowSaved(false), 2000); }} className="transition-all">Save Changes</Button>
              </div>
              {/* Saved Status Indicator */}
              {showSaved && (
                <div className="fixed top-6 right-6 z-50 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg animate-fade-in">
                  Appearance settings updated!
                </div>
              )}
              {/* Helpful Tips Accordion */}
              <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 mt-8">
                <h3 className="text-base font-semibold mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-indigo-500" /> Helpful Appearance Tips</h3>
                <div className="divide-y divide-gray-200">
                  <details className="py-2 group">
                    <summary className="cursor-pointer font-medium text-indigo-700 group-open:text-indigo-900 transition-all">How does dark mode work?</summary>
                    <div className="text-gray-600 mt-2 text-sm">Dark mode reduces eye strain and saves battery on OLED screens. You can switch anytime.</div>
                  </details>
                  <details className="py-2 group">
                    <summary className="cursor-pointer font-medium text-indigo-700 group-open:text-indigo-900 transition-all">What is high contrast mode?</summary>
                    <div className="text-gray-600 mt-2 text-sm">High contrast mode increases the difference between foreground and background for better readability.</div>
                  </details>
                  <details className="py-2 group">
                    <summary className="cursor-pointer font-medium text-indigo-700 group-open:text-indigo-900 transition-all">How do I use dyslexia-friendly font?</summary>
                    <div className="text-gray-600 mt-2 text-sm">Select the 'Dyslexia-friendly' option to use a font designed for easier reading.</div>
                  </details>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {/* Info/tips banner */}
      {showInfoBanner && (
        <div className="w-full max-w-3xl mx-auto mt-4 mb-6 bg-indigo-50 border border-indigo-200 rounded-xl px-6 py-4 flex items-center gap-4 shadow-md relative animate-fade-in">
          <span className="text-indigo-700 text-lg font-semibold">ℹ️ Notification Settings Tips</span>
          <span className="text-sm text-indigo-800">Customize how, when, and where you get notified. Use advanced settings for granular control, team management, and fallback options.</span>
          <button onClick={() => setShowInfoBanner(false)} className="absolute top-2 right-4 text-indigo-400 hover:text-indigo-700 text-xl">&times;</button>
        </div>
      )}
    </div>
  );
}