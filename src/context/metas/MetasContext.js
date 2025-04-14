'use client'
import { createContext, useContext } from 'react'
import { useMetasState } from '@/hooks/useMetasState'
import AppLayout from '@/components/Layout/page'

const MetasContext = createContext(null)

export const MetasProvider = ({ children }) => {
  const metasState = useMetasState()
  
  return (
    <MetasContext.Provider value={metasState}>
      <AppLayout>
      {children}
      </AppLayout>
    </MetasContext.Provider>
  )
}

export const useMetasContext = () => {
  const context = useContext(MetasContext)
  if (!context) {
    throw new Error('useMetasContext must be used within a MetasProvider')
  }
  return context
}

export { MetasContext }