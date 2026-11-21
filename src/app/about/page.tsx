import type { Metadata } from "next";
import Link from "next/link";
import { LogoArtwork } from "@/components/brand/LogoArtwork";

export const metadata: Metadata = {
  title: "About | Temple of Toan",
  description:
    "Temple of Toan is a devout, condescending publication about guitar tone, gear obsession, and the money we cheerfully set on fire in pursuit of it.",
  alternates: {
    canonical: "/about",
  },
};

const body = "text-bone/80 text-base leading-relaxed sm:text-lg";

export default function AboutPage() {
  return (
    <main
      id="main-content"
      className="mx-auto flex max-w-2xl flex-1 flex-col gap-6 px-6 py-16 sm:px-10 sm:py-20"
    >
      <h1 className="font-heading text-bone text-4xl tracking-wide sm:text-5xl">
        About
      </h1>

      <LogoArtwork />

      <p className={body}>Sacrifice your wallet. Receive toan.</p>

      <p className={body}>
        Toan is tone, spelled the way the internet has chosen to spell it when
        discussing tone with the appropriate level of reverence. The origin of
        the spelling is murky. Nobody has produced a clean first appearance, and
        we will not pretend otherwise. What matters is that it stuck, because it
        names something real: the belief that the sound is in the object, and
        that the object can be acquired.
      </p>

      <p className={body}>
        The player, as the elders say, has the tone in their hands. We
        acknowledge this. We then close the browser tab and order a germanium
        transistor.
      </p>

      <h2 className="font-heading text-bone mt-6 text-3xl tracking-wide">
        The Canon
      </h2>

      <p className={body}>
        The archive is organized the way the liturgy demands. Sermons are the
        essays and the doctrine. Relics are the individual pedals, amps, and
        guitars, examined with the seriousness they have not earned. Rigs are
        the pedalboards and signal chains, along with the rituals that surround
        them. Disciples are the players and builders who have given themselves
        to the pursuit. Tech is the part where we explain what the part actually
        does, with the mojo removed. Collections group related pieces when a
        theme deserves its own shelf.
      </p>

      <p className={body}>
        This is not a review site, and it is not a marketplace. We will not tell
        you what to buy. We will tell you, gently, that you already own enough,
        and then we will explain why you are going to buy it anyway.
      </p>

      <h2 className="font-heading text-bone mt-6 text-3xl tracking-wide">
        Confess
      </h2>

      <p className={body}>
        If you have a relic, a rig, or a sermon of your own, you may{" "}
        <Link
          href="/submit"
          className="decoration-bone/30 underline underline-offset-2"
        >
          confess it here
        </Link>
        . Polished writing is not required. A clear photo and an honest account
        of what you spent will do. Submissions are reviewed privately, and
        accepted work may be edited for clarity and presentation.
      </p>

      <p className={body}>
        The Temple is independent, unaffiliated with any amp company, and
        entirely funded by the existing poor decisions of its congregation.
      </p>
    </main>
  );
}
