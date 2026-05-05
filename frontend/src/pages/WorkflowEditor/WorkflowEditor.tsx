import { JSX, useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LNBody } from "../../components/left_nav/left_nav_body/left_nav_body";
import { LNTDiv } from "../../components/left_nav/left_nav_top_div/Left_nav_top_div";
import { HorRule } from "../../components/left_nav/left_nav_hr/HorRule";
import { LNav } from "../../components/left_nav/left_nav_btns/left_nav_btns";
import { FlowCanvas } from "../../components/workflow/FlowCanvas/FlowCanvas";
import { NodesPalette } from "../../components/workflow/NodesPalette/NodesPalette";
import { WorkflowActionsMenu } from "../../components/overview/pages_overview/overview_scen/MM_overview_scen_component/WorkflowActionsMenu";
import { BottomLogsPanel } from "../../components/workflow/BottomLogsPanel/BottomLogsPanel";
import { useWorkflows } from "../../context/WorkflowsContext";
import { useProjects } from "../../context/ProjectsContext";
import { workflowApi } from "../../services/api";
import { Node, Edge } from "reactflow";
import PlusSVG from "../../assets/MM_Vectors-pages/Plus.svg?react";
import MM_DotsSVG from "../../assets/MM_DotsSVG.svg?react";
import "./WorkflowEditor.scss";

export function WorkflowEditor(): JSX.Element {
  const { workflowId, projectId } = useParams<{ workflowId: string; projectId: string }>();
  const navigate = useNavigate();
  const { getWorkflow } = useWorkflows();
  const { projects } = useProjects();

  const [workflow, setWorkflow] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const dotsRef = useRef<HTMLDivElement>(null);
  
  const lastSavedPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  
  const [executionState, setExecutionState] = useState<{
    isExecuting: boolean;
    triggeredNodeId: string | null;
    executedEdges: string[];
    lastExecutionId: string | null;
  }>({
    isExecuting: false,
    triggeredNodeId: null,
    executedEdges: [],
    lastExecutionId: null,
  });

  const [logsPanelHeight, setLogsPanelHeight] = useState(40);

  const handleDeleteNode = useCallback(async (nodeId: string) => {
    if (!workflowId) return;

    if (!confirm("Вы уверены, что хотите удалить этот узел?")) {
      return;
    }

    try {
      await workflowApi.deleteNode(workflowId, nodeId);
      
      setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeId));
      
      setEdges((prevEdges) => 
        prevEdges.filter((edge) => 
          edge.source !== nodeId && edge.target !== nodeId
        )
      );
    } catch (error) {
      console.error("Failed to delete node:", error);
      alert("Не удалось удалить узел");
    }
  }, [workflowId]);

  useEffect(() => {
    const loadWorkflow = async () => {
      if (!workflowId) {
        setError("ID сценария не указан");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const loadedWorkflow = await getWorkflow(workflowId);
        setWorkflow(loadedWorkflow);
        setWorkflowName(loadedWorkflow.name);

        try {
          const graph = await workflowApi.getWorkflowGraph(workflowId);
          
          const flowNodes: Node[] = graph.nodes.map((node) => {
            const isTriggerNode = node.typeCode === 'manual_trigger' || node.typeCode === 'webhook_trigger';
            
            lastSavedPositions.current.set(node.id, {
              x: node.posX,
              y: node.posY,
            });
            
            return {
              id: node.id,
              type: isTriggerNode ? "triggerNode" : "default",
              position: { x: node.posX, y: node.posY },
              data: { 
                label: node.label || node.name || node.typeCode,
                typeCode: node.typeCode,
                configJson: node.configJson,
                onDelete: handleDeleteNode,
                onPlay: isTriggerNode ? handleRunWorkflow : undefined,
              },
            };
          });

          const flowEdges: Edge[] = graph.edges.map((edge) => ({
            id: edge.id,
            source: edge.sourceNodeId,
            target: edge.targetNodeId,
            sourceHandle: edge.sourceHandle || undefined,
            targetHandle: edge.targetHandle || undefined,
            label: edge.label || undefined,
            animated: true,
          }));

          setNodes(flowNodes);
          setEdges(flowEdges);
        } catch (graphError) {
          console.error("Failed to load workflow graph:", graphError);
          setNodes([]);
          setEdges([]);
        }
      } catch (err) {
        console.error("Failed to load workflow:", err);
        setError("Не удалось загрузить сценарий");
      } finally {
        setIsLoading(false);
      }
    };

    void loadWorkflow();
  }, [workflowId]);

  const handleNodesChange = useCallback(async (updatedNodes: Node[]) => {
    if (!workflowId) return;

    try {
      const updatePromises = updatedNodes.map((node) => {
        const lastSaved = lastSavedPositions.current.get(node.id);
        
        if (!lastSaved || 
            lastSaved.x !== node.position.x || 
            lastSaved.y !== node.position.y) {
          
          lastSavedPositions.current.set(node.id, {
            x: node.position.x,
            y: node.position.y,
          });
          
          return workflowApi.updateNode(workflowId, node.id, {
            posX: node.position.x,
            posY: node.position.y,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Failed to save node positions:", error);
    }
  }, [workflowId]);

  const handleEdgesChange = useCallback(async (updatedEdges: Edge[]) => {
    if (!workflowId) return;
  }, [workflowId]);

  const handleSaveWorkflowName = useCallback(async () => {
    if (!workflowId || !workflowName.trim()) return;

    try {
      await workflowApi.updateWorkflow(workflowId, { name: workflowName });
      setWorkflow((prev: any) => ({ ...prev, name: workflowName }));
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to update workflow name:", error);
      alert("Не удалось обновить название");
    }
  }, [workflowId, workflowName]);

  const handleCancelEdit = useCallback(() => {
    setWorkflowName(workflow?.name || "");
    setIsEditingName(false);
  }, [workflow]);

  const handleAddNode = useCallback(async (typeCode: string) => {
    if (!workflowId) return;

    const isTriggerNode = typeCode === 'manual_trigger' || typeCode === 'webhook_trigger';

    let posX = 250;
    let posY = 250;

    const getDefaultConfig = (type: string): Record<string, unknown> => {
      switch (type) {
        case 'webhook_trigger':
          return { path: '/hook', method: 'POST' };
        case 'http_request':
          return {
            url: 'https://api.example.com/resource',
            method: 'GET',
            headers: {},
            query: {},
            body: null,
            timeout: 10000,
          };
        case 'transform':
          return { script: 'return input;' };
        case 'code':
          return { language: 'javascript', source: 'return input;' };
        case 'delay':
          return { durationMs: 1000 };
        case 'if':
          return { mode: 'all', conditions: [] };
        case 'switch':
          return { expression: '{{input.value}}', cases: [] };
        case 'set':
          return { values: {} };
        case 'db_select':
          return { table: '', where: {} };
        case 'db_insert':
          return { table: '', values: {} };
        default:
          return {};
      }
    };

    try {
      const createdNode = await workflowApi.createNode(workflowId, {
        type: typeCode,
        posX: posX,
        posY: posY,
        configJson: getDefaultConfig(typeCode),
      });

      lastSavedPositions.current.set(createdNode.id, {
        x: createdNode.posX,
        y: createdNode.posY,
      });

      const flowNode: Node = {
        id: createdNode.id,
        type: isTriggerNode ? "triggerNode" : "default",
        position: { 
          x: createdNode.posX, 
          y: createdNode.posY 
        },
        data: {
          label: createdNode.label || createdNode.name || createdNode.typeCode,
          typeCode: createdNode.typeCode,
          configJson: createdNode.configJson,
          onDelete: handleDeleteNode,
          onPlay: isTriggerNode ? handleRunWorkflow : undefined,
        },
      };

      setNodes((prevNodes) => [...prevNodes, flowNode]);
    } catch (error) {
      console.error("Failed to create node:", error);
      alert("Не удалось создать узел");
    }
  }, [workflowId, setNodes]);

  const handleDotsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (dotsRef.current) {
      const rect = dotsRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 200,
      });
    }
    
    setShowActionsMenu(!showActionsMenu);
  };

  const handleDeleteWorkflow = async () => {
    if (!workflowId || !workflow) return;

    if (!confirm(`Вы уверены, что хотите удалить сценарий "${workflow.name}"?`)) {
      return;
    }

    try {
      await workflowApi.deleteWorkflow(workflowId);
      navigate(`/projects/${projectId || workflow.projectId}/scenario`);
    } catch (error) {
      console.error("Failed to delete workflow:", error);
      alert("Не удалось удалить сценарий");
    } finally {
      setShowActionsMenu(false);
    }
  };

  const handleShareWorkflow = () => {
    alert("Функция 'Поделиться' пока не реализована");
    setShowActionsMenu(false);
  };

  const handleRunWorkflow = async () => {
    if (!workflowId) return;

    try {
      setExecutionState({
        isExecuting: true,
        triggeredNodeId: null,
        executedEdges: [],
        lastExecutionId: null,
      });

      const result = await workflowApi.executeManual(workflowId);

      // Извлекаем ID узлов, которые были выполнены
      const executedNodeIds = Object.keys(result.outputDataJson?.nodeOutputs || {});
      
      // Находим manual_trigger узел
      const triggerNode = nodes.find(node => 
        node.data.typeCode === 'manual_trigger'
      );

      // Находим все edges, которые исходят из выполненных узлов
      const executedEdgeIds = edges
        .filter(edge => executedNodeIds.includes(edge.source))
        .map(edge => edge.id);

      setExecutionState({
        isExecuting: false,
        triggeredNodeId: triggerNode?.id || null,
        executedEdges: executedEdgeIds,
        lastExecutionId: result.id,
      });

      setTimeout(() => {
        setExecutionState({
          isExecuting: false,
          triggeredNodeId: null,
          executedEdges: [],
          lastExecutionId: result.id,
        });
      }, 3000);
    } catch (error) {
      console.error("Failed to execute workflow:", error);
      alert("Не удалось запустить сценарий");
      setExecutionState({
        isExecuting: false,
        triggeredNodeId: null,
        executedEdges: [],
        lastExecutionId: null,
      });
    }
  };

  const handleDeleteEdge = useCallback(async (edgeId: string) => {
    setEdges((prevEdges) => {
      const newEdges = prevEdges.filter((edge) => edge.id !== edgeId);
      return newEdges;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="workflow-editor">
        <LNBody>
          <LNTDiv />
          <HorRule />
          <LNav />
        </LNBody>
        <div className="workflow-editor__main">
          <div className="workflow-editor__loading">Загрузка сценария...</div>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="workflow-editor">
        <LNBody>
          <LNTDiv />
          <HorRule />
          <LNav />
        </LNBody>
        <div className="workflow-editor__main">
          <div className="workflow-editor__error">
            {error || "Сценарий не найден"}
          </div>
          <button
            className="workflow-editor__back-button"
            onClick={() => navigate(-1)}
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  const project = projects.find((p) => p.id === (projectId || workflow.projectId));

  return (
    <div className="workflow-editor">
      <LNBody>
        <LNTDiv />
        <HorRule />
        <LNav />
      </LNBody>

      <div className="workflow-editor__main">
        <div className="workflow-editor__header">
          <div className="workflow-editor__title-wrapper">
            <span className="workflow-editor__project-name">
              {project?.name || "Проект"}
            </span>
            <span className="workflow-editor__separator"> / </span>
            {isEditingName ? (
              <input
                type="text"
                className="workflow-editor__name-input"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                onBlur={handleSaveWorkflowName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveWorkflowName();
                  if (e.key === "Escape") handleCancelEdit();
                }}
                autoFocus
              />
            ) : (
              <span
                className="workflow-editor__workflow-name"
                onClick={() => setIsEditingName(true)}
                title="Нажмите для редактирования"
              >
                {workflow.name}
              </span>
            )}
          </div>
          <div 
            ref={dotsRef} 
            onClick={handleDotsClick} 
            className="workflow-editor__dots-button"
          >
            <MM_DotsSVG />
          </div>
        </div>

        {showActionsMenu && (
          <WorkflowActionsMenu
            onOpen={() => {
              setShowActionsMenu(false);
            }}
            onShare={handleShareWorkflow}
            onDelete={handleDeleteWorkflow}
            onClose={() => setShowActionsMenu(false)}
            position={menuPosition}
          />
        )}

        <div className="workflow-editor__workspace">
          {!isPaletteOpen && (
            <button
              className="workflow-editor__add-node-btn"
              onClick={() => setIsPaletteOpen(true)}
              title="Добавить узел"
            >
              <PlusSVG />
            </button>
          )}

          {isPaletteOpen && (
            <div className="workflow-editor__palette-wrapper">
              <NodesPalette 
                onAddNode={(typeCode) => {
                  handleAddNode(typeCode);
                  setIsPaletteOpen(false);
                }} 
              />
            </div>
          )}

          <div className="workflow-editor__canvas-wrapper">
            <div 
              className="workflow-editor__canvas"
              onClick={() => isPaletteOpen && setIsPaletteOpen(false)}
            >
              <FlowCanvas
                workflowId={workflowId || ""}
                initialNodes={nodes}
                initialEdges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onAddNode={(node) => setNodes((prev) => [...prev, node])}
                onDeleteEdge={handleDeleteEdge}
                executionState={executionState}
              />

              <button
                className="workflow-editor__run-btn"
                onClick={handleRunWorkflow}
                title="Запустить сценарий"
              >
                Запустить сценарий
              </button>
            </div>

            <BottomLogsPanel 
              workflowId={workflowId || ""} 
              lastExecutionId={executionState.lastExecutionId}
              onHeightChange={setLogsPanelHeight}
              nodes={nodes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
