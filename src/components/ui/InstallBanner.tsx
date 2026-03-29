import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Modal } from './Modal';

export const InstallBanner: React.FC = () => {
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Don't show if already installed or dismissed
  if (isInstalled || dismissed) return null;
  
  // Only show if we CAN install (Chrome/Android) OR if it's iOS (Safari)
  if (!canInstall && !isIOS) return null;

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      setInstalling(true);
      await install();
      setInstalling(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:left-64 animate-slide-up">
        <div className="max-w-lg mx-auto bg-gradient-to-r from-primary-600 to-primary-700 border border-primary-500/40 rounded-2xl p-4 shadow-glow flex items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">
              {isIOS ? 'Instalar no iPhone' : 'Instalar DebtTracker'}
            </p>
            <p className="text-primary-100/80 text-xs mt-0.5">
              {isIOS ? 'Adicione à tela de início para usar como app' : 'Adicione à tela inicial para acesso rápido'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setDismissed(true)}
              className="p-2 rounded-lg text-primary-200/60 hover:text-white hover:bg-white/10 transition-all"
              title="Fechar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="px-4 py-2 bg-white text-primary-700 font-semibold text-sm rounded-xl hover:bg-primary-50 active:scale-95 transition-all disabled:opacity-50"
            >
              {installing ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                'Instalar'
              )}
            </button>
          </div>
        </div>
      </div>

      <IOSInstallModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} />
    </>
  );
};

// Instructions for iOS installation
const IOSInstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Instalar no iPhone / iPad">
      <div className="space-y-6 py-2">
        <p className="text-gray-300 text-sm">
          Siga os passos abaixo para adicionar o <span className="text-white font-bold">DebtTracker</span> à sua tela de início e usá-lo como um aplicativo:
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-dark-400 flex items-center justify-center flex-shrink-0 text-primary-400 font-bold">1</div>
            <div>
              <p className="text-white text-sm font-medium">Toque no botão de Compartilhar</p>
              <p className="text-gray-500 text-xs">O ícone de quadrado com uma seta para cima <svg className="inline w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg> na barra inferior do Safari.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-dark-400 flex items-center justify-center flex-shrink-0 text-primary-400 font-bold">2</div>
            <div>
              <p className="text-white text-sm font-medium">Role para baixo e toque em "Adicionar à Tela de Início"</p>
              <p className="text-gray-500 text-xs">Pode ser necessário rolar a lista de opções para encontrar.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-dark-400 flex items-center justify-center flex-shrink-0 text-primary-400 font-bold">3</div>
            <div>
              <p className="text-white text-sm font-medium">Toque em "Adicionar" no canto superior direito</p>
              <p className="text-gray-500 text-xs">O ícone do aplicativo aparecerá na sua tela de apps.</p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-xl transition-all"
          >
            Entendi
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const InstallButton: React.FC = () => {
  const { canInstall, isInstalled, isIOS, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      setInstalling(true);
      await install();
      setInstalling(false);
    }
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-emerald-400 text-xs font-medium">App instalado</p>
          <p className="text-gray-600 text-xs">Modo standalone</p>
        </div>
      </div>
    );
  }

  // If not on iOS and cannot install (PC/other), just show DB info
  if (!canInstall && !isIOS) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-7 h-7 bg-primary-600/30 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </div>
        <div>
          <p className="text-gray-400 text-xs font-medium">Dados locais</p>
          <p className="text-gray-600 text-xs">IndexedDB</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstall}
        disabled={installing}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-primary-400 hover:bg-primary-600/20 border border-transparent hover:border-primary-500/30 transition-all group disabled:opacity-50"
      >
        <div className="w-7 h-7 bg-primary-600/30 rounded-lg flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
          {installing ? (
            <svg className="animate-spin w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          )}
        </div>
        <div className="text-left">
          <p className="text-xs font-medium leading-none">Instalar App</p>
          <p className="text-gray-600 text-xs mt-0.5">{isIOS ? 'Guia para iPhone' : 'Atalho na tela'}</p>
        </div>
      </button>
      <IOSInstallModal isOpen={showIOSModal} onClose={() => setShowIOSModal(false)} />
    </>
  );
};
