import { API } from '@/lib/supabase' 

interface APIPdfSectionProps {
  api: API
}

export function APIPdfSection({ api }: APIPdfSectionProps) {
  if (!api.pdf_url) {
    return null
  }

  return (
    <div className="pdf-section">
      <a 
        href={api.pdf_url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="pdf-button"
      >
        📄 Ver Documentação em PDF
      </a>
    </div>
  )
}
