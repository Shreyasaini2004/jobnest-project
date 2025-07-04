import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, HelpCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

const faqs = [
  {
    question: "How do I apply for a job?",
    answer: "Browse job openings, click on a job, and use the 'Apply' button to submit your application."
  },
  {
    question: "How can I track my applications?",
    answer: "Go to 'Manage Applications' in your dashboard to see the status of all your job applications."
  },
  {
    question: "How do I reset my password?",
    answer: "Go to 'Settings' and use the 'Change Password' option. If you forgot your password, use the 'Forgot Password' link on the login page."
  }
];

function FAQList() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
          <HelpCircle className="h-5 w-5 text-blue-400" /> Frequently Asked Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {faqs.map((faq, idx) => (
            <li key={idx}>
              <div className="font-semibold text-blue-900 dark:text-blue-100">Q: {faq.question}</div>
              <div className="text-blue-700 dark:text-blue-200 ml-2">A: {faq.answer}</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    // Simulate API call
    setTimeout(() => {
      if (form.name && form.email && form.message) {
        setSuccess(true);
        setForm({ name: "", email: "", message: "" });
      } else {
        setError("All fields are required.");
      }
      setLoading(false);
    }, 1200);
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
          <HelpCircle className="h-5 w-5 text-blue-400" /> Contact Support
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <Input
            name="email"
            type="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <Textarea
            name="message"
            placeholder="How can we help you?"
            value={form.message}
            onChange={handleChange}
            disabled={loading}
            required
            rows={4}
          />
          {error && (
            <div className="flex items-center text-red-500 text-sm gap-2">
              <AlertTriangle className="h-4 w-4" /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center text-green-600 text-sm gap-2">
              <CheckCircle2 className="h-4 w-4" /> Message sent! We'll get back to you soon.
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
            Send Message
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function JobSeekerSupport() {
  return (
    <section className="p-2 sm:p-4 md:p-6 space-y-8">
      <FAQList />
      <ContactForm />
    </section>
  );
} 