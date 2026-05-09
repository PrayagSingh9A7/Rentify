import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="font-display text-9xl font-bold text-surface-tertiary mb-4">404</p>
        <h1 className="font-display text-3xl font-bold text-text-primary mb-3">Page not found</h1>
        <p className="text-text-muted text-sm mb-8 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary">Go Home</Link>
          <Link to="/search" className="btn-secondary">Browse Properties</Link>
        </div>
      </motion.div>
    </div>
  );
}