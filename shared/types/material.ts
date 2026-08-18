import type { Material, MaterialCategory } from '~/generated/prisma/client';

interface IMaterial extends Material {
    category: MaterialCategory;
}

export type MaterialSortKey = 'newest' | 'oldest' | 'updated' | 'alpha';

export interface IMaterialCard extends IMaterial {
    author: {
        id: string;
        name: string | null;
        image: string | null;
    } | null;
    project: {
        id: string;
        name: string;
    } | null;
}
