'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function MainNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const categories = [
    { id: 'A', name: 'Bekleidung', icon: '👕' },
    { id: 'B', name: 'Taschen', icon: '👜' },
    { id: 'C', name: 'Wohnen', icon: '🏠' },
    { id: 'D', name: 'Geschenke', icon: '🎁' },
    { id: 'E', name: 'Tassen', icon: '☕' },
    { id: 'F', name: 'Caps', icon: '🧢' },
    { id: 'G', name: 'Teller', icon: '🍽️' },
    { id: 'H', name: 'Stifte', icon: '✒️' },
    { id: 'I', name: 'Schuhe', icon: '👟' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              ON ME <span className="text-[#d4af37]">HONEY B</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium ${pathname === '/' ? 'text-[#d4af37]' : 'text-gray-700 hover:text-[#d4af37]'} transition-colors`}
            >
              Home
            </Link>

            <div className="relative group">
              <Link
                href="/categories"
                className={`text-sm font-medium ${pathname.startsWith('/categories') ? 'text-[#d4af37]' : 'text-gray-700 hover:text-[#d4af37]'} transition-colors flex items-center`}
              >
                Kategorien
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>

              {/* Dropdown Menu */}
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.id}`}
                      className="flex items-center px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl mr-3">{cat.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/cart"
              className={`text-sm font-medium ${pathname === '/cart' ? 'text-[#d4af37]' : 'text-gray-700 hover:text-[#d4af37]'} transition-colors`}
            >
              Warenkorb
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <Link
              href="/"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/categories"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Alle Kategorien
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg ml-4"
                onClick={() => setIsOpen(false)}
              >
                {cat.icon} {cat.name}
              </Link>
            ))}
            <Link
              href="/cart"
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Warenkorb
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
