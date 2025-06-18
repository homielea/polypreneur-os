
import { ProjectCard } from "@/components/ProjectCard";
import { Project } from "@/types";

interface ProjectsGridProps {
  projects: Project[];
  onUpdate: (project: Project) => void;
  onClone: (projectId: string) => void;
}

export const ProjectsGrid = ({ projects, onUpdate, onClone }: ProjectsGridProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          onUpdate={onUpdate}
          onClone={onClone}
        />
      ))}
    </div>
  );
};
