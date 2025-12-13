export default function Head() {
  const siteUrl = "https://www.apihub.com.br";
  const siteName = "APIHub - Plataforma de APIs Gratuita";
  const description = "Descubra e integre APIs gratuitas em uma plataforma feita para desenvolvedores.";
  const imageUrl = `${siteUrl}/preview-image.png`; // coloque sua imagem de preview aqui, absoluta

  return (
    <>
      {/* Básico */}
      <title>{siteName}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:title" content={siteName} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:image" content={imageUrl} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteName} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "url": siteUrl,
            "name": siteName,
            "description": description,
            "publisher": {
              "@type": "Organization",
              "name": "APIHub",
              "logo": {
                "@type": "ImageObject",
                "url": imageUrl
              }
            }
          }),
        }}
      />
    </>
  )
}
