import { JSX, useState } from "react";
import "./RunWorkflowModal.scss";

interface RunWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRun: (inputData: Record<string, unknown>) => void;
  workflowName: string;
}

export function RunWorkflowModal({ isOpen, onClose, onRun, workflowName }: RunWorkflowModalProps): JSX.Element | null {
  const [inputJson, setInputJson] = useState("{}");
  const [jsonError, setJsonError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (value: string) => {
    setInputJson(value);
    
    // Валидация JSON
    if (value.trim() === "") {
      setJsonError(null);
      return;
    }
    
    try {
      JSON.parse(value);
      setJsonError(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setJsonError("Некорректный JSON");
    }
  };

  const handleRun = () => {
    if (jsonError) {
      return;
    }

    let parsedData: Record<string, unknown> = {};
    
    if (inputJson.trim() !== "") {
      try {
        parsedData = JSON.parse(inputJson);
      } catch (e) {
     
        setJsonError("Некорректный JSON");
        return;
      }
    }

    onRun(parsedData);
    onClose();
    setInputJson("{}");
    setJsonError(null);
  };

  const handleCancel = () => {
    onClose();
    setInputJson("{}");
    setJsonError(null);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div 
      className="run-workflow-modal-overlay" 
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div className="run-workflow-modal">
        <div className="run-workflow-modal__header">
          <h2 className="run-workflow-modal__title">Запуск сценария</h2>
          <button 
            className="run-workflow-modal__close"
            onClick={handleCancel}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <div className="run-workflow-modal__content">
          <div className="run-workflow-modal__workflow-name">
            <span className="run-workflow-modal__label">Сценарий:</span>
            <span className="run-workflow-modal__value">{workflowName}</span>
          </div>

          <div className="run-workflow-modal__input-section">
            <label className="run-workflow-modal__label">
              Входные данные (JSON):
            </label>
            <textarea
              className={`run-workflow-modal__textarea ${jsonError ? 'error' : ''}`}
              value={inputJson}
              onChange={(_e) => handleInputChange(e.target.value)}
              placeholder='{"key": "value"}'
              rows={10}
            />
            {jsonError && (
              <div className="run-workflow-modal__error">{jsonError}</div>
            )}
            <div className="run-workflow-modal__hint">
              Введите JSON объект с данными для запуска workflow. Оставьте пустым для запуска без данных.
            </div>
          </div>
        </div>

        <div className="run-workflow-modal__footer">
          <button 
            className="run-workflow-modal__button run-workflow-modal__button--cancel"
            onClick={handleCancel}
          >
            Отмена
          </button>
          <button 
            className="run-workflow-modal__button run-workflow-modal__button--run"
            onClick={handleRun}
            disabled={!!jsonError}
          >
            Запустить
          </button>
        </div>
      </div>
    </div>
  );
}
