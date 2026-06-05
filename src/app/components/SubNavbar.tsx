interface SubNavbarItem {
  label: string;
  value: string;
}

interface SubNavbarProps {
  items: SubNavbarItem[];
  activeValue: string;
  onSelect: (value: string) => void;
  title?: string;
}

export function SubNavbar({ items, activeValue, onSelect, title }: SubNavbarProps) {
  return (
    <div className="mb-4 rounded-2xl border border-[#e2e8f0] bg-[#ffffff] p-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {title && <span className="px-3 text-sm font-medium text-[#64748b]">{title}</span>}
        {items.map((item) => {
          const isActive = activeValue === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onSelect(item.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#2563eb] text-[#ffffff] shadow-sm'
                  : 'bg-[#eff6ff] text-[#1d4ed8] hover:bg-[#dbeafe] hover:text-[#1e40af]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
