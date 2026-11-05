import type {IContentSource} from '@/services/content/IContentSource';
import type {CraftStep, Project, ProjectDetail, Restoration} from '@/app/interfaces/interfaces';
import {MOCK_CRAFT_STEPS, MOCK_PROJECTS, MOCK_RESTORATIONS} from '@/services/mock/mockData';

export class MockContentSource implements IContentSource
{
    async getCraftSteps(): Promise<CraftStep[]> { return MOCK_CRAFT_STEPS; }

    async getRestorations(): Promise<Restoration[]> { return MOCK_RESTORATIONS; }

    async getFeaturedProjects(): Promise<Project[]> { return MOCK_PROJECTS; }

    async getProjects(type?: string): Promise<Project[]>
    {
        return type ? MOCK_PROJECTS.filter(p => p.type === type) : MOCK_PROJECTS;
    }

    async getProjectTypes(): Promise<string[]> { return [...new Set(MOCK_PROJECTS.map(p => p.type))]; }

    async getProjectBySlug(slug: string): Promise<ProjectDetail | null>
    {
        const project = MOCK_PROJECTS.find(p => p.slug === slug);
        return project ? {...project, description: null, location: null, year: null, gallery: [project.image], before: null, after: null} : null;
    }

    async getProjectSlugs(): Promise<string[]> { return MOCK_PROJECTS.map(p => p.slug); }
}
