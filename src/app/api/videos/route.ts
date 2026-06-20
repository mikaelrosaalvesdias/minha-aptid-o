import { NextResponse } from "next/server";
import { youtubeSearchUrl } from "@/lib/recommendations";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

type YouTubeItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    channelTitle?: string;
    thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "curso gratuito carreira iniciante";
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      mode: "fallback",
      links: [{ title: `Buscar no YouTube: ${query}`, url: youtubeSearchUrl(query) }]
    });
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "6");
    url.searchParams.set("relevanceLanguage", "pt");
    url.searchParams.set("safeSearch", "moderate");
    url.searchParams.set("q", `${query} curso gratuito iniciante`);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url, { next: { revalidate: 60 * 60 * 6 } });
    if (!response.ok) {
      throw new Error(`YouTube API respondeu ${response.status}`);
    }
    const data = (await response.json()) as { items?: YouTubeItem[] };

    const videos = (data.items ?? [])
      .filter((item) => item.id?.videoId && item.snippet?.title)
      .map((item) => ({
        title: item.snippet?.title,
        channel: item.snippet?.channelTitle,
        thumbnail: item.snippet?.thumbnails?.medium?.url ?? item.snippet?.thumbnails?.default?.url,
        url: `https://www.youtube.com/watch?v=${item.id?.videoId}`
      }));

    return NextResponse.json({ mode: "api", videos });
  } catch (error) {
    await logError("Falha na integração com YouTube", { query, error: String(error) });
    return NextResponse.json({
      mode: "fallback",
      links: [{ title: `Buscar no YouTube: ${query}`, url: youtubeSearchUrl(query) }]
    });
  }
}
