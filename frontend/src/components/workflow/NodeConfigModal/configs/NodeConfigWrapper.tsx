import { JSX } from "react";
import { NodeConfigModal } from "../NodeConfigModal";
import { ManualTriggerConfig } from "./ManualTriggerConfig";
import { WebhookTriggerConfig } from "./WebhookTriggerConfig";
import { HttpRequestConfig } from "./HttpRequestConfig";
import { IfConfig } from "./IfConfig";
import { SwitchConfig } from "./SwitchConfig";
import { SetConfig } from "./SetConfig";
import { TransformConfig } from "./TransformConfig";
import { CodeConfig } from "./CodeConfig";
import { DelayConfig } from "./DelayConfig";
import { DbSelectConfig } from "./DbSelectConfig";
import { DbInsertConfig } from "./DbInsertConfig";
import { nodeDisplayNames } from "../../nodeIconMap";

interface NodeConfigWrapperProps {
  isOpen: boolean;
  nodeId: string;
  nodeType: string;
  nodeData: any;
  onClose: () => void;
  onSave: (nodeId: string, config: any) => void;
}

export function NodeConfigWrapper({
  isOpen,
  nodeId,
  nodeType,
  nodeData,
  onClose,
  onSave,
}: NodeConfigWrapperProps): JSX.Element {
  console.log('NodeConfigWrapper render:', { isOpen, nodeId, nodeType, nodeData });

  const handleSave = (config: any) => {
    onSave(nodeId, config);
    onClose();
  };

  const renderConfig = () => {
    const config = nodeData?.configJson || {};

    console.log('Rendering config for type:', nodeType, 'with config:', config);

    switch (nodeType) {
      case 'manual_trigger':
        return <ManualTriggerConfig config={config} onSave={handleSave} />;
      case 'webhook_trigger':
        return <WebhookTriggerConfig config={config} onSave={handleSave} />;
      case 'http_request':
        return <HttpRequestConfig config={config} onSave={handleSave} />;
      case 'if':
        return <IfConfig config={config} onSave={handleSave} />;
      case 'switch':
        return <SwitchConfig config={config} onSave={handleSave} />;
      case 'set':
        return <SetConfig config={config} onSave={handleSave} />;
      case 'transform':
        return <TransformConfig config={config} onSave={handleSave} />;
      case 'code':
        return <CodeConfig config={config} onSave={handleSave} />;
      case 'delay':
        return <DelayConfig config={config} onSave={handleSave} />;
      case 'db_select':
        return <DbSelectConfig config={config} onSave={handleSave} />;
      case 'db_insert':
        return <DbInsertConfig config={config} onSave={handleSave} />;
      default:
        return (
          <div style={{ padding: '24px', color: '#999' }}>
            Конфигурация для типа узла "{nodeType}" не реализована.
          </div>
        );
    }
  };

  return (
    <NodeConfigModal
      isOpen={isOpen}
      nodeId={nodeId}
      nodeType={nodeType}
      nodeData={nodeData}
      onClose={onClose}
      onSave={onSave}
    >
      {renderConfig()}
    </NodeConfigModal>
  );
}
