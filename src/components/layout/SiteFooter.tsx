import { SocialLinks } from "./SocialLinks";

export function SiteFooter() {
  return (
    <footer className="border-bone/10 border-t py-8 text-center">
      <p className="text-bone/60 text-sm">
        Temple of Toan • Sacrifice your wallet. Receive toan.
      </p>
      <p className="text-bone/60 text-sm">
        Not affiliated with any deity, amp company, or your bank
      </p>
      <p className="text-bone/60 text-sm">
        This site uses{" "}
        <a
          href="/privacy"
          className="decoration-bone/30 underline underline-offset-2"
        >
          cookies
        </a>{" "}
        • Your tone does not.
      </p>
      <SocialLinks className="mt-4 justify-center" />
    </footer>
  );
}
