import { JSX, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProjects } from "../../../context/ProjectsContext";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ProfileSettingsTitleH2 } from "../../../components/settings/profile-settings/profile-settings__title/profile-settings__title_H2/profile-settings__title_H2";
import { ProfileSettingsField } from "../../../components/settings/profile-settings/profile-settings__field/profile-settings__field";
import "./TeamProjectSettingsPage.scss";

export function TeamProjectSettingsPage(): JSX.Element {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { teamProjects, updateProject, deleteProject } = useProjects();

  const currentProject = teamProjects.find((p) => p.id === projectId);

  const [name, setName] = useState(currentProject?.name || "");
  const [description, setDescription] = useState(currentProject?.description || "");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!currentProject) {
    return <div>Проект не найден</div>;
  }

  const hasChanges = 
    name !== currentProject.name || 
    description !== (currentProject.description || "");

  const handleSave = async () => {
    if (!projectId) return;

    try {
      await updateProject(projectId, { name, description });
    } catch (error) {
      console.error("Failed to update project:", error);
    }
  };

  const handleCancel = () => {
    setName(currentProject.name);
    setDescription(currentProject.description || "");
  };

  const handleDelete = async () => {
    if (!projectId) return;

    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить проект "${currentProject.name}"? Это действие необратимо.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteProject(projectId);
      navigate("/overview/scenario");
    } catch (error) {
      console.error("Failed to delete project:", error);
      setIsDeleting(false);
    }
  };

  return (
    <div className="team-project-settings">
      <div className="team-project-settings__actions">
        <button
          className="team-project-settings__button team-project-settings__button--cancel"
          onClick={handleCancel}
          disabled={!hasChanges}
        >
          Отменить
        </button>
        <button
          className="team-project-settings__button team-project-settings__button--save"
          onClick={handleSave}
          disabled={!hasChanges}
        >
          Сохранить
        </button>
      </div>

      <div className="team-project-settings__h1">Информация о проекте</div>

      <div className="team-project-settings__group">
        <ProfileSettingsField
          text="Название проекта"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <ProfileSettingsField
          text="Описание проекта"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="team-project-settings__h1">Участники проекта</div>
      <div className="team-project-settings__group">
        <ProfileSettingsField
          text="Участники"
          value=""
          readOnly
          placeholder="Функционал в разработке"
        />
      </div>

      <div className="team-project-settings__h1">Опасная зона</div> 
      <button
        className="team-project-settings__button team-project-settings__button--danger"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? "Удаление..." : "Удалить этот проект"}
      </button>
    </div>
  );
}
