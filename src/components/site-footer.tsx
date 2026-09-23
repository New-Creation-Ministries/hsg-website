import { church, pageNotes } from "@/content/home"

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-identity">
        <p className="footer-name">{church.name}</p>
        <p className="footer-note">{pageNotes.footer}</p>
      </div>
    </footer>
  )
}
