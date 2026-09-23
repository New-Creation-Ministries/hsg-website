import { pageNotes } from "@/content/home"

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="footer-name">{pageNotes.ministry}</p>
      <p className="footer-address">{pageNotes.address}</p>
    </footer>
  )
}
