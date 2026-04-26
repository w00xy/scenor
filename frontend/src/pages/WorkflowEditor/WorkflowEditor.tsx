import { JSX, useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LNBody } from "../../components/left_nav/left_nav_body/left_nav_body";
import { LNTDiv } from "../../components/left_nav/left_nav_top_div/Left_nav_top_div";
import { HorRule } from "../../components/left_nav/left_nav_hr/HorRule";
import { LNav } from "../../components/left_nav/left_nav_btns/left_nav_btns";
import { MainMenuBody } from "../../components/overview/main_menu_overview/MainMenuBody/MainMenuBody";
import { FlowCanvas } from "../../components/workflow/FlowCanvas/FlowCanvas";
import { useWorkflows } from "../../context/WorkflowsContext";
import { useProjects } from "../../context/ProjectsContext";
import { workflowApi } from "../../services/api";
import { Node, Edge } from "reactflow";
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
        <MainMenuBody>
          <div className="workflow-editor__header">
            <h1 className="workflow-editor__title">
              {project?.name || "Проект"} / {workflow.name}
            </h1>
          </div>

          <div className="workflow-editor__canvas">
            <FlowCanvas
              workflowId={workflowId || ""}
              initialNodes={nodes}
              initialEdges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
            />
          </div>
        </MainMenuBody>
      </div>
    </div>
  );
}
