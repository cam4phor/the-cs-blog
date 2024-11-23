// components/Layout.tsx
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Layout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="bg-background-primary text-text-primary">
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <header className="fixed top-0 left-0 w-full bg-background-primary text-text-primary shadow-md dark:shadow-glow z-10">
          <div className="container mx-auto px-20 flex justify-between items-center">
            <nav className="container px-3 py-2 flex justify-between items-center">
              {/* Logo */}
              <div className="font-bold">
                <Link href="/" className="font-custom text-3xl tracking-extra-wide">
                  THE-CS-BLOG
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="space-x-6">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow pt-20">{children}</main>

        {/* Footer */}
        <footer className="bg-background-secondary text-text-primary shadow-md">
          <div className="text-center">
            <p>© {new Date().getFullYear()} THE-CS-BLOG</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
