'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Zap, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ConnectButton } from '../connect-button'



export function NavBar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: '/game', label: 'Game' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/social', label: 'Social' },
    { href: '/profile', label: 'Profile' },
  ]

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground hidden sm:block">4Pics1Word</h1>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm transition',
                  isActive(item.href)
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
          <ConnectButton/>

            {/* Mobile Menu */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-foreground hover:bg-card/80 p-2 rounded-lg transition"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block px-4 py-2 rounded-lg transition',
                  isActive(item.href)
                    ? 'bg-primary/20 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-card/80'
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <ConnectButton/>
          </div>
        )}
      </div>
    </nav>
  )
}
