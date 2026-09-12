import { Link } from "react-router";
import { MessageCircle, Send, Camera, Play, Mail, Phone, MapPin } from "lucide-react";
import { storeData } from "../data/store";

const socialIcons = {
  Facebook: MessageCircle,
  Twitter: Send,
  Instagram: Camera,
  YouTube: Play,
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { brand, tagline, contact, footerColumns, socials, legal } = storeData;

  return (
    <footer className="bg-footer text-footer-muted">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="mb-4 text-2xl font-black text-on-footer">
              {brand.primary}
              <span className="text-accent-600">{brand.highlight}</span>
            </h2>
            <p className="mb-5 max-w-xs text-sm leading-relaxed text-footer-muted">
              {tagline}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-primary-400" />
                <span className="text-footer-muted">{contact.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-primary-400" />
                <span className="text-footer-muted">{contact.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-primary-400" />
                <span className="text-footer-muted">{contact.email}</span>
              </div>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-4 font-semibold text-on-footer">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-footer-muted transition-colors duration-200 hover:text-accent-600"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-footer-border pt-8 md:flex-row">
          <div className="flex items-center gap-4">
            <span className="text-sm text-footer-muted">Follow us:</span>
            <div className="flex gap-3">
              {socials.map((social) => {
                const Icon = socialIcons[social.name] ?? MessageCircle;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-footer-border p-2 transition-colors duration-200 hover:bg-primary-600 hover:text-on-footer"
                    aria-label={`Visit us on ${social.name}`}
                  >
                    <Icon className="h-4 w-4 text-footer-muted transition-colors hover:text-on-footer" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-footer-border">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between text-sm text-footer-muted sm:flex-row">
            <p>
              &copy; {currentYear} {legal.copyright}
            </p>
            <div className="mt-2 flex gap-6 sm:mt-0">
              {legal.bottomLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="transition-colors hover:text-primary-400"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;