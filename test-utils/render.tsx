import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { BrandingProvider } from '@/components/branding-provider'
import { Toaster } from 'sonner'

interface WrapperProps {
  children: ReactNode
}

const mockBranding = {
    companyName: "MerchCRM",
    logoUrl: null,
    primaryColor: "#5d00ff",
    faviconUrl: null,
    radiusOuter: 24,
    radiusInner: 14,
    currencySymbol: "₽",
    dateFormat: "DD.MM.YYYY",
    timezone: "Europe/Moscow"
};

function AllProviders({ children }: WrapperProps) {
  return (
    <BrandingProvider initialData={mockBranding}>
      {children}
      <Toaster />
    </BrandingProvider>
  )
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return rtlRender(ui, { wrapper: AllProviders, ...options })
}

// Re-export всё из testing-library
export * from '@testing-library/react'
export { customRender as render }
