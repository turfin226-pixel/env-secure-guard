"use client";
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';

export default function Header() {
  const toggleDrawer = useUIStore((state) => state.toggleDrawer);

  return (
    <header>
      <div className="header-content">
        <Link href="/" className="logo">
          MANGA<span>VERSE</span>
        </Link>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/">Popular</Link>
          <Link href="/upload">Upload</Link>
        </nav>
        <button className="menu-btn" onClick={toggleDrawer}>
          ☰
        </button>
      </div>
    </header>
  );
}
