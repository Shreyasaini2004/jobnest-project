import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap } from "lucide-react";

const UpdateDetailsForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    experience: "",
    education: "",
    skills: "",
    bio: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Handle form submission here
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-job-accent/10 to-job-primary/10 rounded-xl p-8 border border-job-accent/20">
        <h1 className="text-3xl font-bold text-foreground mb-3">
          ✨ Update Your Profile
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Keep your profile fresh and up-to-date! A complete profile increases your chances 
          of landing your dream job by 75%. Let's make you stand out from the crowd.
        </p>
      </div>

      <Card className="border-border/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-job-primary/5 to-job-accent/5">
          <CardTitle className="text-2xl text-foreground flex items-center">
            <User className="h-6 w-6 mr-3 text-job-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Enter your first name"
                  className="border-border/50 focus:border-job-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Enter your last name"
                  className="border-border/50 focus:border-job-primary"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-job-primary" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="your.email@example.com"
                  className="border-border/50 focus:border-job-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-job-primary" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="border-border/50 focus:border-job-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-job-primary" />
                Location
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="City, State, Country"
                className="border-border/50 focus:border-job-primary"
              />
            </div>

            {/* Professional Information */}
            <div className="border-t pt-8">
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center">
                <Briefcase className="h-5 w-5 mr-3 text-job-primary" />
                Professional Details
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="experience" className="text-sm font-medium">Years of Experience</Label>
                  <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                    <SelectTrigger className="border-border/50 focus:border-job-primary">
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
                  <Label htmlFor="education" className="text-sm font-medium flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2 text-job-primary" />
                    Education
                  </Label>
                  <Select value={formData.education} onValueChange={(value) => handleInputChange("education", value)}>
                    <SelectTrigger className="border-border/50 focus:border-job-primary">
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

                <div className="space-y-2">
                  <Label htmlFor="skills" className="text-sm font-medium">Skills</Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => handleInputChange("skills", e.target.value)}
                    placeholder="e.g., React, Node.js, Python, Project Management"
                    className="border-border/50 focus:border-job-primary"
                  />
                  <p className="text-xs text-muted-foreground">Separate skills with commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell us about yourself, your experience, and what you're looking for..."
                    rows={4}
                    className="border-border/50 focus:border-job-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground">This will be visible to potential employers</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button 
                type="submit" 
                className="flex-1 bg-job-primary hover:bg-job-primary/90 text-white py-3 text-lg font-medium"
              >
                Update Profile
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="px-8 border-job-primary/20 hover:bg-job-primary/5"
              >
                Preview
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateDetailsForm;
