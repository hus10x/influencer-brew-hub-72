import { Facebook, Instagram, Twitter, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const navigation = {
  main: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Contact", href: "#" },
  ],
  login: [
    { name: "Business", href: "/login" },
    { name: "Influencer", href: "/login" },
  ],
  legal: [
    { name: "Privacy", href: "#" },
    { name: "Terms", href: "#" },
  ],
};

const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-sans text-2xl font-bold tracking-tight text-primary">
                hikayat
              </span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Connecting food influencers with restaurants for authentic collaborations.
            </p>
            <div className="flex space-x-6">
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </Link>
              <Link to="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </Link>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Company</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.main.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">Login</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.login.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Legal</h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <Link to={item.href} className="text-sm text-muted-foreground hover:text-foreground">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t pt-8">
          <p className="text-xs leading-5 text-muted-foreground">
            &copy; 2024 Hikayat. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;