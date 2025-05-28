import { Mail, Phone, User } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-100 border-t border-neutral-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-neutral-600">
            <User className="h-4 w-4" />
            <span className="font-medium">제작자: KB국민은행 왕소희, 김근하</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-neutral-500">
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span>T. 0220737227</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span>M. 01049252905</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <span>kbbuddy2025@gmail.com</span>
            </div>
          </div>
          
          <div className="text-xs text-neutral-400 pt-4 border-t border-neutral-200">
            © 2025 KB국민은행 부동산 매물 플랫폼. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}