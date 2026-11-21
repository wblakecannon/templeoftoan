import Image from "next/image";
import logo from "../../../public/images/brand/temple-of-toan-logo.png";

export function LogoArtwork({ priority }: { priority?: boolean }) {
  return (
    <Image
      src={logo}
      alt="Temple of Toan logo: a pillared temple topped with a pentagram, with the tagline Sacrifice your wallet. Receive toan."
      sizes="(min-width: 1024px) 900px, 100vw"
      priority={priority}
      className="mx-auto h-auto w-full max-w-3xl"
    />
  );
}
