import MangaCard from '@/components/MangaCard';
import { getMangas } from '@/actions/manga';
import Link from 'next/link';

export const dynamic = "force-dynamic";

export default async function Home() {
  const popularMangas = await getMangas("popular");
  const newMangas = await getMangas("new");

  return (
    <main>
      <section className="hero" id="heroSection">
        <div className="hero-text">
          <h1>READ & CREATE MANGA!</h1>
          <p>Upload your manga and share with millions. Read thousands of stories from creators worldwide. All saved locally on your device!</p>
          <Link href="/upload" className="btn btn-primary no-underline text-center">Start Creating</Link>
          <div className="hero-stats">
            <div className="stat">
              <div className="stat-number">{popularMangas.length > 0 ? newMangas.length : 0}</div>
              <div className="stat-label">Manga</div>
            </div>
            <div className="stat">
              <div className="stat-number">
                {popularMangas.reduce((acc, m) => acc + m.views, 0)}
              </div>
              <div className="stat-label">Views</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Section */}
      <div className="section-header">
        <h2 className="section-title">POPULAR</h2>
        <div className="section-line"></div>
      </div>
      <div className="manga-grid mb-[40px]">
        {popularMangas.length === 0 ? (
          <div className="empty-state col-span-full">
            <div className="icon">📚</div>
            <h3>No Manga Yet</h3>
            <p>Be the first to upload!</p>
          </div>
        ) : (
          popularMangas.map((manga) => (
            <MangaCard 
              key={manga.id} 
              id={manga.id} 
              title={manga.title} 
              author={manga.author} 
              views={manga.views} 
              cover={manga.cover} 
              isNew={false}
            />
          ))
        )}
      </div>

      {/* New Section */}
      <div className="section-header">
        <h2 className="section-title">NEW</h2>
        <div className="section-line"></div>
      </div>
      <div className="manga-grid">
        {newMangas.length === 0 ? (
          <div className="empty-state col-span-full">
            <div className="icon">📚</div>
            <h3>No Manga Yet</h3>
            <p>Be the first to upload!</p>
          </div>
        ) : (
          newMangas.map((manga) => (
            <MangaCard 
              key={manga.id} 
              id={manga.id} 
              title={manga.title} 
              author={manga.author} 
              views={manga.views} 
              cover={manga.cover} 
              isNew={true}
            />
          ))
        )}
      </div>
    </main>
  );
}
