import {cacheLife, cacheTag} from 'next/cache';
import {contentService} from '@/services/container';
import type {CraftStep, Project, ProjectDetail, Restoration} from '@/app/interfaces/interfaces';

export async function getCraftSteps(): Promise<CraftStep[]>
{
    'use cache';
    cacheLife('days');
    cacheTag('content');

    return contentService.getCraftSteps();
}

export async function getRestorations(): Promise<Restoration[]>
{
    'use cache';
    cacheLife('days');
    cacheTag('projects');

    return contentService.getRestorations();
}

export async function getFeaturedProjects(): Promise<Project[]>
{
    'use cache';
    cacheLife('days');
    cacheTag('projects');

    return contentService.getFeaturedProjects();
}

const FOUNDED_YEAR = 1997;

export async function getYearsOfCraft(): Promise<number>
{
    'use cache';
    cacheLife('days');

    return new Date().getFullYear() - FOUNDED_YEAR;
}

export async function getProjects(type?: string): Promise<Project[]>
{
    'use cache';
    cacheLife('days');
    cacheTag('projects');

    return contentService.getProjects(type);
}

export async function getProjectTypes(): Promise<string[]>
{
    'use cache';
    cacheLife('days');
    cacheTag('projects');

    return contentService.getProjectTypes();
}

export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null>
{
    'use cache';
    cacheLife('days');
    cacheTag('projects');

    return contentService.getProjectBySlug(slug);
}

export async function getProjectSlugs(): Promise<string[]>
{
    'use cache';
    cacheLife('days');
    cacheTag('projects');

    return contentService.getProjectSlugs();
}
