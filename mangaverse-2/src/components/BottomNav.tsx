"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      <Link href="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
        <span className="icon">🏠</span>
        <span>Home</span>
      </Link>
      <Link href="/" className={`bottom-nav-item`}>
        <span className="icon">🔥</span>
        <span>Popular</span>
      </Link>
      <Link href="/upload" className={`bottom-nav-item ${pathname === '/upload' ? 'active' : ''}`}>
        <span className="icon">📤</span>
        <span>Upload</span>
      </Link>
      <Link href="/bookmarks" className={`bottom-nav-item ${pathname === '/bookmarks' ? 'active' : ''}`}>
        <span className="icon">🔖</span>
        <span>Saved</span>
      </Link>
    </nav>
  );
}
