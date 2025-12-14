"use client";
import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTermsTranslationsTranslation } from '../hooks/useLanguage';

export function ContentTermsUse() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { t, language, isClient } = useTermsTranslationsTranslation();

  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
    
    if (isClient) {
      const elements = [sectionRef.current, headerRef.current, contentRef.current];
      elements.forEach((el, index) => {
        if (el) {
          el.style.opacity = '0';
          el.style.transform = 'translateY(30px)';
          setTimeout(() => {
            el.style.transition = 'all 0.8s ease-out';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, index * 200 + 300);
        }
      });
    }
  }, [isClient, language]);

  return (
    <div className="relative z-1 max-w-3xl mx-auto px-6 py-12">
      <div className="rounded-3xl p-8 shadow-2xl relative overflow-hidden" style={{
        background: 'rgba(128, 128, 128, 0.3)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)'
      }}> 
        
        {/* Gradient border effect */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 41%, rgba(255, 255, 255, 0) 57%, rgba(255, 255, 255, 0.1) 100%)',
          padding: '1px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude'
        }}></div>

        <div className="relative" ref={contentRef}>
          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-12" ref={headerRef}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900 mb-1">{t.legalWarning.title}</p>
                <p className="text-amber-800">{t.legalWarning.content}</p>
              </div>
            </div>
          </div>

          <div className="prose prose-gray max-w-none rounded-2xl p-8" ref={sectionRef}>
            {/* Section 1: Service Nature */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4">1. {t.sections.serviceNature.title}</h2>
              
              {t.sections.serviceNature.subsections?.map((subsection, idx) => (
                <div key={idx} className="mb-6">
                  {subsection.subtitle && (
                    <h3 className="text-base font-medium text-white mb-2">{subsection.subtitle}</h3>
                  )}
                  {Array.isArray(subsection.content) ? (
                    <>
                      {subsection.content[0] && (
                        <p className="text-gray-200 mb-2">{subsection.content[0]}</p>
                      )}
                      {subsection.content.length > 1 && (
                        <ul className="text-gray-200 space-y-1 mb-6 list-disc pl-5">
                          {subsection.content.slice(1).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-200 mb-6">{subsection.content}</p>
                  )}
                </div>
              ))}
            </section>

            {/* Section 2: Prohibited Uses */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4">2. {t.sections.prohibitedUses.title}</h2>
              
              {t.sections.prohibitedUses.subsections?.map((subsection, idx) => (
                <div key={idx} className="mb-6">
                  {idx === 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-red-900 font-medium">
                        {Array.isArray(subsection.content) ? subsection.content[0] : subsection.content}
                      </p>
                    </div>
                  )}
                  
                  {subsection.subtitle && (
                    <h3 className="text-base font-medium text-white mb-3">{subsection.subtitle}</h3>
                  )}
                  
                  {Array.isArray(subsection.content) && subsection.content.length > 1 && (
                    <div className="space-y-3 mb-6">
                      {subsection.content.slice(1).map((item, i) => {
                        const [label, description] = item.split(':');
                        return (
                          <div key={i}>
                            <span className="font-medium text-white">{label}:</span>
                            <span className="text-gray-200">{description}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {!Array.isArray(subsection.content) && idx > 0 && (
                    <p className="text-gray-200">{subsection.content}</p>
                  )}
                </div>
              ))}
            </section>

            {/* Section 3: Warranty Exclusion */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4">3. {t.sections.warrantyExclusion.title}</h2>
              
              {t.sections.warrantyExclusion.subsections?.map((subsection, idx) => (
                <div key={idx} className="mb-6">
                  {idx === 0 && (
                    <div className="bg-blue-500/20 border border-blue-400/50 backdrop-blur-sm rounded-lg p-4 mb-6">
                      <p className="text-sm text-blue-300">
                        {Array.isArray(subsection.content) ? subsection.content[0] : subsection.content}
                      </p>
                    </div>
                  )}
                  
                  {subsection.subtitle && (
                    <h3 className="text-base font-medium text-white mb-2">{subsection.subtitle}</h3>
                  )}
                  
                  {Array.isArray(subsection.content) && subsection.content.length > 1 && (
                    <>
                      {subsection.content[1] && (
                        <p className="text-gray-200 mb-2">{subsection.content[1]}</p>
                      )}
                      <ul className="text-gray-200 space-y-1 mb-6 list-disc pl-5">
                        {subsection.content.slice(2).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  
                  {!Array.isArray(subsection.content) && idx > 0 && (
                    <p className="text-gray-200 mb-2">{subsection.content}</p>
                  )}
                </div>
              ))}
            </section>

            {/* Section 4: Availability and Modifications */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4">4. {t.sections.availabilityModifications.title}</h2>
              
              {t.sections.availabilityModifications.subsections?.map((subsection, idx) => (
                <div key={idx} className="mb-6">
                  {subsection.subtitle && (
                    <h3 className="text-base font-medium text-white mb-2">{subsection.subtitle}</h3>
                  )}
                  {Array.isArray(subsection.content) ? (
                    <>
                      <p className="text-gray-200 mb-2">{subsection.content[0]}</p>
                      {subsection.content.length > 1 && (
                        <ul className="text-gray-200 space-y-1 mb-6 list-disc pl-5">
                          {subsection.content.slice(1).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-200">{subsection.content}</p>
                  )}
                </div>
              ))}
            </section>

            {/* Section 5: Liability Limitation */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4">5. {t.sections.liabilityLimitation.title}</h2>
              
              {t.sections.liabilityLimitation.subsections?.map((subsection, idx) => (
                <div key={idx} className="mb-6">
                  {subsection.subtitle && (
                    <h3 className="text-base font-medium text-white mb-2">{subsection.subtitle}</h3>
                  )}
                  
                  {idx === 1 ? (
                    <div className="bg-blue-500/20 border border-blue-400/50 backdrop-blur-sm rounded-lg p-4 mb-6">
                      {Array.isArray(subsection.content) && subsection.content.map((item, i) => (
                        <p key={i} className={i === 0 ? "text-blue-200 mb-2" : "text-blue-100"}>
                          {item}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <>
                      {Array.isArray(subsection.content) ? (
                        <>
                          <p className="text-gray-200 mb-2">{subsection.content[0]}</p>
                          {subsection.content.length > 1 && (
                            <ul className="text-gray-200 space-y-1 mb-6 list-disc pl-5">
                              {subsection.content.slice(1).map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-200">{subsection.content}</p>
                      )}
                    </>
                  )}
                </div>
              ))}
            </section>

            {/* Section 6: Indemnification Obligation */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4">6. {t.sections.indemnificationObligation.title}</h2>
              
              {t.sections.indemnificationObligation.subsections?.map((subsection, idx) => (
                <div key={idx} className="mb-6">
                  {subsection.subtitle && (
                    <h3 className="text-base font-medium text-white mb-2">{subsection.subtitle}</h3>
                  )}
                  {Array.isArray(subsection.content) ? (
                    <>
                      <p className="text-gray-200 mb-2">{subsection.content[0]}</p>
                      {subsection.content.length > 1 && (
                        <ul className="text-gray-200 space-y-1 mb-6 list-disc pl-5">
                          {subsection.content.slice(1).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-200">{subsection.content}</p>
                  )}
                </div>
              ))}
            </section>

            {/* Section 7: User Obligations */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4">7. {t.sections.userObligations.title}</h2>
              
              {t.sections.userObligations.subsections?.map((subsection, idx) => (
                <div key={idx} className="mb-6">
                  {subsection.subtitle && (
                    <h3 className="text-base font-medium text-white mb-2">{subsection.subtitle}</h3>
                  )}
                  {Array.isArray(subsection.content) ? (
                    <>
                      <p className="text-gray-200 mb-2">{subsection.content[0]}</p>
                      {subsection.content.length > 1 && (
                        <ul className="text-gray-200 space-y-1 mb-6 list-disc pl-5">
                          {subsection.content.slice(1).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-200 mb-6">{subsection.content}</p>
                  )}
                </div>
              ))}
            </section>

            {/* Section 8: Intellectual Property */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4">8. {t.sections.intellectualProperty.title}</h2>
              
              {t.sections.intellectualProperty.subsections?.map((subsection, idx) => (
                <p key={idx} className="text-gray-200 mb-6">
                  {Array.isArray(subsection.content) ? subsection.content[0] : subsection.content}
                </p>
              ))}
            </section>

            {/* Section 9: Duration and Termination */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4">9. {t.sections.durationTermination.title}</h2>
              
              {t.sections.durationTermination.subsections?.map((subsection, idx) => (
                <div key={idx} className="mb-6">
                  {subsection.subtitle && (
                    <h3 className="text-base font-medium text-white mb-2">{subsection.subtitle}</h3>
                  )}
                  {Array.isArray(subsection.content) ? (
                    <>
                      <p className="text-gray-200 mb-2">{subsection.content[0]}</p>
                      {subsection.content.length > 1 && (
                        <ul className="text-gray-200 space-y-1 mb-6 list-disc pl-5">
                          {subsection.content.slice(1).map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-200 mb-6">{subsection.content}</p>
                  )}
                </div>
              ))}
            </section>

            {/* Section 10: Terms Modifications */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4">10. {t.sections.termsModifications.title}</h2>
              
              {t.sections.termsModifications.subsections?.map((subsection, idx) => (
                <p key={idx} className="text-gray-200 mb-4">
                  {Array.isArray(subsection.content) ? subsection.content[0] : subsection.content}
                </p>
              ))}
            </section>

            {/* Section 11: General Provisions */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4">11. {t.sections.generalProvisions.title}</h2>
              
              {t.sections.generalProvisions.subsections?.map((subsection, idx) => (
                <p key={idx} className="text-gray-200 mb-4">
                  {Array.isArray(subsection.content) ? subsection.content[0] : subsection.content}
                </p>
              ))}
            </section>

            {/* Section 12: Law and Jurisdiction */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4">12. {t.sections.lawJurisdiction.title}</h2>
              
              {t.sections.lawJurisdiction.subsections?.map((subsection, idx) => (
                <p key={idx} className="text-gray-200 mb-4">
                  {Array.isArray(subsection.content) ? subsection.content[0] : subsection.content}
                </p>
              ))}
            </section>

            {/* Section 13: Contact */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-white mb-4">13. {t.sections.contact.title}</h2>
              
              <div className="space-y-3">
                {t.sections.contact.subsections?.map((subsection, idx) => {
                  const content = Array.isArray(subsection.content) ? subsection.content[0] : subsection.content;
                  const [label, email] = content.split(':');
                  return (
                    <div key={idx}>
                      <span className="font-medium text-white">{label}:</span>
                      <span className="text-gray-200">{email}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Footer */}
            <div className="pt-8 border-t border-white/20 text-center">
              <p className="text-sm text-gray-300">
                {t.footer.version} • {t.footer.effectiveDate}
              </p>
            </div>
          </div>
        </div>
      </div>          
    </div>
  );
}