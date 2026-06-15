import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

  headerContent?: React.ReactNode; 
  children: React.ReactNode;
  onCancel: () => void;
  cancelText?: string;
  onConfirm?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  confirmText?: string;
  isLoading?: boolean;
  isConfirmDisabled?: boolean;
  
  customFooter?: React.ReactNode; 
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = "xl",
  headerContent,
  children,
  onCancel,
  cancelText = "Cancelar",
  onConfirm,
  confirmText = "Salvar",
  isLoading = false,
  isConfirmDisabled = false,
  customFooter,
}: BaseModalProps) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 pt-20 md:pt-4" role="dialog" aria-modal="true">

      <button
        type="button"
        className="absolute inset-0 bg-black/40 transition-opacity cursor-default"
        onClick={onClose}
        disabled={isLoading}
        aria-label="Fechar modal"
      />

      <div className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]`}>
        
        <div className="px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
              {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
    
          {headerContent}
        </div>

        <div className="px-6 py-5 overflow-y-auto custom-scrollbar flex-1 min-h-0 relative">
          {children}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0 rounded-b-2xl">
          {customFooter ? (
            customFooter
          ) : (
            <>
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>

              {onConfirm && (
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading || isConfirmDisabled}
                  className="px-6 py-2 bg-tecsus-green text-white rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? "Processando..." : confirmText}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}