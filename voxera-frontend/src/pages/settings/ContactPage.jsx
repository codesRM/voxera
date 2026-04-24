import { useState } from 'react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm]   = useState({ subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending — wire up to a real email service later
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-100">Contact Us</h2>
        <p className="text-sm text-gray-500 mt-1">Have a question or issue? We're here to help.</p>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-200 mb-1">📧 Email</p>
          <p className="text-xs text-gray-400">support@voxera.app</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-200 mb-1">⏱ Response Time</p>
          <p className="text-xs text-gray-400">Usually within 24–48 hours</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Subject"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="What's this about?"
          required
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-300">
            Message <span className="text-orange-500">*</span>
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Describe your issue or question in detail..."
            rows={5}
            required
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-orange-500 transition resize-none"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={loading}>Send Message</Button>
        </div>
      </form>
    </div>
  );
}