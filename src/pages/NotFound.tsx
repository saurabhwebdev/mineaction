
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-light">404</h1>
        <p className="text-xl text-black/70">Page not found</p>
        <a 
          href="/" 
          className="inline-block px-6 py-2 border border-black hover:bg-black hover:text-white transition-all duration-300"
        >
          <span className="text-sm font-medium tracking-wide uppercase">Return Home</span>
        </a>
      </div>
    </div>
  );
};

export default NotFound;
