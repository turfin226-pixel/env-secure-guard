"use client";

import { useState } from "react";
import { addComment } from "@/actions/manga";
import { useUIStore } from "@/store/uiStore";

interface ReaderProps {
  manga: any;
}

export default function Reader({ manga }: ReaderProps) {
  const showToast = useUIStore((state) => state.showToast);
  const [currentPage, setCurrentPage] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(manga.comments);
  
  // Basic local storage bookmarking for unauth users
  const isBookmarked = typeof window !== "undefined" && localStorage.getItem("bookmarks")?.includes(manga.id);

  const toggleBookmark = () => {
    let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    if (bookmarks.includes(manga.id)) {
      bookmarks = bookmarks.filter((id: string) => id !== manga.id);
      showToast("Removed from bookmarks");
    } else {
      bookmarks.push(manga.id);
      showToast("Added to bookmarks! 🔖");
    }
    localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
  };

  const next = () => {
    if (currentPage < manga.pages.length - 1) {
      setCurrentPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prev = () => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    await addComment(manga.id, "You", commentText);
    setComments([{ author: "You", text: commentText, timestamp: new Date() }, ...comments]);
    setCommentText("");
    showToast("Comment posted! 💬");
  };

  const currentImg = manga.pages[currentPage]?.url;

  return (
    <div className="reader-wrapper">
      <div className="reader-header">
        <h2 className="reader-title">{manga.title} - Page {currentPage + 1}/{manga.pages.length}</h2>
      </div>

      <div className="reader-content">
        <div className="manga-page">
          <img src={currentImg} alt={`Page ${currentPage + 1}`} />
          <span className="page-number">{currentPage + 1}</span>
        </div>
      </div>

      <div className="reader-controls">
        <button className="reader-btn" onClick={prev} disabled={currentPage === 0}>← Previous</button>
        <button className="reader-btn" onClick={toggleBookmark} style={{ background: isBookmarked ? 'var(--accent-yellow)' : 'var(--accent-red)', color: isBookmarked ? 'var(--manga-black)' : 'white' }}>
          {isBookmarked ? '🔖 Saved' : '🔖 Bookmark'}
        </button>
        <button className="reader-btn" onClick={next} disabled={currentPage === manga.pages.length - 1}>Next →</button>
      </div>

      <div className="comments-section">
        <h3 className="comments-title">COMMENTS 💬</h3>
        <div id="commentsList">
          {comments.map((comment: any, i: number) => (
            <div key={i} className="comment">
              <div className="comment-author">💬 {comment.author}</div>
              <div className="comment-text">{comment.text}</div>
            </div>
          ))}
        </div>
        <div className="comment-input">
          <input 
            type="text" 
            value={commentText} 
            onChange={(e) => setCommentText(e.target.value)} 
            placeholder="Add a comment..." 
          />
          <button onClick={handleComment}>Post</button>
        </div>
      </div>
    </div>
  );
}
