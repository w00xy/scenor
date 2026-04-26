import { JSX, useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LNBody } from "../../components/left_nav/left_nav_body/left_nav_body";
import { LNTDiv } from "../../components/left_nav/left_nav_top_div/Left_nav_top_div";
import { HorRule } from "../../components/left_nav/left_nav_hr/HorRule";
import { LNav } from "../../components/left_nav/left_nav_btns/left_nav_btns";
import { FlowCanvas } from "../../components/workflow/FlowCanvas/FlowCanvas";
import { NodesPalette } from "../../components/workflow/NodesPalette/NodesPalette";
import { WorkflowActionsMenu } from "../../components/overview/pages_overview/overview_scen/MM_overview_scen_component/WorkflowActionsMenu";
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

        // Загружаем граф workflow (nodes и edges)
        try {
          const graph = await workflowApi.getWorkflowGraph(workflowId);
          
          // Преобразуем backend nodes в React Flow формат
          const flowNodes: Node[] = graph.nodes.map((node) => ({
            id: node.id,
            type: "default",
            position: { x: node.posX, y: node.posY },
            data: { 
              label: node.label || node.name || node.typeCode,
              typeCode: node.typeCode,
              configJson: node.configJson,
            },
          }));

          // Преобразуем backend edges в React Flow формат
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
          // Если граф пустой, оставляем пустые массивы
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
  }, [workflowId, getWorkflow]);

  const handleNodesChange = useCallback(async (updatedNodes: Node[]) => {
    if (!workflowId) return;

    // Сохраняем позиции узлов на сервер
    try {
      const updatePromises = updatedNodes.map((node) => {
        const backendNode = nodes.find((n) => n.id === node.id);
        if (backendNode && 
            (backendNode.position.x !== node.position.x || 
             backendNode.position.y !== node.position.y)) {
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
  }, [workflowId, nodes]);

  const handleEdgesChange = useCallback(async (updatedEdges: Edge[]) => {
    if (!workflowId) return;
    
    console.log("Edges changed:", updatedEdges);
    // TODO: Реализовать сохранение изменений edges
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

    // Определяем тип узла (триггер или обычный)
    const isTriggerNode = typeCode === 'manual_trigger' || typeCode === 'webhook_trigger';

    // Умное позиционирование
    let posX = 250;
    let posY = 250;

    if (nodes.length === 0) {
      // Первый нод - в центре canvas
      posX = 250;
      posY = 250;
    } else {
      // Находим самый правый нод
      const rightmostNode = nodes.reduce((max, node) => 
        node.position.x > max.position.x ? node : max
      , nodes[0]);

      // Размещаем справа от самого правого нода
      posX = rightmostNode.position.x + 200;
      
      // Y позиция - средняя по всем нодам
      const avgY = nodes.reduce((sum, node) => sum + node.position.y, 0) / nodes.length;
      posY = avgY;
    }

    const nodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const flowNode: Node = {
      id: nodeId,
      type: isTriggerNode ? "triggerNode" : "default",
      position: { 
        x: posX, 
        y: posY 
      },
      data: {
        label: typeCode,
        typeCode: typeCode,
        configJson: {},
      },
    };

    setNodes((prevNodes) => [...prevNodes, flowNode]);
  }, [workflowId, setNodes, nodes]);

  const handleDotsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (dotsRef.current) {
      const rect = dotsRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 110,
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}
