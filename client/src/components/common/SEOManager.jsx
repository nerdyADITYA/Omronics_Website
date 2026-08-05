import React, { useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';

export function SEOManager({ title, description, keywords, canonical, schemaJson }) {
  const { settings } = useSettings();

  const companyName = settings?.company_name || 'Omronics';
  const fullTitle = title
    ? `${title} | ${companyName}`
    : settings?.meta_title || `${companyName} - Next Gen Industrial Automation & Servo Cables`;
  const defaultDesc =
    settings?.meta_description ||
    'Omronics provides high-performance servo cables, relay cards, SCADA systems, and industrial automation solutions.';

  useEffect(() => {
    document.title = fullTitle;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description || defaultDesc;

    // Favicon link update
    if (settings?.favicon) {
      let iconLink = document.querySelector("link[rel*='icon']");
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'shortcut icon';
        document.head.appendChild(iconLink);
      }
      iconLink.href = settings.favicon;
    }

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = canonical;
    }

    // Schema.org JSON-LD Script Injection
    let schemaScript = document.getElementById('schema-json-ld');
    if (schemaJson) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'schema-json-ld';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schemaJson);
    }
  }, [fullTitle, description, defaultDesc, canonical, schemaJson, settings?.favicon]);

  return null;
}
