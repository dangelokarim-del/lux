"use client";

import { motion } from "framer-motion";
import { Inbox, CalendarCheck, MessagesSquare, BarChart3 } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

/* card-specific mini visuals — monochrome + a single champagne touch */
function RequestsVisual() {
  return (
    <div className="space-y-2">
      {[1, 0.8, 0.6].map((w, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-[#A9854A]" : "bg-[#d8d3c7]"}`} />
          <span className="h-2 rounded-full bg-[#e9e5db]" style={{ width: `${w * 100}%` }} />
        </div>
      ))}
    </div>
  );
}

function ReservationsVisual() {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className={`h-3 rounded-[3px] ${i === 4 || i === 9 ? "bg-[#A9854A]" : "bg-[#e9e5db]"}`}
        />
      ))}
    </div>
  );
}

function CommunicationVisual() {
  return (
    <div className="flex items-center">
      {["bg-[#e9e5db]", "bg-[#ded8cb]", "bg-[#d3ccba]", "bg-[#A9854A]"].map((c, i) => (
        <span
          key={i}
          className={`h-8 w-8 rounded-full border-2 border-white ${c}`}
          style={{ marginLeft: i === 0 ? 0 : -10 }}
        />
      ))}
    </div>
  );
}

function AnalyticsVisual() {
  const bars = [0.4, 0.6, 0.5, 0.75, 1];
  return (
    <div className="flex h-12 items-end gap-2">
      {bars.map((h, i) => (
        <span
          key={i}
          className={`w-4 rounded-[3px] ${i === bars.length - 1 ? "bg-[#A9854A]" : "bg-[#e3ded2]"}`}
          style={{ height: `${h * 100}%` }}
        />
      ))}
    </div>
  );
}

const cards = [
  { icon: Inbox, title: "Guest Requests", desc: "Automated & organized", visual: <RequestsVisual /> },
  { icon: CalendarCheck, title: "Reservations", desc: "Real-time management", visual: <ReservationsVisual /> },
  { icon: MessagesSquare, title: "Communication", desc: "All channels in one place", visual: <CommunicationVisual /> },
  { icon: BarChart3, title: "Analytics", desc: "Live insights", visual: <AnalyticsVisual /> },
];

export function Features() {
  return (
    <section id="features" className="px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-balance text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-[#0E0E0F]">
            Every detail.
            <br className="hidden sm:block" /> Perfectly orchestrated.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-balance text-[17px] leading-relaxed text-[#57565C]">
            From villas to yachts, restaurants to experiences, LUXA coordinates everything
            so your team can focus on what truly matters: your guests.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease }}
                className="group flex flex-col rounded-[28px] border border-[#ECE8DF] bg-white p-7 shadow-[0_30px_60px_-45px_rgba(40,30,10,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_40px_70px_-40px_rgba(40,30,10,0.45)] sm:p-9"
              >
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F3ECDD] text-[#0E0E0F]">
                  <Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-[#0E0E0F]">
                  {c.title}
                </h3>
                <p className="mt-1.5 text-[15px] text-[#6b6a70]">{c.desc}</p>
                <div className="mt-8 flex-1" />
                <div className="rounded-2xl border border-[#F0ECE3] bg-[#FBFAF7] p-5">{c.visual}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
