import DepthLine from '@/app/components/home/depthline/DepthLine';
import CraftMarquee from '@/app/components/home/craftmarquee/CraftMarquee';
import ShopHighlights from '@/app/components/home/shophighlights/ShopHighlights';
import DesignTeaser from '@/app/components/home/designteaser/DesignTeaser';
import CraftSteps from '@/app/components/home/craftsteps/CraftSteps';
import Restoration from '@/app/components/home/restoration/Restoration';
import ProjectsBento from '@/app/components/home/projectsbento/ProjectsBento';
import ClosingBand from '@/app/components/home/closingband/ClosingBand';
import RevealRoot from '@/app/components/ui/revealroot/RevealRoot';
import {getFeaturedPieces} from '@/services/queries/catalog';
import {getCraftSteps, getFeaturedProjects, getRestorations, getYearsOfCraft} from '@/services/queries/content';

export default async function HomePage()
{
    const [pieces, steps, restorations, projects, years] = await Promise.all([
        getFeaturedPieces(),
        getCraftSteps(),
        getRestorations(),
        getFeaturedProjects(),
        getYearsOfCraft(),
    ]);

    return (
        <>
            <DepthLine pieces={pieces} />
            <CraftMarquee />
            <ShopHighlights />
            <DesignTeaser />
            <CraftSteps steps={steps} />
            <Restoration items={restorations} />
            <ProjectsBento projects={projects} years={years} craftImage={steps[1].image} servicesImage={steps[3].image} />
            <ClosingBand />
            <RevealRoot />
        </>
    );
}
