
export type FinishId = 'negro' | 'oxido' | 'envejecido' | 'inox';

export interface Finish
{
    id:        FinishId;
    label:     string;
    swatch:    string;
    color:     string;
    metalness: number;
    roughness: number;
}

export const FINISHES: Finish[] = [
    {id: 'negro',      label: 'Negro mate',      swatch: '#24272b', color: '#3b3f45', metalness: 0.85, roughness: 0.34},
    {id: 'oxido',      label: 'Óxido natural',   swatch: '#8a4a26', color: '#7a3e1e', metalness: 0.55, roughness: 0.82},
    {id: 'envejecido', label: 'Dorado envejecido', swatch: '#a5823f', color: '#9c7a38', metalness: 1,    roughness: 0.38},
    {id: 'inox',       label: 'Acero inoxidable', swatch: '#c7ccd1', color: '#c9ced3', metalness: 1,    roughness: 0.16},
];

export const findFinish = (id: FinishId): Finish => FINISHES.find(f => f.id === id) ?? FINISHES[0];

export interface RosetteParts
{
    scrolls: boolean;
    spears:  boolean;
    collars: boolean;
}
