import {
  MessageCircle,
  Send,
  Camera,
  Play,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' },
      { name: 'Press', href: '/press' },
    ],
    Support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Returns', href: '/returns' },
      { name: 'Shipping', href: '/shipping' },
      { name: 'FAQ', href: '/faq' },
    ],
    Legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
    ],
  };

  const socialIcons = [
    { Icon: MessageCircle, href: 'https://facebook.com' },
    { Icon: Send, href: 'https://twitter.com' },
    { Icon: Camera, href: 'https://instagram.com' },
    { Icon: Play, href: 'https://youtube.com' },
  ];

  return (
    <footer className="bg-footer text-footer-muted">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Contact */}
          <div>
            <h2 className="mb-4 text-2xl font-black text-on-footer">
              A to Z<span className="text-accent-600">Kids</span>
            </h2>
            <p className="mb-5 max-w-xs text-sm leading-relaxed text-footer-muted">
              A bright little corner for curious minds, creative play, and everyday discoveries.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary-400 shrink-0" />
                <span className="text-footer-muted">123 Learning Lane, NY 10001</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary-400 shrink-0" />
                <span className="text-footer-muted">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary-400 shrink-0" />
                <span className="text-footer-muted">hello@atozkids.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-on-footer font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.Company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-footer-muted transition-colors duration-200 hover:text-accent-600"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-on-footer font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.Support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-footer-muted hover:text-primary-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-on-footer font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.Legal.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-footer-muted hover:text-primary-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter & Social */}
        <div className="border-t border-footer-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-footer-muted text-sm">Follow us:</span>
            <div className="flex gap-3">
              {socialIcons.map(({ Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                    className="rounded-full bg-footer-border p-2 transition-colors duration-200 hover:bg-primary-600 hover:text-on-footer"
                    aria-label={`Visit us on ${href.split('.')[1]}`}
                >
                  <Icon className="h-4 w-4 text-footer-muted hover:text-on-footer transition-colors" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex w-full md:w-auto">
            <input
              type="email"
              placeholder="Subscribe to newsletter"
              className="flex-1 rounded-l-xl border border-footer-border bg-footer px-4 py-2 text-on-footer outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500 placeholder:text-footer-muted md:w-64"
            />
            <button type="button" className="rounded-r-xl bg-primary-600 px-4 py-2 font-bold text-on-footer transition-colors duration-200 hover:bg-primary-700">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-footer-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-footer-muted">
            <p>
              &copy; {currentYear} A to Z Kids World. All rights reserved.
            </p>
            <div className="flex gap-6 mt-2 sm:mt-0">
              <a href="/privacy" className="hover:text-primary-400 transition-colors">
                Privacy
              </a>
              <a href="/terms" className="hover:text-primary-400 transition-colors">
                Terms
              </a>
              <a href="/sitemap" className="hover:text-primary-400 transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;