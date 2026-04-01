import { getMangaById, incrementViews } from "@/actions/manga";
import Reader from "@/components/Reader";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MangaReaderPage({ params }: { params: { id: string } }) {
  const manga = await getMangaById(params.id);

  if (!manga) {
    notFound();
  }

  // Increment views on load
  await incrementViews(params.id);

  return (
    <main>
      <Reader manga={manga} />
    </main>
  );
}
