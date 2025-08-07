import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInStandaloneMode, setIsInStandaloneMode] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
    
    // Detectar se já está em modo standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsInStandaloneMode(standalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Para iOS, mostrar prompt após um tempo se não estiver instalado
    if (iOS && !standalone) {
      const timer = setTimeout(() => {
        const dismissed = localStorage.getItem('installPromptDismissed');
        if (!dismissed || (Date.now() - parseInt(dismissed)) > (24 * 60 * 60 * 1000)) {
          setShowPrompt(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // Não mostrar se já está instalado ou foi dispensado recentemente
  if (isInStandaloneMode) return null;

  // Check if user dismissed recently (only for non-iOS)
  useEffect(() => {
    if (!isIOS) {
      const dismissed = localStorage.getItem('installPromptDismissed');
      if (dismissed) {
        const dismissedTime = parseInt(dismissed);
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        if (dismissedTime > oneDayAgo) {
          setShowPrompt(false);
        }
      }
    }
  }, [isIOS]);

  if (!showPrompt || (!deferredPrompt && !isIOS)) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-in">
      <Card className="border-primary shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">Instalar App</CardTitle>
                <CardDescription className="text-sm">
                  {isIOS ? 'Adicione à tela inicial' : 'Acesse rapidamente sem navegador'}
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleDismiss}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isIOS ? (
            <div className="space-y-3">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Share className="w-4 h-4" />
                  <span>1. Toque no botão compartilhar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>2. Selecione "Adicionar à Tela Inicial"</span>
                </div>
              </div>
              <Button variant="outline" onClick={handleDismiss} className="w-full">
                Entendi
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={handleInstall}
                className="flex-1 gap-2"
              >
                <Download className="w-4 h-4" />
                Instalar
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDismiss}
                className="px-4"
              >
                Agora não
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}