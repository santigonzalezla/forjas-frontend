import type {IContentSource} from '@/services/content/IContentSource';
import type {IHttpClient} from '@/services/http/IHttpClient';
import {HttpError} from '@/services/http/HttpError';
import type {CraftStep, MediaImage, Project, ProjectDetail, Restoration} from '@/app/interfaces/interfaces';
import type {ApiProject, ApiProjectImage} from '@/app/interfaces/admin';
import {MOCK_CRAFT_STEPS} from '@/services/mock/mockData';

const FALLBACK_IMAGE: MediaImage = {src: '/brand/logo-color.png', alt: 'Forjas · Hierro Hecho Arte', width: 640, height: 261};

const toImage = (image: ApiProjectImage): MediaImage => ({src: image.url, alt: image.alt, width: image.width, height: image.height});

// Portada: la primera foto de galería; si es una restauración, la de "después"
const coverOf = (project: ApiProject): MediaImage =>
{
    const cover = project.images.find(i => i.role === 'GALLERY') ?? project.images.find(i => i.role === 'AFTER') ?? project.images[0];
    return cover ? toImage(cover) : FALLBACK_IMAGE;
};

const toProject = (project: ApiProject): Project => ({
    id:      project.id,
    slug:    project.slug,
    title:   project.title,
    type:    project.type,
    summary: project.summary,
    image:   coverOf(project),
});

const toProjectDetail = (project: ApiProject): ProjectDetail =>
{
    const before = project.images.find(i => i.role === 'BEFORE');
    const after  = project.images.find(i => i.role === 'AFTER');
    return {
        ...toProject(project),
        description: project.description,
        location:    project.location,
        year:        project.year,
        gallery:     project.images.filter(i => i.role === 'GALLERY').map(toImage),
        before:      before ? toImage(before) : null,
        after:       after ? toImage(after) : null,
    };
};

// Proyectos y restauraciones vienen del backend; los pasos del oficio son texto fijo
export class ApiContentSource implements IContentSource
{
    constructor(private readonly http: IHttpClient) {}

    async getCraftSteps(): Promise<CraftStep[]>
    {
        return MOCK_CRAFT_STEPS;
    }

    async getRestorations(): Promise<Restoration[]>
    {
        const projects = await this.http.get<ApiProject[]>('project/restorations');
        return projects.map(project =>
        {
            const detail = toProjectDetail(project);
            return {id: project.id, title: project.title, description: project.summary, before: detail.before as MediaImage, after: detail.after as MediaImage};
        });
    }

    async getFeaturedProjects(): Promise<Project[]>
    {
        const projects = await this.http.get<ApiProject[]>('project/featured');
        return projects.map(toProject);
    }

    async getProjects(type?: string): Promise<Project[]>
    {
        const projects = await this.http.get<ApiProject[]>(`project${type ? `?type=${encodeURIComponent(type)}` : ''}`);
        return projects.map(toProject);
    }

    getProjectTypes(): Promise<string[]>
    {
        return this.http.get<string[]>('project/types');
    }

    async getProjectBySlug(slug: string): Promise<ProjectDetail | null>
    {
        try
        {
            return toProjectDetail(await this.http.get<ApiProject>(`project/${encodeURIComponent(slug)}`));
        }
        catch (error)
        {
            if (error instanceof HttpError && error.status === 404) return null;
            throw error;
        }
    }

    async getProjectSlugs(): Promise<string[]>
    {
        const projects = await this.http.get<ApiProject[]>('project');
        return projects.map(project => project.slug);
    }
}
