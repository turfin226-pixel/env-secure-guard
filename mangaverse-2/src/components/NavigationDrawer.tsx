"use client";
import Link from 'next/link';
import { useUIStore } from '@/store/uiStore';

export default function NavigationDrawer() {
  const { isDrawerOpen, closeDrawer } = useUIStore();

  return (
    <>
      <div 
        className={`overlay ${isDrawerOpen ? 'active' : ''}`} 
        onClick={closeDrawer}
      ></div>
      <div className={`nav-drawer ${isDrawerOpen ? 'active' : ''}`} id="navDrawer">
        <Link href="/" onClick={closeDrawer}>🏠 Home</Link>
        <Link href="/" onClick={closeDrawer}>🔥 Popular</Link>
        <Link href="/" onClick={closeDrawer}>✨ New Releases</Link>
        <Link href="/upload" onClick={closeDrawer}>📤 Upload Manga</Link>
        <Link href="/bookmarks" onClick={closeDrawer}>🔖 Bookmarks</Link>
      </div>
    </>
  );
}
