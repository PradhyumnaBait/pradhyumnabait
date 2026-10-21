import { createFileRoute } from "@tanstack/react-router";
import { Nav, Hero, Toolkit, Manifesto, Work, Skills, Ask } from "@/components/portfolio/sections";
import { Cursor, ScrollMeter, SoundToggle, StatusWidget } from "@/components/portfolio/fx";
import { Loader } from "@/components/portfolio/Loader";
import { JourneyMap } from "@/components/portfolio/JourneyMap";
import { NoteWall } from "@/components/portfolio/NoteWall";
import { Socials } from "@/components/portfolio/Socials";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pradhyumna Bait — AI/ML Engineer & Software Developer" },
      { name: "description", content: "Pradhyumna Bait builds AI systems, scalable backends and real-time pipelines — MOKSHA, MEDDESK, TRINETRA." },
      { property: "og:title", content: "Pradhyumna Bait — AI/ML Engineer" },
      { property: "og:description", content: "AI systems, scalable backends and real-time pipelines from Mumbai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
      <Skills />
      <Ask />
      <JourneyMap />
      <NoteWall />
      <Socials />
      <SoundToggle />
      <StatusWidget />
    </main>
  );
}
