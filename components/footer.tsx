"use client"

import * as React from "react"
import Link from "next/link"
import {
  Phone,
  MapPin,
  Clock,
  Mail,
  Scissors,
} from "lucide-react"

import { InstagramIcon, FacebookIcon, XIcon } from "@/components/social-icons"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
]

const socialLinks = [
  { href: "https://instagram.com", label: "Instagram", Icon: InstagramIcon },
  { href: "https://facebook.com", label: "Facebook", Icon: FacebookIcon },
  { href: "https://x.com", label: "X (Twitter)", Icon: XIcon },
]

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Scissors className="size-5 text-primary" />
              <span className="font-heading text-2xl font-thin tracking-tight">
                SalonBook
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your one-stop salon booking platform. Book appointments, browse
              services, and manage your profile with ease.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="size-6 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                >
                  <link.Icon className="size-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-thin tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-thin tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <Phone className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  +880 1700 000000
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  contact@salonbook.com
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-thin tracking-wider mb-4">
              Location & Hours
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  123 Salon Street, Dhaka, Bangladesh
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  Mon - Sat: 9:00 AM - 8:00 PM
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="size-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  Sunday: 10:00 AM - 6:00 PM
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <p>
              © {new Date().getFullYear()} SalonBook. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="/privacy-policy">Privacy Policy</Link>
              <Link href="/terms-of-service">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
