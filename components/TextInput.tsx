import { ChangeEvent } from 'react';

interface TextInputProps {
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'url' | 'email';
  multiline?: boolean;
  required?: boolean;
}

export default function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline = false,
  required = false,
}: TextInputProps) {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onChange(e.target.value);
  };

  const baseClasses =
    'w-full bg-slate-800 border-2 border-slate-700 rounded-lg px-4 py-3 md:py-4 text-white text-base md:text-lg placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all';

  if (multiline) {
    return (
      <textarea
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        rows={5}
        className={`${baseClasses} resize-none`}
      />
    );
  }

  return (
    <input
      type={type}
      value={value || ''}
      onChange={handleChange}
      placeholder={placeholder}
      required={required}
      className={baseClasses}
    />
  );
}
