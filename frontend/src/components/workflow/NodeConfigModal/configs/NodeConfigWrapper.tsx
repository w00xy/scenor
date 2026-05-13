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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { nodeDisplayNames } from "../../nodeIconMap";
import { Edge, Node } from "reactflow";

interface ConnectionInfo {
  nodeId: string;
  nodeName: string;
  nodeType: string;
}

interface ExecutionResult {
  status: string;
  inputDataJson: unknown;
  outputDataJson: unknown;
  errorMessage: string | null;
  finishedAt: string | null;
}

interface NodeConfigWrapperProps {
  isOpen: boolean;
  nodeId: string;
  nodeType: string;
  nodeData: Record<string, unknown>;
  onClose: () => void;
  onSave: (nodeId: string, config: Record<string, unknown>) => void;
  edges?: Edge[];
  nodes?: Node[];
  executionLogs?: Array<{
    nodeId: string;
    status: string;
    inputJson?: unknown;
    inputDataJson?: unknown;
    outputJson?: unknown;
    outputDataJson?: unknown;
    errorMessage: string | null;
    finishedAt: string | null;
  }>;
}

export function NodeConfigWrapper({
  isOpen,
  nodeId,
  nodeType,
  nodeData,
  onClose,
  onSave,
  edges = [],
  nodes = [],
   
  executionLogs = [],
}: NodeConfigWrapperProps): JSX.Element {

  const handleSave = (config: Record<string, unknown>) => {
    onSave(nodeId, config);
    // Не закрываем модалку автоматически - пользователь закроет сам
  };

  // Вычисляем входящие подключения
  const inputConnections: ConnectionInfo[] = edges
    .filter(edge => edge.target === nodeId)
    .map(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source);
      return {
        nodeId: edge.source,
        nodeName: sourceNode?.data?.label || sourceNode?.data?.typeCode || edge.source,
        nodeType: sourceNode?.data?.typeCode || 'unknown',
      };
    });

  // Вычисляем исходящие подключения
  const outputConnections: ConnectionInfo[] = edges
    .filter(edge => edge.source === nodeId)
    .map(edge => {
      const targetNode = nodes.find(n => n.id === edge.target);
      return {
        nodeId: edge.target,
        nodeName: targetNode?.data?.label || targetNode?.data?.typeCode || edge.target,
        nodeType: targetNode?.data?.typeCode || 'unknown',
      };
    });

  // Получаем результат последнего выполнения для этого узла
  const executionResult: ExecutionResult | null = executionLogs.length > 0 && isOpen && nodeId
    ? (() => {
        const nodeLog = executionLogs.find(log => log.nodeId === nodeId);
        if (nodeLog) {
          console.warn('[NodeConfigWrapper] Found log for node:', nodeId, nodeLog);
          return {
            status: nodeLog.status,
            inputDataJson: nodeLog.inputJson || nodeLog.inputDataJson,
            outputDataJson: nodeLog.outputJson || nodeLog.outputDataJson,
            errorMessage: nodeLog.errorMessage,
            finishedAt: nodeLog.finishedAt,
          };
        }
        return null;
      })()
    : null;

  const renderConfig = () => {
    const config = nodeData?.configJson || {};

    const commonProps = {
      config,
      onSave: handleSave as (config: Record<string, unknown>) => void,
      inputConnections,
      outputConnections,
      executionResult,
    };

    switch (nodeType) {
      case 'manual_trigger':
        return <ManualTriggerConfig {...commonProps} />;
      case 'webhook_trigger':
        return <WebhookTriggerConfig {...commonProps} />;
      case 'http_request':
        return <HttpRequestConfig {...commonProps} />;
      case 'if':
        return <IfConfig {...commonProps} />;
      case 'switch':
        return <SwitchConfig {...commonProps} />;
      case 'set':
        return <SetConfig {...commonProps} />;
      case 'transform':
        return <TransformConfig {...commonProps} />;
      case 'code':
        return <CodeConfig {...commonProps} />;
      case 'delay':
        return <DelayConfig {...commonProps} />;
      case 'db_select':
        return <DbSelectConfig {...commonProps} />;
      case 'db_insert':
        return <DbInsertConfig {...commonProps} />;
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
