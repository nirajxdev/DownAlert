# **DownAlert** - Know When Your Project Goes Down

![Status](https://img.shields.io/badge/Status-MVP-orange)
![License](https://img.shields.io/badge/License-MIT-green)
![Uptime Monitoring](https://img.shields.io/badge/Uptime-Monitoring-blue)
![Email Alerts](https://img.shields.io/badge/Alerts-Email-red)
![Solo Developers](https://img.shields.io/badge/Built%20For-Solo%20Developers-black)
![Open Source](https://img.shields.io/badge/Open%20Source-Yes-blue)
![Developer Tool](https://img.shields.io/badge/Category-Developer%20Tool-orange)


DownAlert is a developer-focused uptime monitoring product designed for solo builders, indie hackers, and individual developers who deploy and maintain their own SaaS applications, APIs, and side projects.

The product is built around one principle: **you should know immediately when something breaks without having to manage an enterprise-grade monitoring platform.**

> A simple, reliable uptime monitor built specifically for solo developers.

---

## Why Use DownAlert?

- **Built for Solo Developers**  - Designed specifically for solo builders, indie hackers, and small teams.
- **Know When Something Breaks**  - Get notified when your website, API, or application goes down instead of discovering it from users.
- **Simple & Easy to Set Up**  - Add your endpoint, configure monitoring, and let DevPulse handle the checks.
- **Instant Direct Alerts**  - Receive downtime and recovery notifications through channels like Discord and email.
- **Track Uptime**  - Monitor the availability and reliability of your applications over time.
- **No Enterprise Feature Bloat**  - Get the monitoring features you actually need without complex incident-management or team workflows.
- **Affordable as You Grow**  - Start with a genuinely useful free tier and upgrade only when you need advanced capabilities.

> **Your users shouldn't be the ones telling you your application is down. DownAlert should.**

---


## Features (MVP)

- Add a website URL and monitor it automatically  
- Checks run at a regular interval, no manual pinging  
- Clear UP/DOWN status on a clean dashboard — no charts to interpret  
- Plain-language email alerts the moment status changes  
- Simple check history per monitor

---

## Tech stack

| Layer | Tech |
| :---- | :---- |
| Frontend | Next.js \+ Tailwind CSS |
| Backend | Node.js \+ Express |
| Scheduler | node-cron |
| Database | PostgreSQL (Supabase / Neon) |
| Auth | Supabase Auth / Clerk |
| Email alerts | Resend |
| Payments | Stripe / Razorpay |
| Hosting | Vercel (frontend \+ backend), Railway / Render (worker, if split out) |

---

## Future Expansion

Once the core monitoring engine and alerting workflow are validated, DownAlert can expand while maintaining its simplicity-first philosophy.

Potential future capabilities include:

- More notification integrations
- Advanced uptime analytics
- Custom public status pages
- Longer historical data retention
- Faster monitoring intervals
- Additional monitoring types

---

## Built By

DownAlert is built by:

### Nitin Yadav

**Founder / ML-focused Developer**

- GitHub: [github.com/nitinyadav2188](https://github.com/nitinyadav2188)
- LinkedIn: [linkedin.com/in//nitin-yadav-681850299](https://www.linkedin.com/in/nitin-yadav-681850299/)

### Niraj

**Co-Founder / Backend Developer**

- GitHub: [github.com/nirajxdev](https://github.com/nirajxdev)
- LinkedIn: [linkedin.com/in/niraj-singh-kushwaha-ba4b88297](https://www.linkedin.com/in/niraj-singh-kushwaha-ba4b88297)

---

## License

Copyright (c) 2026 | Nitin and Niraj
