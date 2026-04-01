"use client";

import { useEffect, useState } from "react";
import MangaCard from "@/components/MangaCard";
import { getMangasByIds } from "@/actions/manga";

export default function BookmarksList() {
  const [bookmarkedMangas, setBookmarkedMangas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const ids = JSON.parse(localStorage.getItem("bookmarks") || "[]");
      if (ids.length > 0) {
        const mangas = await getMangasByIds(ids);
        setBookmarkedMangas(mangas);
      }
      setLoading(false);
    };
    fetchBookmarks();
  }, []);

  if (loading) return <div className="text-center mt-20">Loading bookmarks...</div>;

  return (
    <main>
      <div className="section-header">
        <h2 className="section-title">BOOKMARKS</h2>
        <div className="section-line"></div>
      </div>
      
      {bookmarkedMangas.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🔖</div>
          <h3>No Bookmarks Yet</h3>
          <p>Save your favorite manga to read later!</p>
        </div>
      ) : (
        <div className="manga-grid">
          {bookmarkedMangas.map((manga) => (
             <MangaCard 
               key={manga.id} 
               id={manga.id} 
               title={manga.title} 
               author={manga.author} 
               views={manga.views} 
               cover={manga.cover} 
             />
          ))}
        </div>
      )}
    </main>
  );
}
