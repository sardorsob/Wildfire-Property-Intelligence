export type PdfModalTarget = 'poster' | 'paper' | null

export function getPdfTargetFromHash(): PdfModalTarget {
  const hash = window.location.hash?.replace('#', '')
  if (hash === 'poster' || hash === 'paper') return hash
  return null
}
