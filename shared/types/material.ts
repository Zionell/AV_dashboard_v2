import type { Material, MaterialCategory } from '@prisma/client';

export interface IMaterial extends Material {
    category: MaterialCategory;
}
