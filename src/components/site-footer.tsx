import { church, pageNotes } from "@/content/home"

const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/people/Evangelist-Rambabu-Rambo/100044133264301/",
    path: "M15 8h-2a1 1 0 0 0-1 1v2H9v3h3v7h3v-7h2.2l.8-3H15V9a1 1 0 0 1 1-1h2V5h-3a3 3 0 0 0-3 3v0z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/holyspiritgeneration777/",
    path: "M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5zm8 2H8a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3zm-4 3.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 2A1.8 1.8 0 1 0 13.8 12 1.8 1.8 0 0 0 12 10.2zM17.4 6.6a1 1 0 1 1-1 1 1 1 0 0 1 1-1z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/c/EvangelistRambabuRambo",
    path: "M22 12.2s0-3.2-.4-4.6a3 3 0 0 0-2.1-2.1C17.9 5 12 5 12 5s-5.9 0-7.5.5a3 3 0 0 0-2.1 2.1C2 9 2 12.2 2 12.2s0 3.2.4 4.6a3 3 0 0 0 2.1 2.1C6.1 19.4 12 19.4 12 19.4s5.9 0 7.5-.5a3 3 0 0 0 2.1-2.1c.4-1.4.4-4.6.4-4.6zM10 15.5v-6.6l6 3.3z",
  },
] as const

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="footer-name">{pageNotes.ministry}</p>
      <ul className="footer-social">
        {socials.map((item) => (
          <li key={item.label}>
            <a href={item.href} aria-label={item.label} target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d={item.path} fill="currentColor" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
      <div className="footer-place">
        <p className="footer-church">{church.name}</p>
        <p className="footer-address">{pageNotes.address}</p>
      </div>
    </footer>
  )
}
