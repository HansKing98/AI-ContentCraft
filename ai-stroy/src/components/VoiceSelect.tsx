interface Props {
  voices: Array<{
    id: string;
    name: string;
    language: string;
    gender: string;
  }>;
  value: string;
  onChange: (value: string) => void;
}

export function VoiceSelect({ voices, value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
    >
      {voices.map(voice => (
        <option key={voice.id} value={voice.id}>
          {voice.name} ({voice.language}, {voice.gender})
        </option>
      ))}
    </select>
  );
} 