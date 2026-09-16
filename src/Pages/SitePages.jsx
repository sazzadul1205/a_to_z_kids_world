import { useState } from "react";
import { ArrowRight, CheckCircle2, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { Link } from "react-router";
import { whatsappUrl } from "../lib/whatsapp";
import { pagesData } from "../data/pages";

const PageShell = ({ eyebrow, title, intro, children }) => (
  <div className="bg-surface-soft px-4 py-12 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-bold uppercase tracking-widest text-primary-600">{eyebrow}</p>
      <h1 className="mt-2 text-4xl font-black text-text sm:text-5xl">{title}</h1>
      {intro && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-muted">{intro}</p>}
      <div className="mt-10">{children}</div>
    </div>
  </div>
);

const statTones = {
  primary: { card: "bg-primary-100", value: "text-primary-700" },
  accent: { card: "bg-accent-100", value: "text-accent-1100" },
  secondary: { card: "bg-secondary-100", value: "text-secondary-1000" },
};

export const About = () => {
  const about = pagesData.about;
  return (
    <PageShell eyebrow={about.eyebrow} title={about.title} intro={about.intro}>
      <div className="grid gap-6 md:grid-cols-3">
        {about.stats.map((stat) => {
          const tone = statTones[stat.tone] ?? statTones.primary;
          return (
            <div key={stat.label} className={`rounded-3xl p-6 ${tone.card}`}>
              <p className={`text-4xl font-black ${tone.value}`}>{stat.value}</p>
              <p className="mt-2 font-bold text-text">{stat.label}</p>
              <p className="mt-2 text-sm text-text-muted">{stat.note}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-8 grid gap-8 rounded-3xl border border-border bg-surface p-6 sm:p-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-black text-text">{about.feature.title}</h2>
          <p className="mt-3 leading-relaxed text-text-muted">{about.feature.body}</p>
        </div>
        <div className="space-y-4 text-sm font-semibold text-text">
          {about.feature.points.map((point) => (
            <div key={point} className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-600" /> {point}
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};

const contactIcons = {
  messageCircle: MessageCircle,
  mail: Mail,
  phone: Phone,
  mapPin: MapPin,
};

export const Contact = () => {
  const contact = pagesData.contact;
  const [sent, setSent] = useState(false);

  const channels = [
    { icon: "messageCircle", label: "Chat with us on WhatsApp" },
    { icon: "mail", label: "hello@atozkids.com" },
    { icon: "phone", label: "+1 (555) 123-4567" },
    { icon: "mapPin", label: "123 Learning Lane, NY 10001" },
  ];

  return (
    <PageShell eyebrow={contact.eyebrow} title={contact.title} intro={contact.intro}>
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl bg-secondary-900 p-6 text-white sm:p-8">
          <h2 className="text-2xl font-black">{contact.panelTitle}</h2>
          <p className="mt-3 text-sm leading-relaxed text-secondary-100">{contact.panelNote}</p>
          <div className="mt-8 space-y-5 text-sm">
            {channels.map((channel) => {
              const Icon = contactIcons[channel.icon];
              return (
                <div key={channel.label} className="flex gap-3">
                  <Icon className="h-5 w-5 shrink-0 text-accent-600" />
                  <span>{channel.label}</span>
                </div>
              );
            })}
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent-600 px-5 py-3 font-bold text-text hover:bg-accent-700"
          >
            {contact.ctaLabel} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          {sent ? (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-14 w-14 text-primary-600" />
              <h2 className="mt-5 text-2xl font-black text-text">
                {contact.form.successTitle}
              </h2>
              <p className="mt-2 text-text-muted">{contact.form.successMessage}</p>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSent(true);
              }}
              className="space-y-5"
            >
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-text">{contact.form.nameLabel}</span>
                <input required type="text" className="w-full rounded-xl border border-border bg-surface-soft px-4 py-3 text-text outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-text">{contact.form.emailLabel}</span>
                <input required type="email" className="w-full rounded-xl border border-border bg-surface-soft px-4 py-3 text-text outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-text">{contact.form.messageLabel}</span>
                <textarea required rows="5" className="w-full resize-y rounded-xl border border-border bg-surface-soft px-4 py-3 text-text outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
              </label>
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-bold text-white hover:bg-primary-700">
                {contact.form.submitLabel} <Send className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  );
};

const PolicySection = ({ title, children }) => (
  <section className="border-b border-border py-6 last:border-0">
    <h2 className="text-xl font-black text-text">{title}</h2>
    <div className="mt-3 space-y-3 leading-relaxed text-text-muted">{children}</div>
  </section>
);

export const Privacy = () => {
  const data = pagesData.privacy;
  return (
    <PageShell eyebrow={data.eyebrow} title={data.title} intro={data.intro}>
      <div className="rounded-3xl border border-border bg-surface px-6 sm:px-8">
        {data.sections.map((section) => (
          <PolicySection key={section.title} title={section.title}>
            <p>{section.body}</p>
          </PolicySection>
        ))}
      </div>
    </PageShell>
  );
};

export const Terms = () => {
  const data = pagesData.terms;
  return (
    <PageShell eyebrow={data.eyebrow} title={data.title} intro={data.intro}>
      <div className="rounded-3xl border border-border bg-surface px-6 sm:px-8">
        {data.sections.map((section) => (
          <PolicySection key={section.title} title={section.title}>
            <p>{section.body}</p>
          </PolicySection>
        ))}
      </div>
    </PageShell>
  );
};

export const Sitemap = () => {
  const data = pagesData.sitemap;
  return (
    <PageShell eyebrow={data.eyebrow} title={data.title} intro={data.intro}>
      <div className="grid gap-4 sm:grid-cols-2">
        {data.links.map((link, index) => (
          <Link
            key={link.name}
            to={link.href}
            className="group rounded-2xl border border-border bg-surface p-5 font-bold text-text transition hover:-translate-y-1 hover:border-primary-300"
          >
            <span className="text-primary-600">{String(index + 1).padStart(2, "0")}</span>
            <span className="ml-3">{link.name}</span>
            <ArrowRight className="float-right h-5 w-5 text-text-muted transition group-hover:text-primary-600" />
          </Link>
        ))}
      </div>
    </PageShell>
  );
};