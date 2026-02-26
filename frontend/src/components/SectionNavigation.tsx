import React from 'react';
import { Image, Clock, BookImage } from 'lucide-react';

export type SectionType = 'gallery' | 'albums' | 'library';

interface SectionNavigationProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
}

const sections: { id: SectionType; label: string; icon: React.ReactNode }[] = [
  { id: 'gallery', label: 'Photos', icon: <Image className="w-4 h-4" /> },
  { id: 'albums', label: 'Albums', icon: <BookImage className="w-4 h-4" /> },
  { id: 'library', label: 'Library', icon: <Clock className="w-4 h-4" /> },
];

export function SectionNavigation({ activeSection, onSectionChange }: SectionNavigationProps) {
  return (
    <nav className="bg-card border-b border-border sticky top-16 z-10">
      <div className="flex items-center px-4 max-w-7xl mx-auto">
        {sections.map(({ id, label, icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => onSectionChange(id)}
              className={`
                flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-all duration-150
                ${isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }
              `}
            >
              {icon}
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
