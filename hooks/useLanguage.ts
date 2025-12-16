// ===================================================================
// ./hooks/useLanguage.ts
// ===================================================================

import { useState, useEffect } from 'react';
import {
  Language,
  detectBrowserLanguage,
  getStoredLanguage,
  setStoredLanguage,
  dispatchLanguageChange,
  LANGUAGE_CHANGE_EVENT,
  getNavTranslation,
  getEarlyAccessCTATranslation,
  getPricingTranslation,
  getHeroTranslation,
  getFooterTranslation,
  getRealTwinWhyItMattersTranslation,
  getHeaderTermsTranslations,
  getHeaderPrivacyTranslations,
  getTermsTranslationsTranslations,
  getCapabilitiesTranslation,
  getPrivacyTranslations,
  getPublicInvoiceTranslation,
  getInvoiceGeneratorTranslation, // ← Nueva importación
  getInvoiceLanguageSelectorTranslation,
  getLandingTranslation,  
  getPromptUsageTranslation       // ← Nueva importación
} from '../lib/i18n';

export const old_useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Detectar idioma inicial
    const storedLang = getStoredLanguage();
    const detectedLang = storedLang || detectBrowserLanguage();
    setLanguage(detectedLang);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Escuchar cambios de idioma desde otros componentes
    const handleLanguageChange = (event: CustomEvent<Language>) => {
      setLanguage(event.detail);
    };

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange as EventListener);
    };
  }, [isClient]);

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setStoredLanguage(newLanguage);
    dispatchLanguageChange(newLanguage);
  };

  return {
    language,
    changeLanguage,
    isClient
  };
};

// Hook específico para traducciones del navbar
export const old_useNavTranslation = () => {
  const { language, changeLanguage, isClient } = useLanguage();

  return {
    t: getNavTranslation(language),
    language,
    changeLanguage,
    isClient
  };
};

// Hook específico para traducciones del hero
export const useHeroTranslation = () => {
  const { language, changeLanguage, isClient } = useLanguage();

  return {
    t: getHeroTranslation(language),
    language,
    changeLanguage,
    isClient
  };
};

export const useCapabilitiesTranslation = () => {
  const { language, changeLanguage, isClient } = useLanguage();
  return {
    t: getCapabilitiesTranslation(language),
    language,
    changeLanguage,
    isClient
  }
}

export const useHeaderTermsTranslation = () => {
  const { language, changeLanguage, isClient } = useLanguage();
  return {
    t: getHeaderTermsTranslations(language),
    language,
    changeLanguage,
    isClient
  }
}

export const useRealTwinWhyItMattersTranslation = () => {
  const { language, changeLanguage, isClient } = useLanguage();

  return {
    t: getRealTwinWhyItMattersTranslation(language),
    language,
    changeLanguage,
    isClient
  };
};

export const useTermsTranslationsTranslation = () => {
  const { language, changeLanguage, isClient } = useLanguage();
  return {
    t: getTermsTranslationsTranslations(language),
    language,
    changeLanguage,
    isClient
  }
}

export const useHeaderPrivacyTranslation = () => {
  const { language, changeLanguage, isClient } = useLanguage();
  return {
    t: getHeaderPrivacyTranslations(language),
    language,
    changeLanguage,
    isClient
  }
}

export const usePrivacyTranslation = () => {
  const { language, changeLanguage, isClient } = useLanguage();
  return {
    t: getPrivacyTranslations(language),
    language,
    changeLanguage,
    isClient
  }
}

export const useEarlyAccessCTATranslation = () => {
  const { language, changeLanguage, isClient } = useLanguage();
  return {
    t: getEarlyAccessCTATranslation(language),
    language,
    changeLanguage,
    isClient
  }
}

export const useFooterTranslation = () => {

  const { language, changeLanguage, isClient } = useLanguage();
  return {
    t: getFooterTranslation(language),
    language,
    changeLanguage,
    isClient
  }
}

// Hook específico para traducciones de factura pública
export const usePublicInvoiceTranslation = () => {
  const { language, changeLanguage, isClient } = useLanguage();

  return {
    t: getPublicInvoiceTranslation(language),
    language,
    changeLanguage,
    isClient
  };
};

// ✅ NUEVO: Hook específico para traducciones del Invoice Generator
export const useInvoiceGeneratorTranslation = () => {
  const { language, changeLanguage, isClient } = useLanguage();

  return {
    t: getInvoiceGeneratorTranslation(language),
    language,
    changeLanguage,
    isClient
  };
};

export const usePricingTranslation = () => {
  const { language, changeLanguage, isClient } = useLanguage();

  return {
    t: getPricingTranslation(language),
    language,
    changeLanguage,
    isClient
  };
}

// ✅ NUEVO: Hook específico para traducciones del PromptUsageDisplay
export const usePromptUsageTranslation = () => {
  const { language, changeLanguage, isClient } = useLanguage();

  return {
    t: getPromptUsageTranslation(language),
    language,
    changeLanguage,
    isClient
  };
};

export const useInvoiceLanguageSelectorTranslation = () => {
  const { language, changeLanguage, isClient } = useLanguage();

  return {
    t: getInvoiceLanguageSelectorTranslation(language),
    language,
    changeLanguage,
    isClient
  };
};

export const useLandingTranslation = () => {
  const { language, changeLanguage, isClient } = useLanguage();

  return {
    t: getLandingTranslation(language),
    language,
    changeLanguage,
    isClient
  };
};

// ✅ NUEVO: Hook base que puede recibir un idioma inicial
export const useLanguage = (initialLanguage?: Language) => {
  const [language, setLanguage] = useState<Language>('en');
  const [isClient, setIsClient] = useState(false);
 
  useEffect(() => {
    setIsClient(true);
 
    // ✅ MODIFICADO: Priorizar idioma inicial, luego almacenado, luego detectado
    let detectedLang: Language;
    
    if (initialLanguage) {
      // Si se proporciona idioma inicial (desde URL), usarlo
      detectedLang = initialLanguage;
    } else {
      // Si no, usar la lógica anterior
      const storedLang = getStoredLanguage();
      detectedLang = storedLang || detectBrowserLanguage();
    }
    
    setLanguage(detectedLang);
    
    // ✅ NUEVO: Si hay idioma inicial y es diferente al almacenado, actualizarlo
    if (initialLanguage && initialLanguage !== getStoredLanguage()) {
      setStoredLanguage(initialLanguage);
    }
  }, [initialLanguage]);
 
  useEffect(() => {
    if (!isClient) return;
 
    // Escuchar cambios de idioma desde otros componentes
    const handleLanguageChange = (event: CustomEvent<Language>) => {
      setLanguage(event.detail);
    };
 
    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange as EventListener);
 
    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLanguageChange as EventListener);
    };
  }, [isClient]);
 
  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setStoredLanguage(newLanguage);
    dispatchLanguageChange(newLanguage);
  };
 
  return {
    language,
    changeLanguage,
    isClient
  };
};

// ✅ MODIFICADO: Hook específico para traducciones del navbar con idioma inicial
export const useNavTranslation = (initialLanguage?: Language) => {
  const { language, changeLanguage, isClient } = useLanguage(initialLanguage);
 
  return {
    t: getNavTranslation(language),
    language,
    changeLanguage,
    isClient
  };
};