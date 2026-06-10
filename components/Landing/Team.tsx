"use client";

import RemoteImage from "./RemoteImage";
import MotionWrapper from "./MotionWrapper";

const team = [
  { name: "Rajesh Shrestha", role: "CEO & Founder", avatar: "https://picsum.photos/seed/rajesh/200/200" },
  { name: "Priya Shrestha", role: "Marketing Director", avatar: "https://picsum.photos/seed/priya/200/200" },
  { name: "Arun Thapa", role: "Lead Developer", avatar: "https://picsum.photos/seed/arun/200/200" },
  { name: "Anita Sharma", role: "Product Manager", avatar: "https://picsum.photos/seed/anita/200/200" },
];

export default function Team() {
  return (
    <section className="bg-section-gray px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <MotionWrapper>
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">
            Our Teams
          </h2>
        </MotionWrapper>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, i) => (
            <MotionWrapper key={member.name} delay={i * 0.1}>
              <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <div className="relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-full">
                  <RemoteImage
                    src={member.avatar}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                <h3 className="font-bold text-foreground">{member.name}</h3>
                <p className="text-sm text-subtext">{member.role}</p>
              </div>
            </MotionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
