import type {IContentSource} from '@/services/content/IContentSource';
import type {CraftStep, Project, ProjectDetail, Restoration} from '@/app/interfaces/interfaces';

export class ContentService
{
    constructor(private readonly source: IContentSource) {}

    getCraftSteps(): Promise<CraftStep[]> { return this.source.getCraftSteps(); }

    getRestorations(): Promise<Restoration[]> { return this.source.getRestorations(); }

    getFeaturedProjects(): Promise<Project[]> { return this.source.getFeaturedProjects(); }

    getProjects(type?: string): Promise<Project[]> { return this.source.getProjects(type); }

    getProjectTypes(): Promise<string[]> { return this.source.getProjectTypes(); }

    getProjectBySlug(slug: string): Promise<ProjectDetail | null> { return this.source.getProjectBySlug(slug); }

    getProjectSlugs(): Promise<string[]> { return this.source.getProjectSlugs(); }
}
