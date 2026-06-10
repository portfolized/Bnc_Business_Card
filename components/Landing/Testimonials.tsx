"use client";

import RemoteImage from "./RemoteImage";
import { Star, Quote } from "lucide-react";
import MotionWrapper from "./MotionWrapper";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Priya Shrestha",
    role: "Marketing Director, Kathmandu",
    rating: 5,
    text: "BNC Business Card has completely changed how I network. One tap and my entire contact is shared — it's like magic.",
    avatar: "https://picsum.photos/seed/priya-t/80/80",
  },
  {
    name: "सुमन श्रेष्ठ",
    role: "उद्यमी, काठमाडौं",
    rating: 5,
    text: "BNC कार्डले मेरो व्यापार नेटवर्किंगलाई एकदम सहज बनाइदियो। एक ट्यापमा सबै जानकारी साझा गर्न सकिन्छ — यो साँच्चै क्रान्तिकारी छ!",
    avatar: "https://picsum.photos/seed/suman-np/80/80",
    isNepali: true,
  },
  {
    name: "Rajesh Shrestha",
    role: "CEO, TechStart Nepal",
    rating: 5,
    text: "BNC Business Card transformed how we network at tech events. The analytics feature shows exactly who engaged with my card.",
    avatar: "https://picsum.photos/seed/rajesh-t/80/80",
  },
  {
    name: "Arun Thapa",
    role: "Event Organizer, Pokhara",
    rating: 5,
    text: "Managing contacts at events is now effortless. Guests tap, get my details, done. No more running out of paper cards.",
    avatar: "https://picsum.photos/seed/arun-t/80/80",
  },
  {
    name: "Anita Sharma",
    role: "Product Manager, Lalitpur",
    rating: 5,
    text: "The profile editor is incredibly intuitive. I update my details from my phone and all my cards instantly reflect the change.",
    avatar: "https://picsum.photos/seed/anita-t/80/80",
  },
  {
    name: "बिनोद पौडेल",
    role: "Sales Head, भरतपुर",
    rating: 5,
    text: "NFC कार्डले मेरो बिक्री टिमलाई धेरै मद्दत गर्‍यो। ग्राहकसँग सम्पर्क राख्न अब कुनै कागजको जरुरत छैन।",
    avatar: "https://picsum.photos/seed/binod-np/80/80",
    isNepali: true,
  },
  {
    name: "Sameer Kumar",
    role: "Startup Founder, Bhaktapur",
    rating: 5,
    text: "As a startup founder, networking is everything. BNC makes every handshake count — people remember you because the experience is so slick.",
    avatar: "https://picsum.photos/seed/sameer/80/80",
  },
  {
    name: "Vikram Patel",
    role: "Tech Consultant, Kathmandu",
    rating: 5,
    text: "I've tried several digital business card solutions. BNC is the only one that has the full package: great hardware, smart software, and Nepal-local support.",
    avatar: "https://picsum.photos/seed/vikram/80/80",
  },
];

const row1 = testimonials.slice(0, 4);
const row2 = testimonials.slice(4);

function TestimonialCard({ item }: { item: (typeof testimonials)[0] }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      className="w-72 shrink-0 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.04] transition-shadow hover:shadow-md md:w-80"
    >
      <Quote className="mb-3 h-4 w-4 text-primary/30" />
      <p className={`mb-4 text-sm leading-relaxed text-subtext ${item.isNepali ? "font-medium" : ""}`}>
        {item.text}
      </p>
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
          <RemoteImage src={item.avatar} alt={item.name} fill className="object-cover" sizes="40px" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-foreground">{item.name}</p>
          <p className="truncate text-xs text-subtext">{item.role}</p>
        </div>
        <div className="flex shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < item.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function MarqueeRow({
  items,
  direction,
  speed,
}: {
  items: typeof row1;
  direction: "left" | "right";
  speed: number;
}) {
  const doubled = [...items, ...items];
  const animStyle =
    direction === "left"
      ? { animation: `scroll-left ${speed}s linear infinite` }
      : { animation: `scroll-right ${speed}s linear infinite` };

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-white to-transparent" />
      <div
        className="flex w-max gap-4"
        style={animStyle}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.animationPlayState = "running";
        }}
      >
        {doubled.map((item, i) => (
          <TestimonialCard key={`${item.name}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonial" className="overflow-hidden bg-white px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <MotionWrapper>
          <div className="mb-4 text-center">
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary">
              Real Voices
            </span>
            <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              Loved by Professionals Across Nepal
            </h2>
            <p className="text-subtext">
              नेपालभरका व्यावसायिकहरूले BNC कार्डको बारेमा के भन्छन् — what they say
            </p>
          </div>
        </MotionWrapper>

        <MotionWrapper delay={0.1}>
          <div className="mb-4 flex items-center justify-center gap-6 pb-2">
            <div className="flex -space-x-2">
              {testimonials.slice(0, 5).map((t) => (
                <div
                  key={t.name}
                  className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-white"
                >
                  <RemoteImage src={t.avatar} alt={t.name} fill className="object-cover" sizes="32px" />
                </div>
              ))}
            </div>
            <div className="text-sm text-subtext">
              <span className="font-bold text-foreground">4.9 / 5</span> from 200+ reviews
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        </MotionWrapper>
      </div>

      <div className="space-y-4 mt-4">
        <MarqueeRow items={row1} direction="left" speed={50} />
        <MarqueeRow items={row2} direction="right" speed={55} />
      </div>
    </section>
  );
}
