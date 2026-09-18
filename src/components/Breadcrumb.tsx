import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 py-4">
      <Link to="/" className="hover:text-black transition-colors flex items-center gap-1">
        <Home size={14} />
        <span className="hidden sm:inline">Home</span>
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight size={14} />
          {item.href ? (
            <Link to={item.href} className="hover:text-black transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-black font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
