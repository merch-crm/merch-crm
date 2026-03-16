import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'
import { BrandingProvider } from '@/components/branding-provider'
import { Toaster } from 'sonner'

interface WrapperProps {
  children: ReactNode
}

function AllProviders({ children }: WrapperProps) {
  return (
    <BrandingProvider>
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
