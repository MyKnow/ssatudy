"use client";


interface Option {
  value: string;
  label: string;
}

interface SegmentButtonGroupProps {
  options: Option[];
  selected: string;
  onSelect: (value: string) => void;
  label: string;
}

export default function SegmentButtonGroup({ options, selected, onSelect, label }: SegmentButtonGroupProps) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-sm font-semibold text-textPrimary font-pretendard">{label}</div>
      <div className="flex gap-3">
        {options.map((opt) => (
          <div
          key={opt.value}
          className="flex-1 h-12 rounded-2xl overflow-hidden font-pretendard"
        >
          <button
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`w-full h-full font-semibold text-base segment-button ${selected === opt.value ? "selected" : ""}`}
          >
            {opt.label}
          </button>
        </div>
            
        ))}
      </div>
    </div>
  );
}