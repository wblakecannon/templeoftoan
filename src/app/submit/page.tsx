import type { Metadata } from "next";
import Link from "next/link";
import { SubmissionForm } from "@/components/submission/SubmissionForm";

export const metadata: Metadata = {
  title: "Confess | Temple of Toan",
  description:
    "Confess a relic, rig, disciple, or sermon to Temple of Toan. Every submission is reviewed privately before anything is published.",
  alternates: { canonical: "/submit" },
};

export default function SubmitPage() {
  return (
    <main
      id="main-content"
      className="mx-auto flex max-w-2xl flex-1 flex-col gap-8 px-6 py-16 sm:px-10 sm:py-20"
    >
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-bone text-3xl tracking-wide sm:text-5xl">
          Confess
        </h1>
        <p className="text-bone/80 text-base leading-relaxed sm:text-lg">
          Got a relic, a rig, a disciple, or a sermon? Polished writing
          isn&rsquo;t required. Good photos and an honest account of the money
          spent matter more.
        </p>
        <p className="text-bone/60 text-sm">
          Submitting doesn&rsquo;t guarantee publication. Every submission is
          reviewed privately, and accepted work may be edited for clarity and
          presentation before it goes live. See the{" "}
          <Link
            href="/privacy"
            className="decoration-bone/30 underline underline-offset-2"
          >
            privacy page
          </Link>{" "}
          for how submissions are stored and reviewed.
        </p>
        <p className="text-bone/60 text-sm">
          <strong className="text-bone font-medium">
            Rather skip the form?
          </strong>{" "}
          It&rsquo;s the easier path for me to track everything, but that
          doesn&rsquo;t mean it has to be yours. Email{" "}
          <a
            href="mailto:hello@templeoftoan.com"
            className="decoration-bone/30 underline underline-offset-2"
          >
            hello@templeoftoan.com
          </a>{" "}
          and I&rsquo;ll take it from there.
        </p>
      </div>

      <SubmissionForm />
    </main>
  );
}
