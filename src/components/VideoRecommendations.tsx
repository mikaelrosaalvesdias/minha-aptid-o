"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, PlayCircle } from "lucide-react";
import { youtubeSearchUrl } from "@/lib/recommendations";

type Video = {
  title: string;
  channel?: string;
  thumbnail?: string;
  url: string;
};

type ResponseData =
  | { mode: "api"; videos: Video[] }
  | { mode: "fallback"; links: { title: string; url: string }[] };

export function VideoRecommendations({ keywords }: { keywords: string[] }) {
  const [items, setItems] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const query = keywords[0] ?? "curso gratuito carreira iniciante";
    fetch(`/api/videos?q=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch(() =>
        setItems({
          mode: "fallback",
          links: [{ title: `Buscar no YouTube: ${query}`, url: youtubeSearchUrl(query) }]
        })
      )
      .finally(() => setLoading(false));
  }, [keywords]);

  if (loading) {
    return (
      <div className="inline-loading">
        <Loader2 className="spin" size={18} /> Buscando vídeos recomendados...
      </div>
    );
  }

  if (!items) return null;

  if (items.mode === "api") {
    return (
      <div className="video-grid">
        {items.videos.map((video) => (
          <a className="video-card card" href={video.url} target="_blank" rel="noreferrer" key={video.url}>
            {video.thumbnail ? <img src={video.thumbnail} alt="" /> : <PlayCircle size={34} />}
            <div>
              <h3>{video.title}</h3>
              {video.channel && <p>{video.channel}</p>}
            </div>
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="search-links">
      {keywords.slice(0, 6).map((keyword) => (
        <a href={youtubeSearchUrl(keyword)} target="_blank" rel="noreferrer" className="button secondary" key={keyword}>
          <PlayCircle size={17} /> {keyword}
        </a>
      ))}
      {items.links.map((link) => (
        <a href={link.url} target="_blank" rel="noreferrer" className="button secondary" key={link.url}>
          <ExternalLink size={17} /> {link.title}
        </a>
      ))}
    </div>
  );
}
