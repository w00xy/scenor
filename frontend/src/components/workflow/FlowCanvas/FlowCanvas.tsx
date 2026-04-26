import { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  NodeTypes,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";
import "./FlowCanvas.scss";
import { TriggerNode } from "../CustomNodes/TriggerNode";
import { DefaultNode } from "../CustomNodes/DefaultNode";

interface FlowCanvasProps {
  workflowId: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onAddNode?: (node: Node) => void;
}

export function FlowCanvas({
  workflowId,
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onAddNode,
}: FlowCanvasProps): JSX.Element {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      triggerNode: TriggerNode,
      default: DefaultNode,
    }),
    []
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = addEdge(params, edges);
      setEdges(newEdge);
      onEdgesChange?.(newEdge);
    },
    [edges, setEdges, onEdgesChange]
  );

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChangeInternal(changes);
      setTimeout(() => {
        setNodes((currentNodes) => {
          onNodesChange?.(currentNodes);
          return currentNodes;
        });
      }, 0);
    },
    [onNodesChangeInternal, setNodes, onNodesChange]
  );

  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChangeInternal(changes);
      setTimeout(() => {
        setEdges((currentEdges) => {
          onEdgesChange?.(currentEdges);
          return currentEdges;
        });
      }, 0);
    },
    [onEdgesChangeInternal, setEdges, onEdgesChange]
  );

  // Кастомная обработка колёсика мыши
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      if (!reactFlowInstance.current) return;
      
      event.preventDefault();
      
      // Показываем MiniMap при взаимодействии
      setShowMiniMap(true);
      
      // Сбрасываем предыдущий таймер
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      
      // Скрываем MiniMap через 2 секунды после последнего взаимодействия
      hideTimeoutRef.current = setTimeout(() => {
        setShowMiniMap(false);
      }, 2000);
      
      const instance = reactFlowInstance.current;
      const viewport = instance.getViewport();
      const delta = event.deltaY;
      const panSpeed = 0.5;

      if (event.ctrlKey || event.metaKey) {
        // Ctrl/Cmd + колёсико = зум
        const zoomStep = 0.1;
        const newZoom = delta < 0 ? viewport.zoom + zoomStep : viewport.zoom - zoomStep;
        instance.setViewport({
          x: viewport.x,
          y: viewport.y,
          zoom: Math.max(0.1, Math.min(2, newZoom)),
        }, { duration: 200 });
      } else if (event.shiftKey) {
        // Shift + колёсико = горизонтальная панорама
        instance.setViewport({
          x: viewport.x - delta * panSpeed,
          y: viewport.y,
          zoom: viewport.zoom,
        });
      } else {
        // Обычное колёсико = вертикальная панорама
        instance.setViewport({
          x: viewport.x,
          y: viewport.y - delta * panSpeed,
          zoom: viewport.zoom,
        });
      }
    },
    []
  );

  useEffect(() => {
    const flowElement = document.querySelector('.react-flow');
    if (flowElement) {
      flowElement.addEventListener('wheel', handleWheel as any, { passive: false });
      return () => {
        flowElement.removeEventListener('wheel', handleWheel as any);
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      };
    }
  }, [handleWheel]);

  return (
    <div className="flow-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        zoomOnScroll={false}
        panOnScroll={false}
        preventScrolling={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#636363" />
        <Controls position="bottom-left" />
        {showMiniMap && (
          <MiniMap
            nodeColor="#FF4B33"
            maskColor="rgba(153, 153, 153, 0.6)"
            style={{ background: "#1a1a1a", bottom: "60px" }}
            position="bottom-left"
            className="minimap-fade"
          />
        )}
      </ReactFlow>
    </div>
  );
}
