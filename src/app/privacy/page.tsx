import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy | Temple of Toan",
  description: "How Temple of Toan handles information from submissions.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main
      id="main-content"
      className="mx-auto flex max-w-2xl flex-1 flex-col gap-6 px-6 py-16 sm:px-10 sm:py-20"
    >
      <h1 className="font-heading text-bone text-3xl tracking-wide sm:text-4xl">
        Privacy
      </h1>

      <p className="text-bone/80 text-base leading-relaxed sm:text-lg">
        This is a small, independent publication run by one person and a pile of
        single speeds. No ad network, no marketing funnel, no data broker on
        speed dial. We do use privacy-conscious analytics to see which pages get
        read, but more on that below. Here&rsquo;s what actually happens when
        you submit something through{" "}
        <a
          href="/submit"
          className="decoration-bone/30 underline underline-offset-2"
        >
          /submit
        </a>
        .
      </p>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-bone text-lg tracking-wide">
          What we collect
        </h2>
        <p className="text-bone/80 text-base leading-relaxed">
          Your name, email address, and optionally a website or social link,
          plus whatever you write in the story field and any photos you attach.
          If you mention a gear manufacturer, model, settings, or location, we
          collect that too. It&rsquo;s all optional except your name, email, and
          story.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-bone text-lg tracking-wide">
          Why we collect it
        </h2>
        <p className="text-bone/80 text-base leading-relaxed">
          Solely to review your submission and, if it&rsquo;s a fit, to prepare
          and publish a piece based on it. Your email is used to follow up about
          your submission, and nothing else.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-bone text-lg tracking-wide">
          Where it&rsquo;s stored
        </h2>
        <p className="text-bone/80 text-base leading-relaxed">
          Photos are stored privately (not publicly listed or linked) until and
          unless a piece based on them is published. The written submission and
          your contact details become a private issue in a repository only the
          site owner can see. Neither is publicly accessible before publication.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-bone text-lg tracking-wide">
          How it&rsquo;s reviewed
        </h2>
        <p className="text-bone/80 text-base leading-relaxed">
          Every submission is reviewed by hand. Nothing publishes automatically.
          Submitting does not guarantee publication, and accepted work may be
          edited for clarity and presentation before it goes live. You&rsquo;ll
          typically hear back either way.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-bone text-lg tracking-wide">
          Retention and deletion
        </h2>
        <p className="text-bone/80 text-base leading-relaxed">
          If a submission is declined or goes unused, the associated photos and
          written record are deleted rather than kept indefinitely. If
          you&rsquo;d like your submission deleted sooner (accepted or not),
          email us using the address in your confirmation and we&rsquo;ll remove
          it.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-bone text-lg tracking-wide">
          Analytics
        </h2>
        <p className="text-bone/80 text-base leading-relaxed">
          The live site uses Google Analytics to count visits and understand
          which pages people actually read, so we know what&rsquo;s worth making
          more of. It collects standard usage data (pages viewed, approximate
          location, and device and browser type) using Google&rsquo;s cookies.
          We don&rsquo;t use it for advertising, and we don&rsquo;t use it to
          identify you personally. It doesn&rsquo;t run on the development site,
          and it plays no part in reviewing submissions.
        </p>
        <p className="text-bone/80 text-base leading-relaxed">
          Alongside page views, we record a few aggregate interaction events:
          which articles get read to the end, when someone starts or finishes a
          submission, and clicks that lead off to other sites. It&rsquo;s all
          counted in aggregate, still with no advertising and no way to identify
          you.
        </p>
        <p className="text-bone/80 text-base leading-relaxed">
          If you&rsquo;d rather not be counted, you can opt out in your browser.
          Open the developer console and run{" "}
          <code className="text-sm">
            localStorage.setItem(&quot;toan_analytics_opt_out&quot;,
            &quot;1&quot;)
          </code>
          , and this browser will stop sending analytics on the live site.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-bone text-lg tracking-wide">
          What we don&rsquo;t do
        </h2>
        <p className="text-bone/80 text-base leading-relaxed">
          We don&rsquo;t publish your email address. We don&rsquo;t add you to a
          mailing list, because there isn&rsquo;t one. We don&rsquo;t sell or
          share your information with third parties. And we don&rsquo;t run
          advertising or cross-site tracking. No funny business. The tone is
          between you and your amp.
        </p>
      </section>
    </main>
  );
}
