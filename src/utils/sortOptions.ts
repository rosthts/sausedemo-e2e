export const SortOptions = {
    PRICE_LOW_TO_HIGH: 'lohi',
    PRICE_HIGH_TO_LOW: 'hilo',
    NAME_A_TO_Z: 'az',
    NAME_Z_TO_A: 'za',
} as const;

export type SortOption = (typeof SortOptions)[keyof typeof SortOptions];
