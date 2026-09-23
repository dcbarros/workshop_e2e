/**
 * Chaves didáticas do workshop.
 *
 * A versão inicial mantém algumas funcionalidades fora da interface para simular
 * requisitos que não chegaram corretamente à produção. Para reintroduzi-las
 * durante o workshop, altere somente os valores abaixo para `true`.
 */
interface WorkshopFeatures {
  clientForm: {
    showEmailField: boolean
    showCancelButton: boolean
    showSaveButton: boolean
  }
}

export const WORKSHOP_FEATURES: WorkshopFeatures = {
  clientForm: {
    showEmailField: false,
    showCancelButton: false,
    showSaveButton: false,
  },
}
