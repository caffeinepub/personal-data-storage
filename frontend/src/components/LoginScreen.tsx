import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Camera, Image, Video, HardDrive, Lock } from 'lucide-react';

export function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden">
            <img
              src="/assets/generated/photovault-logo.dim_128x128.png"
              alt="PhotoVault"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const p = (e.target as HTMLImageElement).parentElement;
                if (p) p.innerHTML = '<span class="text-xl">📷</span>';
              }}
            />
          </div>
          <span className="text-xl font-google font-medium text-foreground">PhotoVault</span>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center animate-fade-in">
          {/* Logo */}
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-8 shadow-card-hover">
            <img
              src="/assets/generated/photovault-logo.dim_128x128.png"
              alt="PhotoVault"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const p = (e.target as HTMLImageElement).parentElement;
                if (p) {
                  p.className = 'w-24 h-24 rounded-full bg-gp-blue-light flex items-center justify-center mx-auto mb-8';
                  p.innerHTML = '<span class="text-4xl">📷</span>';
                }
              }}
            />
          </div>

          <h1 className="text-4xl font-google font-medium text-foreground mb-3">
            Your photos, safe forever
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Store, organize, and share your memories with <strong>1000 TB</strong> of free storage — powered by the Internet Computer.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {[
              { icon: <Image className="w-4 h-4" />, label: 'Photos & Videos', color: 'text-gp-blue' },
              { icon: <HardDrive className="w-4 h-4" />, label: '1000 TB Storage', color: 'text-gp-green' },
              { icon: <Lock className="w-4 h-4" />, label: 'Private & Secure', color: 'text-gp-red' },
              { icon: <Camera className="w-4 h-4" />, label: 'Any Format', color: 'text-gp-yellow' },
            ].map(({ icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full text-sm font-medium text-foreground"
              >
                <span className={color}>{icon}</span>
                {label}
              </div>
            ))}
          </div>

          <Button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="h-12 px-8 text-base font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-fab transition-all duration-200"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign in to PhotoVault'
            )}
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Secured by Internet Identity — no passwords needed
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-border">
        <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <span>Built with</span>
          <span className="text-gp-red">♥</span>
          <span>using</span>
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'photovault')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
          <span className="ml-2">© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
