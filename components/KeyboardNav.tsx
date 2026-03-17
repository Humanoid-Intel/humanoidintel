'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Bloomberg-style keyboard shortcuts:
 * - / or Cmd+K → open search
 * - j/k → scroll through articles (on news page)
 * - ? → show shortcuts help
 */
export function KeyboardNav() {
  const router = useRouter()

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Don't capture when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      // / → focus search (Cmd+K already handled by SearchModal)
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        // Trigger Cmd+K search modal
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
        return
      }

      // Quick nav shortcuts (no modifier)
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        switch (e.key) {
          case 'g':
            // Wait for second key
            const handler = (e2: KeyboardEvent) => {
              window.removeEventListener('keydown', handler)
              switch (e2.key) {
                case 'h': router.push('/'); break
                case 'n': router.push('/news'); break
                case 'c': router.push('/companies'); break
                case 'r': router.push('/robots'); break
                case 'f': router.push('/funding'); break
                case 'j': router.push('/jobs'); break
                case 'm': router.push('/map'); break
                case 'e': router.push('/events'); break
              }
            }
            window.addEventListener('keydown', handler)
            setTimeout(() => window.removeEventListener('keydown', handler), 1000)
            break
        }
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [router])

  return null
}
