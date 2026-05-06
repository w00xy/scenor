import { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
// eslint-disable-next-line @typescript-eslint/no-unused-vars
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  NodeTypes,
  ReactFlowInstance,
  PanOnScrollMode,
} from "reactflow";
import "reactflow/dist/style.css";
import "./FlowCanvas.scss";
import { TriggerNode } from "../CustomNodes/TriggerNode";
import { DefaultNode } from "../CustomNodes/DefaultNode";
import { CustomEdge } from "../CustomEdges/CustomEdge";
import { workflowApi } from "../../../services/api";
   

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

interface FlowCanvasProps {
  workflowId: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onAddNode?: (node: Node) => void;
  onDeleteEdge?: (edgeId: string) => Promise<void>;
  executionState?: {
    isExecuting: boolean;
    triggeredNodeId: string | null;
    executedEdges: string[];
  };
}

const CANVAS_BOUNDS = {
  minX: -2000,
  maxX: 2000,
  minY: -2000,
  maxY: 2000,
};

const nodeTypes: NodeTypes = {
  triggerNode: TriggerNode,
  default: DefaultNode,
};

const edgeTypes = {
  default: CustomEdge,
};

export function FlowCanvas({
  workflowId,
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  _onAddNode,
  onDeleteEdge,
  executionState,
}: FlowCanvasProps): JSX.Element {
  const [nodes, setNodes, onNodesChangeInternal] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeInternal] = useEdgesState(initialEdges);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const [showMiniMap, setShowMiniMap] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);
  const memoizedEdgeTypes = useMemo(() => edgeTypes, []);

  const debouncedSavePositions = useRef(
    debounce((nodesToSave: Node[]) => {
      onNodesChange?.(nodesToSave);
    }, 500)
  ).current;

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  const prevNodesLengthRef = useRef(initialNodes.length);
  useEffect(() => {
    if (initialNodes.length > prevNodesLengthRef.current) {
      const newNodes = initialNodes.slice(prevNodesLengthRef.current);
      setNodes((currentNodes) => [...currentNodes, ...newNodes]);
      prevNodesLengthRef.current = initialNodes.length;
    }
    else if (initialNodes.length < prevNodesLengthRef.current) {
      const initialNodeIds = new Set(initialNodes.map(n => n.id));
      setNodes((currentNodes) => 
        currentNodes.filter(node => initialNodeIds.has(node.id))
      );
      prevNodesLengthRef.current = initialNodes.length;
    }
    else if (prevNodesLengthRef.current === 0 && initialNodes.length > 0) {
      setNodes(initialNodes);
      prevNodesLengthRef.current = initialNodes.length;
    }
    else {
      // Синхронизируем данные узлов (например, executionStatus)
      setNodes((currentNodes) => 
        currentNodes.map((node) => {
          const initialNode = initialNodes.find(n => n.id === node.id);
          if (initialNode && initialNode.data.executionStatus !== node.data.executionStatus) {
            return {
              ...node,
              data: {
                ...node.data,
                executionStatus: initialNode.data.executionStatus,
              },
            };
          }
          return node;
        })
      );
    }
  }, [initialNodes, setNodes]);

  // Обновляем узлы при изменении executionState
  useEffect(() => {
    if (!executionState) return;

    const triggeredNodeId = executionState.triggeredNodeId || null;

    setNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isTriggered: node.id === triggeredNodeId,
        },
      }))
    );
  }, [executionState, setNodes]);

  const handleDeleteEdge = useCallback(
    async (edgeId: string) => {
      if (!workflowId) return;
      
      try {
        await workflowApi.deleteEdge(workflowId, edgeId);
        
        setEdges((prevEdges) => {
          const newEdges = prevEdges.filter((edge) => edge.id !== edgeId);
          return newEdges;
        });
        
        if (onDeleteEdge) {
          await onDeleteEdge(edgeId);
        }
      } catch (error) {
        console.error("Failed to delete edge:", error);
        alert("Не удалось удалить связь");
      }
    },
    [workflowId, setEdges, onDeleteEdge]
  );

  const prevEdgesLengthRef = useRef(initialEdges.length);
  useEffect(() => {
    if (initialEdges.length > prevEdgesLengthRef.current) {
      const newEdges = initialEdges.slice(prevEdgesLengthRef.current);
      const edgesWithDelete = newEdges.map(edge => ({
        ...edge,
        data: { ...edge.data, onDelete: handleDeleteEdge }
      }));
      setEdges((currentEdges) => [...currentEdges, ...edgesWithDelete]);
      prevEdgesLengthRef.current = initialEdges.length;
    }
    else if (prevEdgesLengthRef.current === 0 && initialEdges.length > 0) {
      const edgesWithDelete = initialEdges.map(edge => ({
        ...edge,
        data: { ...edge.data, onDelete: handleDeleteEdge }
      }));
      setEdges(edgesWithDelete);
      prevEdgesLengthRef.current = initialEdges.length;
    }
    else if (initialEdges.length < prevEdgesLengthRef.current) {
      const edgesWithDelete = initialEdges.map(edge => ({
        ...edge,
        data: { ...edge.data, onDelete: handleDeleteEdge }
      }));
      setEdges(edgesWithDelete);
      prevEdgesLengthRef.current = initialEdges.length;
    }
  }, [initialEdges, setEdges, handleDeleteEdge]);

  // Обновляем edges при изменении executionState
  useEffect(() => {
    if (!executionState) return;

    const executedEdges = executionState.executedEdges || [];

    setEdges((currentEdges) =>
      currentEdges.map((edge) => ({
        ...edge,
        data: {
          ...edge.data,
          isExecuted: executedEdges.includes(edge.id),
          onDelete: edge.data?.onDelete || handleDeleteEdge,
        },
        className: executedEdges.includes(edge.id) ? 'executed' : '',
      }))
    );
  }, [executionState, setEdges, handleDeleteEdge]);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setEdges((currentEdges) =>
        currentEdges.map((edge) => ({
          ...edge,
          data: { ...edge.data, onDelete: handleDeleteEdge }
        }))
      );
     
    }
  }, [setEdges]);

  const onConnect = useCallback(
    async (params: Connection) => {
      if (!workflowId || !params.source || !params.target) return;

      try {
        const createdEdge = await workflowApi.createEdge(workflowId, {
          sourceNodeId: params.source,
          targetNodeId: params.target,
          sourceHandle: params.sourceHandle || undefined,
          targetHandle: params.targetHandle || undefined,
        });

        const flowEdge: Edge = {
          id: createdEdge.id,
          source: createdEdge.sourceNodeId,
          target: createdEdge.targetNodeId,
          sourceHandle: createdEdge.sourceHandle || undefined,
          targetHandle: createdEdge.targetHandle || undefined,
          animated: true,
          data: { 
            onDelete: handleDeleteEdge,
            isExecuted: false,
          },
        };

     
        setEdges((prevEdges) => [...prevEdges, flowEdge]);
        onEdgesChange?.([...edges, flowEdge]);
      } catch (error) {
        alert("Не удалось создать связь");
      }
    },
    [workflowId, edges, setEdges, onEdgesChange, handleDeleteEdge]
     
  );
     

  const handleNodesChange = useCallback(
    async (changes: any) => {
      const removeChanges = changes.filter((change: any) => change.type === 'remove');
      
      if (removeChanges.length > 0 && workflowId) {
        for (const change of removeChanges) {
          try {
            await workflowApi.deleteNode(workflowId, change.id);
          } catch (error) {
            console.error('Failed to delete node:', error);
          }
        }
     
      }

      onNodesChangeInternal(changes);
      
      const positionChanges = changes.filter(
        (change: any) => change.type === 'position' && change.dragging === false
      );

      if (positionChanges.length > 0) {
        setTimeout(() => {
          setNodes((currentNodes) => {
            const boundedNodes = currentNodes.map((node) => {
              const x = Math.max(CANVAS_BOUNDS.minX, Math.min(CANVAS_BOUNDS.maxX, node.position.x));
              const y = Math.max(CANVAS_BOUNDS.minY, Math.min(CANVAS_BOUNDS.maxY, node.position.y));
              
              if (x !== node.position.x || y !== node.position.y) {
                return { ...node, position: { x, y } };
              }
              return node;
            });
            
            debouncedSavePositions(boundedNodes);
            return boundedNodes;
          });
        }, 0);
     
      }
    },
    [workflowId, onNodesChangeInternal, setNodes, debouncedSavePositions]
  );

  const handleEdgesChange = useCallback(
    async (changes: any) => {
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

  const handleInteraction = useCallback(() => {
    setShowMiniMap(true);
    
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      setShowMiniMap(false);
    }, 2000);
  }, []);

  const onMoveStart = useCallback(() => {
    handleInteraction();
  }, [handleInteraction]);

  const onMoveEnd = useCallback(() => {
    handleInteraction();
  }, [handleInteraction]);

  return (
    <div className="flow-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onMoveStart={onMoveStart}
        onMoveEnd={onMoveEnd}
        nodeTypes={memoizedNodeTypes}
        edgeTypes={memoizedEdgeTypes}
        minZoom={0.8}
        maxZoom={2}
        fitView
        proOptions={{ hideAttribution: true }}
        zoomOnScroll={true}
        panOnScroll={true}
        panOnScrollMode={PanOnScrollMode.Free}
        preventScrolling={true}
        translateExtent={[
          [CANVAS_BOUNDS.minX, CANVAS_BOUNDS.minY],
          [CANVAS_BOUNDS.maxX, CANVAS_BOUNDS.maxY],
        ]}
        nodeExtent={[
          [CANVAS_BOUNDS.minX, CANVAS_BOUNDS.minY],
          [CANVAS_BOUNDS.maxX, CANVAS_BOUNDS.maxY],
        ]}
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
