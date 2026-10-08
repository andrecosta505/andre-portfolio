'use client';
import { ScrollProvider } from '@/lib/scroll';
import Hero from './hero/Hero';
import Navigation from './Navigation';
import About from './sections/About';
import Achievements from './sections/Achievements';
import CaseStudy from './sections/CaseStudy';
import Contact, { Footer } from './sections/Contact';
import Experience from './sections/Experience';
import Learning from './sections/Learning';
import Skills from './sections/Skills';
import Work from './sections/Work';
import RevealObserver from './ui/RevealObserver';

// Hero, About, Skills, Work, Always learning, the loomwest.com case study, Experience, Achievements, Contact: one
// continuous surface (round 5, 2026-10-07: web design only)
export default function App() {
  return (
    <ScrollProvider>
      <a href="#main" className="sr-only skip">
        Skip to content
      </a>
      <Navigation />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Work />
        <Learning />
        <CaseStudy />
        <Experience />
        <Achievements />
        <Contact />
      </main>
      <Footer />
      <RevealObserver />
    </ScrollProvider>
  );
}
