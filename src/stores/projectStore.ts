import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface Project {
  id: string;
  name: string;
  path: string;
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  addProject: (name: string, path: string) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    const projects = await invoke<Project[]>("project_list");
    set({ projects, loading: false });
  },

  addProject: async (name, path) => {
    const project = await invoke<Project>("project_add", { name, path });
    set((state) => ({ projects: [...state.projects, project] }));
  },

  removeProject: async (id) => {
    await invoke("project_remove", { id });
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
  },
}));
