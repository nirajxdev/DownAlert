import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    quote: "Pulse completely transformed how we monitor our microservices. The 1-minute check intervals and webhook integrations caught two silent failures before our users even noticed.",
    author: "Sarah Chen",
    role: "Lead DevOps Engineer",
    company: "DataFlow Analytics",
    initials: "SC",
    bgClass: "bg-[#10B981]/10 text-[#10B981]",
  },
  {
    id: 2,
    quote: "The interface is incredibly clean and focused. We migrated from a legacy uptime tracker, and Pulse gives us exactly what we need without the bloated enterprise UI.",
    author: "Marcus Johnson",
    role: "CTO",
    company: "Nexa Commerce",
    initials: "MJ",
    bgClass: "bg-[#3154FF]/10 text-[#3154FF]",
  },
  {
    id: 3,
    quote: "Setup took less than five minutes. The global node distribution ensures our API latency is accurate across all our key markets in Europe and APAC.",
    author: "Elena Rodriguez",
    role: "Senior Backend Developer",
    company: "FinTech Solutions",
    initials: "ER",
    bgClass: "bg-[#F59E0B]/10 text-[#F59E0B]",
  }
];

export default function Testimonials() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="py-24 bg-[#FFFFFF] border-y border-[#E5E5E5] relative overflow-hidden">
      {/* Background Decorative Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#3154FF]/[0.02] rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#111111] mb-6">
            Trusted by engineering teams.
          </h2>
          <p className="text-[#6B6B6B] text-lg leading-relaxed">
            See how developers are using Pulse to keep their infrastructure reliable and their users happy.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {testimonials.map((testimonial) => (
            <motion.div 
              key={testimonial.id}
              variants={itemVariants}
              className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-8 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md hover:border-[#3154FF]/20 transition-all duration-300"
            >
              <div>
                <Quote className="w-8 h-8 text-[#E5E5E5] mb-6" />
                <p className="text-[#111111] leading-relaxed mb-8 text-sm sm:text-base">
                  "{testimonial.quote}"
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${testimonial.bgClass}`}>
                  {testimonial.initials}
                </div>
                <div>
                  <div className="font-semibold text-[#111111] text-sm">{testimonial.author}</div>
                  <div className="text-xs text-[#6B6B6B]">{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
