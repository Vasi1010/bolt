import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-8 hero-fade">
      <div className="text-center max-w-md">
        <p className="font-display text-[10rem] font-light text-beige dark:text-dk-border leading-none select-none">404</p>
        <div className="flex items-center justify-center gap-4 mb-8 -mt-4">
          <div className="h-px w-10 bg-gold opacity-50" />
          <span className="text-[10px] tracking-luxury text-gold uppercase">Page Not Found</span>
          <div className="h-px w-10 bg-gold opacity-50" />
        </div>
        <h2 className="font-display text-3xl font-light text-charcoal dark:text-dk-text mb-3">Nothing here.</h2>
        <p className="font-display italic text-lg text-muted dark:text-dk-muted font-light mb-10">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/")} className="btn-dark">Return Home</button>
      </div>
    </div>
  );
}

export default NotFound;
