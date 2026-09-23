import { afterEach, expect, test, vi } from "vitest"

import {
  firstPlaylistVideos,
  readYoutubePlaylist,
  type YoutubePlaylist,
} from "./youtube-playlist"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function feedResponse(body: string, ok = true, status = 200): Response {
  return {
    ok,
    status,
    text: async () => body,
  } as Response
}

function stubFetch(body: string, ok = true, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue(feedResponse(body, ok, status))
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

const SAMPLE_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"
      xmlns:media="http://search.yahoo.com/mrss/"
      xmlns="http://www.w3.org/2005/Atom">
  <title>Mental health &amp; wellness</title>
  <author>
    <name>Other Channel</name>
    <uri>https://www.youtube.com/channel/UCOTHER</uri>
  </author>
  <published>2020-01-01T00:00:00+00:00</published>
  <entry>
    <id>yt:video:aaa111</id>
    <yt:videoId>aaa111</yt:videoId>
    <title>First &lt;video&gt; &quot;one&quot; &apos;a&apos; &#38; &#x26;</title>
    <author><name>Speaker</name></author>
    <published>2024-03-01T00:00:00+00:00</published>
    <media:group>
      <media:title>Wrong media title one</media:title>
      <media:thumbnail url="https://i.ytimg.com/vi/aaa111/hqdefault.jpg" width="480" height="360"/>
      <media:description>Description one</media:description>
      <media:community>
        <media:starRating count="10" average="5" min="1" max="5"/>
        <media:statistics views="100"/>
      </media:community>
    </media:group>
  </entry>
  <entry>
    <id>yt:video:bbb222</id>
    <yt:videoId>bbb222</yt:videoId>
    <title>Second video</title>
    <published>2024-02-01T00:00:00+00:00</published>
    <media:group>
      <media:title>Wrong media title two</media:title>
      <media:thumbnail url="https://i.ytimg.com/vi/bbb222/hqdefault.jpg"/>
    </media:group>
  </entry>
  <entry>
    <yt:videoId>ccc333</yt:videoId>
    <title>Third video</title>
    <published>2024-01-01T00:00:00+00:00</published>
  </entry>
  <entry>
    <yt:videoId>ddd444</yt:videoId>
    <title>Fourth video</title>
    <published>2023-12-01T00:00:00+00:00</published>
  </entry>
  <entry>
    <yt:videoId>eee555</yt:videoId>
    <title>Fifth video</title>
    <published>2023-11-01T00:00:00+00:00</published>
  </entry>
</feed>`

test("readYoutubePlaylist requests the Atom feed with force-cache", async () => {
  const fetchMock = stubFetch(SAMPLE_FEED)
  await readYoutubePlaylist("PLWX7FFgYGzyU")
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith(
    "https://www.youtube.com/feeds/videos.xml?playlist_id=PLWX7FFgYGzyU",
    { cache: "force-cache" },
  )
})

test("parses series title and playlist URL; keeps feed order not published dates", async () => {
  stubFetch(SAMPLE_FEED)
  const series = await readYoutubePlaylist("PLWX7FFgYGzyU")
  expect(series.title).toBe("Mental health & wellness")
  expect(series.url).toBe(
    "https://www.youtube.com/playlist?list=PLWX7FFgYGzyU",
  )
  expect(series.videos.map((v) => v.id)).toEqual([
    "aaa111",
    "bbb222",
    "ccc333",
    "ddd444",
    "eee555",
  ])
})

test("uses entry title and yt:videoId; builds watch and mqdefault thumbnail URLs", async () => {
  stubFetch(SAMPLE_FEED)
  const series = await readYoutubePlaylist("PLWX7FFgYGzyU")
  expect(series.videos[0]).toEqual({
    id: "aaa111",
    title: `First <video> "one" 'a' & &`,
    url: "https://www.youtube.com/watch?v=aaa111",
    thumbnailUrl: "https://i.ytimg.com/vi/aaa111/mqdefault.jpg",
  })
  expect(series.videos[1]).toEqual({
    id: "bbb222",
    title: "Second video",
    url: "https://www.youtube.com/watch?v=bbb222",
    thumbnailUrl: "https://i.ytimg.com/vi/bbb222/mqdefault.jpg",
  })
})

test("result omits author, media fields, description, views, ratings, and dates", async () => {
  stubFetch(SAMPLE_FEED)
  const series = await readYoutubePlaylist("PLWX7FFgYGzyU")
  const serialized = JSON.stringify(series)
  expect(serialized).not.toContain("Other Channel")
  expect(serialized).not.toContain("Wrong media title")
  expect(serialized).not.toContain("hqdefault")
  expect(serialized).not.toContain("Description one")
  expect(serialized).not.toContain("Speaker")
  expect(serialized).not.toMatch(/2024-0[123]/)
  expect(serialized).not.toContain("views")
  expect(serialized).not.toContain("starRating")
  for (const video of series.videos) {
    expect(Object.keys(video).sort()).toEqual([
      "id",
      "thumbnailUrl",
      "title",
      "url",
    ])
  }
  expect(Object.keys(series).sort()).toEqual(["title", "url", "videos"])
})

test("firstPlaylistVideos returns at most n videos", () => {
  const series: YoutubePlaylist = {
    title: "Series",
    url: "https://www.youtube.com/playlist?list=PLX",
    videos: [
      {
        id: "1",
        title: "a",
        url: "https://www.youtube.com/watch?v=1",
        thumbnailUrl: "https://i.ytimg.com/vi/1/mqdefault.jpg",
      },
      {
        id: "2",
        title: "b",
        url: "https://www.youtube.com/watch?v=2",
        thumbnailUrl: "https://i.ytimg.com/vi/2/mqdefault.jpg",
      },
      {
        id: "3",
        title: "c",
        url: "https://www.youtube.com/watch?v=3",
        thumbnailUrl: "https://i.ytimg.com/vi/3/mqdefault.jpg",
      },
      {
        id: "4",
        title: "d",
        url: "https://www.youtube.com/watch?v=4",
        thumbnailUrl: "https://i.ytimg.com/vi/4/mqdefault.jpg",
      },
      {
        id: "5",
        title: "e",
        url: "https://www.youtube.com/watch?v=5",
        thumbnailUrl: "https://i.ytimg.com/vi/5/mqdefault.jpg",
      },
    ],
  }
  expect(firstPlaylistVideos(series, 4)).toHaveLength(4)
  expect(firstPlaylistVideos(series, 4).map((v) => v.id)).toEqual([
    "1",
    "2",
    "3",
    "4",
  ])
  expect(firstPlaylistVideos({ ...series, videos: series.videos.slice(0, 2) }, 4)).toHaveLength(
    2,
  )
})

test("throws when the response is not OK", async () => {
  stubFetch("not used", false, 404)
  await expect(readYoutubePlaylist("PLX")).rejects.toThrow()
})

test("throws when the body is not a feed", async () => {
  stubFetch("<html><title>Not a feed</title></html>")
  await expect(readYoutubePlaylist("PLX")).rejects.toThrow()
})

test("throws when the feed title is missing", async () => {
  stubFetch(`<feed>
    <entry><yt:videoId>aaa</yt:videoId><title>One</title></entry>
  </feed>`)
  await expect(readYoutubePlaylist("PLX")).rejects.toThrow()
})

test("throws when the feed title is blank", async () => {
  stubFetch(`<feed>
    <title>   </title>
    <entry><yt:videoId>aaa</yt:videoId><title>One</title></entry>
  </feed>`)
  await expect(readYoutubePlaylist("PLX")).rejects.toThrow()
})

test("throws when there are zero entries", async () => {
  stubFetch(`<feed><title>Empty series</title></feed>`)
  await expect(readYoutubePlaylist("PLX")).rejects.toThrow()
})

test("throws when an entry lacks yt:videoId", async () => {
  stubFetch(`<feed>
    <title>Series</title>
    <entry><title>One</title></entry>
  </feed>`)
  await expect(readYoutubePlaylist("PLX")).rejects.toThrow()
})

test("throws when an entry lacks a direct title", async () => {
  stubFetch(`<feed>
    <title>Series</title>
    <entry>
      <yt:videoId>aaa</yt:videoId>
      <media:group><media:title>Only media</media:title></media:group>
    </entry>
  </feed>`)
  await expect(readYoutubePlaylist("PLX")).rejects.toThrow()
})

test("a later bad entry fails the whole read", async () => {
  stubFetch(`<feed>
    <title>Series</title>
    <entry><yt:videoId>good</yt:videoId><title>Good</title></entry>
    <entry><yt:videoId>bad</yt:videoId></entry>
  </feed>`)
  await expect(readYoutubePlaylist("PLX")).rejects.toThrow()
})

test("does not use media:title when an entry title exists", async () => {
  stubFetch(`<feed>
    <title>Series</title>
    <entry>
      <yt:videoId>vid1</yt:videoId>
      <title>Entry title</title>
      <media:group><media:title>Media title</media:title></media:group>
    </entry>
  </feed>`)
  const series = await readYoutubePlaylist("PLX")
  expect(series.videos[0]?.title).toBe("Entry title")
})
