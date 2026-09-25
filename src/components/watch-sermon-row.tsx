import type { YoutubeVideo } from "@/lib/youtube-playlist"

export function WatchSermonRow({
  name,
  playlistId,
  playlistUrl,
  videos,
  available,
}: {
  name: string
  playlistId: string
  playlistUrl: string
  videos: readonly YoutubeVideo[]
  available: boolean
}) {
  return (
    <section className="watch-sermon-row" aria-labelledby={`watch-row-${playlistId}`}>
      <div className="watch-sermon-row-head">
        <h3 id={`watch-row-${playlistId}`} className="watch-sermon-row-title">
          <a href={playlistUrl} target="_blank" rel="noopener noreferrer">
            {name}
          </a>
        </h3>
      </div>
      {available && videos.length > 0 ? (
        <ul className="watch-sermon-scroller">
          {videos.map((video) => (
            <li key={video.id}>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={video.title}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail URL, not next/image */}
                <img
                  src={video.thumbnailUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  width={320}
                  height={180}
                />
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="watch-sermon-empty">
          Videos are temporarily unavailable here.{" "}
          <a href={playlistUrl} target="_blank" rel="noopener noreferrer">
            Open the playlist on YouTube
          </a>
          .
        </p>
      )}
    </section>
  )
}
