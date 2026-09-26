import type { Metadata } from "next"

import { WatchSermonRow } from "@/components/watch-sermon-row"
import { WatchTestimonies } from "@/components/watch-testimonies"
import { playlistThemes, testimonies } from "@/content/watch"
import { readExternal } from "@/lib/external-read"
import {
  readYoutubeLiveBroadcast,
  YOUTUBE_LIVE_URL,
  type YoutubeLiveBroadcast,
} from "@/lib/youtube-live"
import {
  firstPlaylistVideos,
  readYoutubePlaylist,
  type YoutubeVideo,
} from "@/lib/youtube-playlist"

export const revalidate = 300

export const metadata: Metadata = { title: "Watch" }

type ThemeListing =
  | { status: "available"; videos: YoutubeVideo[] }
  | { status: "unavailable"; videos: [] }

function playlistUrl(playlistId: string): string {
  return `https://www.youtube.com/playlist?list=${playlistId}`
}

async function readThemeListing(playlistId: string): Promise<ThemeListing> {
  const result = await readExternal(
    {
      route: "/watch",
      dependency: "youtube-playlist",
      resource: playlistId,
    },
    async () => {
      const series = await readYoutubePlaylist(playlistId)
      return firstPlaylistVideos(series, 15)
    },
  )
  if (!result.ok) {
    return { status: "unavailable", videos: [] }
  }
  return { status: "available", videos: result.value }
}

function LiveStatus({ broadcast }: { broadcast: YoutubeLiveBroadcast | null }) {
  if (!broadcast) return null

  return (
    <section className="watch-live" aria-labelledby="watch-live-heading">
      <h2 id="watch-live-heading" className="watch-live-heading">
        Live
      </h2>
      <a href={YOUTUBE_LIVE_URL} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail URL, not next/image */}
        <img
          src={broadcast.thumbnailUrl}
          alt=""
          referrerPolicy="no-referrer"
          width={320}
          height={180}
        />
        <span>{`LIVE · ${broadcast.title}`}</span>
      </a>
    </section>
  )
}

export default async function Page() {
  const [liveResult, listings] = await Promise.all([
    readExternal(
      {
        route: "/watch",
        dependency: "youtube-live",
        resource: YOUTUBE_LIVE_URL,
      },
      () => readYoutubeLiveBroadcast(),
    ),
    Promise.all(
      playlistThemes.map(async (theme) => ({
        theme,
        listing: await readThemeListing(theme.playlistId),
      })),
    ),
  ])

  const broadcast = liveResult.ok ? liveResult.value : null

  return (
    <main id="main-content" className="watch-page page-width" tabIndex={-1}>
      <LiveStatus broadcast={broadcast} />
      <WatchTestimonies testimonies={testimonies} />
      <section className="watch-sermon-rows" aria-labelledby="watch-church-sermons">
        <h2 id="watch-church-sermons" className="watch-sermons-heading">
          Church Sermons
        </h2>
        {listings.map(({ theme, listing }) => (
          <WatchSermonRow
            key={theme.playlistId}
            name={theme.name}
            playlistId={theme.playlistId}
            playlistUrl={playlistUrl(theme.playlistId)}
            videos={listing.videos}
            available={listing.status === "available"}
          />
        ))}
      </section>
    </main>
  )
}
