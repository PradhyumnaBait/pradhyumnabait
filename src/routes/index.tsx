import { createFileRoute } from "@tanstack/react-router";
import { Nav, Hero, Toolkit, Manifesto, Work, Skills } from "@/components/portfolio/sections";
import { Ask } from "@/components/portfolio/AskOS";
import { Cursor, ScrollMeter, SoundToggle, StatusWidget } from "@/components/portfolio/fx";
import { Loader } from "@/components/portfolio/Loader";
import { JourneyMap } from "@/components/portfolio/JourneyMap";
import { NoteWall } from "@/components/portfolio/NoteWall";
import { Socials } from "@/components/portfolio/Socials";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pradhyumna Bait \u2014 AI/ML Engineer & Software Developer" },
      { name: "description", content: "Pradhyumna Bait builds AI systems, scalable backends and real-time pipelines \u2014 MOKSHA, MEDDESK, TRINETRA." },
      // Open Graph
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://pradhyumnabait.me" },
      { property: "og:site_name", content: "Pradhyumna Bait" },
      { property: "og:title", content: "Pradhyumna Bait \u2014 AI/ML Engineer" },
      { property: "og:description", content: "AI systems, scalable backends and real-time pipelines from Mumbai." },
      { property: "og:image", content: "https://pradhyumnabait.me/og-image.png" },
      // Twitter / X
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Pradhyumna Bait \u2014 AI/ML Engineer" },
      { name: "twitter:description", content: "AI systems, scalable backends and real-time pipelines from Mumbai." },
      { name: "twitter:image", content: "https://pradhyumnabait.me/og-image.png" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="md:cursor-none">
      <Loader />
      <Cursor />
      <ScrollMeter />
      <Nav />
      <Hero />
      <Toolkit />
      <Manifesto />
      <Work />
      <JourneyMap />
      <Skills />
      <Ask />
      <NoteWall />
      <Socials />
      <SoundToggle />
      <StatusWidget />
    </main>
  );
}
