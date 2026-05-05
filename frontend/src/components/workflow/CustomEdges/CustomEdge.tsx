import { JSX, useState, useRef, useEffect } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "reactflow";
import TrashSVG from "../../../assets/common/Trash.svg?react";
import "./CustomEdge.scss";

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  const isExecuted = data?.isExecuted || false;
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = async () => {
    if (data?.onDelete) {
      await data.onDelete(id);
    }
  };

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const edgeStyle = isExecuted 
    ? { ...style, stroke: '#4CAF50', strokeWidth: 2 }
    : style;

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={edgeStyle}
        interactionWidth={20}
        className={isExecuted ? 'executed' : ''}
      />
      {/* Невидимый широкий путь для лучшего обнаружения наведения */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="edge-hover-area"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: "all",
          }}
          className={`custom-edge-button ${isHovered ? "visible" : ""}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            className="edge-delete-btn"
            onClick={onEdgeClick}
            title="Удалить связь"
          >
            <TrashSVG />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
