import Link from 'next/link';

interface MangaProps {
  id: string;
  title: string;
  author: string;
  views: number;
  cover: string;
  isNew?: boolean;
}

export default function MangaCard({ id, title, author, views, cover, isNew = false }: MangaProps) {
  const isHot = views > 10;
  
  return (
    <Link href={`/${id}`} className="manga-card block">
      <div className="manga-cover">
        <img src={cover} alt={title} loading="lazy" />
        {isNew && <span className="manga-badge new">NEW</span>}
        {(!isNew && isHot) && <span className="manga-badge hot">HOT</span>}
      </div>
      <div className="manga-info">
        <h3 className="manga-title">{title}</h3>
        <div className="manga-meta">
          <div className="manga-author">👤 {author}</div>
          <div className="manga-stats">
            <div className="stat-item">👁 {views >= 1000 ? (views / 1000).toFixed(1) + 'K' : views}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}
