// app/(main)/dashboard/production/components/index.ts

// Bento-компоненты дашборда
export * from './bento';

// Главный компонент дашборда


// Компоненты калькуляторов
export { CalculatorLayout, CalculatorSection, CalculatorResults, ResultRow } from './calculator-layout';
export { CalculatorSkeleton } from './calculator-skeleton';

// Интеграция со складом
export { WarehouseMaterialPicker, type WarehouseMaterial } from './warehouse-material-picker';
export { WarehouseMaterialsList, type SelectedMaterial } from './warehouse-materials-list';
