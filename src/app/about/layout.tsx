import { AboutSnap } from "@/components/about-snap"

export default function AboutLayout({ children }: LayoutProps<"/about">) {
  return (
    <div className="about-page">
      <AboutSnap />
      {children}
    </div>
  )
}
