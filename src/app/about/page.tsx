import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | DevMultiplier Academy",
  description:
    "Learn about DevMultiplier Academy and our mission to help developers multiply their impact with AI-assisted development practices.",
};

export default function AboutPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <h1 className="text-4xl font-bold tracking-tight text-navy sm:text-5xl">
            About DevMultiplier Academy
          </h1>

          {/* Mission */}
          <div className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-blue">
              Our Mission
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate">
              We believe the best developers aren't just faster coders—they're
              better architects, better communicators, and better at leveraging
              the right tools. DevMultiplier Academy exists to help experienced
              developers multiply their impact by mastering modern architecture
              patterns and AI-assisted development practices.
            </p>
          </div>

          {/* Why */}
          <div className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-blue">
              Why We Exist
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate">
              The gap between developers who ship production systems and those
              who struggle isn't talent—it's knowledge. Specifically, knowledge
              of how to design systems that scale, how to optimize for
              performance, and how to leverage AI tools effectively.
            </p>
            <p className="mt-4 text-lg leading-8 text-slate">
              Our courses are designed for CTOs, senior developers, and
              independent consultants who need practical, actionable knowledge
              they can apply immediately to real projects.
            </p>
          </div>

          {/* Approach */}
          <div className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-blue">
              Our Approach
            </h2>
            <ul className="mt-4 space-y-4 text-lg leading-8 text-slate">
              <li className="flex items-start">
                <span className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue" />
                <span>
                  <strong className="text-navy">Production-focused:</strong>{" "}
                  Every concept is taught with real-world application in mind.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue" />
                <span>
                  <strong className="text-navy">AI-integrated:</strong> Learn to
                  leverage AI tools as force multipliers, not replacements.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue" />
                <span>
                  <strong className="text-navy">Expert-led:</strong> Courses
                  created by developers who've shipped at scale.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue" />
                <span>
                  <strong className="text-navy">Continuously updated:</strong>{" "}
                  Content evolves with the rapidly changing AI landscape.
                </span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="mt-12 rounded-2xl bg-off-white p-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-blue">
              The Company
            </h2>
            <p className="mt-4 text-slate">
              DevMultiplier Academy is a 3D HD Soft, LLC company. We're based in
              Florida and focused on developer education for the AI age.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
