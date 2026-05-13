import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-primary/20 text-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-serif text-2xl font-bold tracking-tight text-primary">
                நூலோர்
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A dignified space for Tamil literature. Connecting writers,
              readers, and publications in a quiet, purposeful environment.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-sm tracking-wider uppercase mb-4 text-foreground/80">
              Explore
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/books"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Books
                </Link>
              </li>
              <li>
                <Link
                  href="/authors"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Authors
                </Link>
              </li>
              <li>
                <Link
                  href="/publications"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Publications
                </Link>
              </li>
              <li>
                <Link
                  href="/blogs"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Essays & Blogs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm tracking-wider uppercase mb-4 text-foreground/80">
              Community
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/groups"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Groups
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/guidelines"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm tracking-wider uppercase mb-4 text-foreground/80">
              Connect
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Noolor. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
