import { ChangeEvent } from 'react';

interface ContactFormData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

interface ContactFormProps {
  data: ContactFormData;
  onChange: (field: keyof ContactFormData, value: string) => void;
}

export default function ContactForm({ data, onChange }: ContactFormProps) {
  const handleChange = (field: keyof ContactFormData) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    onChange(field, e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="block text-sm text-slate-400 mb-2">
            First Name *
          </label>
          <input
            id="first_name"
            type="text"
            value={data.first_name || ''}
            onChange={handleChange('first_name')}
            required
            className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm text-slate-400 mb-2">
            Last Name *
          </label>
          <input
            id="last_name"
            type="text"
            value={data.last_name || ''}
            onChange={handleChange('last_name')}
            required
            className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm text-slate-400 mb-2">
          Email *
        </label>
        <input
          id="email"
          type="email"
          value={data.email || ''}
          onChange={handleChange('email')}
          required
          className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm text-slate-400 mb-2">
          Phone Number *
        </label>
        <input
          id="phone"
          type="tel"
          value={data.phone || ''}
          onChange={handleChange('phone')}
          required
          className="w-full bg-slate-800 border-2 border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
        <p className="text-xs text-slate-500 mt-2">
          I&apos;ll reach out via WhatsApp to schedule our call
        </p>
      </div>
    </div>
  );
}
