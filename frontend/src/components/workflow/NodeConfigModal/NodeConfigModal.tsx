import { JSX, useEffect } from "react";
import CloseSVG from "../../../assets/common/Close.svg?react";
import { nodeIconMap, nodeDisplayNames } from "../nodeIconMap";
import "./NodeConfigModal.scss";

interface NodeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave: (config: any) => void;
  nodeType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeData: any;
  children: React.ReactNode;
}

export function NodeConfigModal({
  isOpen,
  onClose,
  nodeType,
  children,
}: NodeConfigModalProps): JSX.Element | null {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const NodeIcon = nodeIconMap[nodeType];
  const displayName = nodeDisplayNames[nodeType] || nodeType;

  return (
    <div className="node-config-modal-overlay" onClick={onClose}>
      <div className="node-config-modal" onClick={(e) => e.stopPropagation()}>
        <div className="node-config-modal__header">
          <div className="node-config-modal__header-left">
            {NodeIcon && (
              <div className="node-config-modal__icon">
                <NodeIcon />
              </div>
            )}
            <h2 className="node-config-modal__title">{displayName}</h2>
          </div>
          <button
            className="node-config-modal__close"
            onClick={onClose}
            title="Закрыть"
          >
            <CloseSVG />
          </button>
        </div>

        <div className="node-config-modal__content">
          {children}
        </div>
      </div>
    </div>
  );
}
