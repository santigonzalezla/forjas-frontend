import type {CraftStep, Project, ProjectDetail, Restoration} from '@/app/interfaces/interfaces';

export interface IContentSource
{
    getCraftSteps(): Promise<CraftStep[]>;
    getRestorations(): Promise<Restoration[]>;
    getFeaturedProjects(): Promise<Project[]>;
    getProjects(type?: string): Promise<Project[]>;
    getProjectTypes(): Promise<string[]>;
    getProjectBySlug(slug: string): Promise<ProjectDetail | null>;
    getProjectSlugs(): Promise<string[]>;
}
