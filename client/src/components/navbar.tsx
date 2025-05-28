import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Home, Plus, Menu, User } from "lucide-react";

interface NavbarProps {
  onCreateListing?: () => void;
}

export default function Navbar({ onCreateListing }: NavbarProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Browse", active: location === "/" },
    { href: "#", label: "Sell" },
    { href: "#", label: "Rent" },
    { href: "#", label: "About" },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center">
              <Home className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold text-neutral-900">PropertyHub</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors ${
                    item.active
                      ? "text-primary font-medium"
                      : "text-neutral-700 hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={onCreateListing}
              className="border-primary text-primary hover:bg-primary hover:text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              List Property
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateListing}
              className="border-primary text-primary"
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center mb-6">
                    <Home className="h-6 w-6 text-primary mr-2" />
                    <span className="text-xl font-bold text-neutral-900">PropertyHub</span>
                  </div>
                  
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-left px-4 py-2 rounded-lg transition-colors ${
                        item.active
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-neutral-700 hover:bg-neutral-100"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  <div className="border-t pt-4 mt-4">
                    <Button
                      variant="outline"
                      className="w-full mb-2"
                      onClick={() => {
                        onCreateListing?.();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      List Property
                    </Button>
                    <Button variant="ghost" className="w-full">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
