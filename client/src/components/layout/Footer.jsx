import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="font-display font-bold text-xl">rentify</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              India's most trusted rental platform for students, working professionals and families. Find verified PGs, flats and rooms near you.
            </p>
            <div className="flex gap-3 mt-6">
              {['App Store', 'Google Play'].map((store) => (
                <button key={store} className="px-4 py-2 rounded-xl bg-white/10 text-xs text-white/70 hover:bg-white/15 transition-colors">
                  {store}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/80">Explore</h4>
            <ul className="space-y-3">
              {[
                ['Search Properties', '/search'],
                ['PG / Hostel', '/search?type=pg'],
                ['Flats', '/search?type=flat'],
                ['Rooms', '/search?type=room'],
                ['AI Advisor', '/ai-advisor'],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-white/50 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/80">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Blog', 'Careers', 'Press', 'Contact', 'Privacy Policy', 'Terms of Use'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-white/50 hover:text-white cursor-pointer transition-colors">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">© {new Date().getFullYear()} rentify Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1 text-xs text-white/30">
            <span>Made with</span>
            <span className="text-accent">♥</span>
            <span>in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}