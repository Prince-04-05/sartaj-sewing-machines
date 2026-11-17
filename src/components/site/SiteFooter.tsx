import { Link } from "@tanstack/react-router";
import { Clock, Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { Logo } from "./Logo";
import { WhatsAppIcon } from "./FloatingActions";
import { useSettings } from "@/hooks/use-settings";
import { directionsLink, formatPhone, mailtoLink, telLink, whatsappLink } from "@/lib/site";

export function SiteFooter() {
  const { contact } = useSettings();
  const socials = [
    { href: contact.instagram, label: "Instagram", Icon: Instagram },
    { href: contact.facebook, label: "Facebook", Icon: Facebook },
    { href: contact.youtube, label: "YouTube", Icon: Youtube },
  ].filter((s) => s.href);

  return (
    <footer className="grain relative overflow-hidden bg-gradient-ink text-ink-foreground">
      <div className="stitch-line opacity-60" />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 md:grid-cols-3 md:px-6 md:py-16 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:gap-12">
        <div className="col-span-2 md:col-span-3 lg:col-span-1">
          <Logo tone="light" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-foreground/70">
            Premium sewing machines, motors, spare parts and expert repair in Hariana, Punjab. Visit our showroom — we'll help you pick the right machine.
          </p>
          <div className="mt-6 flex gap-2">
            <a
              href={whatsappLink(contact.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="grid h-10 w-10 place-items-center rounded-full border border-gold/30 text-gold transition-colors hover:bg-gold hover:text-gold-foreground"
            >
              <WhatsAppIcon className="h-4 w-4" />
            </a>
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-gold/30 text-gold transition-colors hover:bg-gold hover:text-gold-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="eyebrow text-gold">Explore</h3>
          <ul className="mt-5 space-y-3 text-sm text-ink-foreground/80">
            <li><Link to="/products" className="hover:text-gold">All Products</Link></li>
            <li><Link to="/gallery" className="hover:text-gold">Gallery</Link></li>
            <li><Link to="/services" className="hover:text-gold">Repair & Service</Link></li>
            <li><Link to="/about" className="hover:text-gold">About SARTAJ</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact & Location</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow text-gold">Popular</h3>
          <ul className="mt-5 space-y-3 text-sm text-ink-foreground/80">
            <li><Link to="/products" search={{ category: "industrial-sewing-machines" }} className="hover:text-gold">Industrial Machines</Link></li>
            <li><Link to="/products" search={{ category: "domestic-sewing-machines" }} className="hover:text-gold">Domestic Machines</Link></li>
            <li><Link to="/products" search={{ category: "servo-motors" }} className="hover:text-gold">Servo Motors</Link></li>
            <li><Link to="/products" search={{ category: "spare-parts" }} className="hover:text-gold">Spare Parts</Link></li>
            <li><Link to="/enquire" className="hover:text-gold">Send an Enquiry</Link></li>
          </ul>
        </div>
        <div className="col-span-2 md:col-span-1">
          <h3 className="eyebrow text-gold">Visit the shop</h3>
          <ul className="mt-5 space-y-4 text-sm text-ink-foreground/80">
            <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a href={directionsLink(contact)} target="_blank" rel="noopener noreferrer" className="hover:text-gold">{contact.address}</a>
            </li>
            <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a href={telLink(contact.phone)} className="hover:text-gold">{formatPhone(contact.phone)}</a>
            </li>
            <li className="flex gap-3"><WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a href={whatsappLink(contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-gold">{formatPhone(contact.whatsapp)}</a>
            </li>
            <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a href={mailtoLink(contact.email)} className="break-all hover:text-gold">{contact.email}</a>
            </li>
            <li className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{contact.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-center text-xs leading-relaxed text-ink-foreground/50 md:flex-row md:px-6 md:text-left">
          <p>© {new Date().getFullYear()} SARTAJ Sewing Machines, Hariana. All rights reserved.</p>
          <p>Purchases are made in person at our shop — enquire online, visit us to buy.</p>
        </div>
      </div>
    </footer>
  );
}
