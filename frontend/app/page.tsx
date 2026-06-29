import Link from 'next/link';
import { ArrowDown, BookOpen, Feather, LibraryBig } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';
import HomeScrollReset from '@/components/HomeScrollReset';
import ScrollReveal from '@/components/ScrollReveal';
import { ngleParts } from '@/lib/ngle-chapters';

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#1d1813] text-[#2c2119]">
      <HomeScrollReset />
      {/* --- Hero: Chat --- */}
      <section className="relative min-h-[100svh] pb-8">
        <div className="saenredam-bg" />
        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1500px] flex-col px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-1 items-start py-1 lg:items-center lg:py-3">
            <div className="hero-enter hero-enter-chat w-full">
              <ChatInterface />
            </div>
          </div>

          <a
            href="#ngle"
            className="hero-enter hero-enter-cue mx-auto mt-4 inline-flex items-center gap-2 rounded-md border border-[#d8c7a7] bg-[#fff8e8]/80 px-4 py-2 text-sm font-medium text-[#4f3024] backdrop-blur-md transition hover:bg-[#f1ddb6]"
          >
            NGLE · 48 章语法全书
            <ArrowDown className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* --- NGLE Chapter Grid --- */}
      <section id="ngle" className="relative min-h-[100svh] overflow-hidden py-14 sm:py-20">
        <div className="saenredam-bg saenredam-bg-soft" />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-[#c7ad7c] bg-[#f4e5c4]/85 px-4 py-2 text-sm font-medium uppercase tracking-[0.22em] text-[#68402f]">
              <LibraryBig className="h-4 w-4" />
              RAE · ASALE
            </div>
            <h2 className="font-script max-w-full break-words pl-1 text-4xl leading-tight text-[#fff8e8] drop-shadow-[0_2px_12px_rgba(28,18,10,0.65)] sm:pl-0 sm:text-7xl sm:leading-none">
              Nueva gramática de la lengua española
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#fff3d8] drop-shadow-[0_2px_10px_rgba(28,18,10,0.55)]">
              西班牙皇家语言学院（RAE）与西语学院协会（ASALE）联合编撰。48 章，西班牙语原文 + 中文翻译。
            </p>
          </ScrollReveal>

          <div className="mt-12 space-y-12">
            {ngleParts.map((part) => (
              <ScrollReveal key={part.id}>
                <div className="mb-5 flex items-baseline gap-3">
                  <h3 className="font-script text-3xl text-[#fff8e8] drop-shadow-[0_2px_8px_rgba(28,18,10,0.5)]">
                    {part.titleEs}
                  </h3>
                  <span className="text-sm font-medium uppercase tracking-[0.15em] text-[#c9b58f]">
                    {part.titleZh}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {part.chapters.map((ch) => (
                    <Link
                      key={ch.number}
                      href={`/rae/gramatica/${ch.slug}`}
                      className="group rounded-md border border-[#d8c7a7] bg-[#fff8e8]/88 p-5 transition hover:-translate-y-0.5 hover:border-[#7a2f3a] hover:bg-[#fffaf0] hover:shadow-[0_12px_35px_rgba(18,13,9,0.16)]"
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f4e5c4] text-[11px] font-bold text-[#7a2f3a] group-hover:bg-[#7a2f3a] group-hover:text-white transition-colors">
                        {ch.number}
                      </span>
                      <h4 className="mt-3 text-sm font-semibold leading-snug text-[#2f241c] group-hover:text-[#7a2f3a] transition-colors">
                        {ch.titleEs}
                      </h4>
                      <p className="mt-1 text-xs leading-5 text-[#8a765e]">{ch.titleZh}</p>
                    </Link>
                  ))}
                </div>
              </ScrollReveal>
            ))}
          </div>

          <footer className="mt-20 border-t border-[#d8c7a7]/30 pt-6 text-center">
            <p className="text-xs text-[#8a765e]">
              Contenido basado en la Nueva gramática de la lengua española © RAE / ASALE
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
