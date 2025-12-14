"use client";
import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { usePrivacyTranslation } from '../hooks/useLanguage';

export function ContentTermPrivacy() {
    const [isLoaded, setIsLoaded] = useState(false);
    const { t, language, isClient } = usePrivacyTranslation();

    const sectionRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    return (
        <div className="max-w-3xl mx-auto px-6 py-12" ref={sectionRef}>
            <div 
                ref={headerRef}
                className="rounded-3xl p-8 shadow-2xl relative overflow-hidden" 
                style={{
                    background: 'rgba(128, 128, 128, 0.3)',
                    backdropFilter: 'blur(40px)',
                    WebkitBackdropFilter: 'blur(40px)'
                }}
            >
                {/* Gradient border effect */}
                <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 41%, rgba(255, 255, 255, 0) 57%, rgba(255, 255, 255, 0.1) 100%)',
                    padding: '1px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude'
                }}></div>

                <div className="relative" ref={contentRef}>
                    {/* Section 1 */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-white mb-4">{t.section1.title}</h2>
                        <div className="space-y-2">
                            <div>
                                <span className="font-medium text-white">{t.section1.denomination}</span>
                                <span className="text-gray-200"> GIS Insight</span>
                            </div>
                            <div>
                                <span className="font-medium text-white">{t.section1.contact}</span>
                                <span className="text-gray-200"> privacy@gisinsight.io</span>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-white mb-4">{t.section2.title}</h2>
                        
                        <h3 className="text-base font-medium text-white mb-2">{t.section2.registrationData.title}</h3>
                        <p className="text-gray-200 mb-2">{t.section2.registrationData.intro}</p>
                        <ul className="text-gray-200 space-y-1 mb-6">
                            {t.section2.registrationData.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        <h3 className="text-base font-medium text-white mb-2">{t.section2.configurationData.title}</h3>
                        <p className="text-gray-200 mb-2">{t.section2.configurationData.intro}</p>
                        <ul className="text-gray-200 space-y-1 mb-6">
                            {t.section2.configurationData.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        <h3 className="text-base font-medium text-white mb-2">{t.section2.mqttTelemetry.title}</h3>
                        <p className="text-gray-200 mb-2">{t.section2.mqttTelemetry.intro}</p>
                        <ul className="text-gray-200 space-y-1 mb-4">
                            {t.section2.mqttTelemetry.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        <div className="bg-blue-500/20 border border-blue-400/50 backdrop-blur-sm rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-blue-200 mb-1">{t.section2.mqttTelemetry.alert.title}</p>
                                    <p className="text-blue-100">{t.section2.mqttTelemetry.alert.content}</p>
                                </div>
                            </div>
                        </div>

                        <h3 className="text-base font-medium text-white mb-2">{t.section2.technicalLogs.title}</h3>
                        <p className="text-gray-200 mb-2">{t.section2.technicalLogs.intro}</p>
                        <ul className="text-gray-200 space-y-1 mb-6">
                            {t.section2.technicalLogs.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        <h3 className="text-base font-medium text-white mb-2">{t.section2.cookiesStorage.title}</h3>
                        <ul className="text-gray-200 space-y-1">
                            {t.section2.cookiesStorage.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-white mb-4">{t.section3.title}</h2>
                        
                        <h3 className="text-base font-medium text-white mb-2">{t.section3.legalBasis.title}</h3>
                        <p className="text-gray-200 mb-2">{t.section3.legalBasis.intro}</p>
                        <ul className="text-gray-200 space-y-1 mb-6">
                            {t.section3.legalBasis.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        <h3 className="text-base font-medium text-white mb-2">{t.section3.purposes.title}</h3>
                        
                        <div className="mb-4">
                            <p className="font-medium text-white mb-2">{t.section3.purposes.serviceOperation.title}</p>
                            <ul className="text-gray-200 space-y-1 ml-4">
                                {t.section3.purposes.serviceOperation.items.map((item, i) => (
                                    <li key={i}>• {item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="mb-4">
                            <p className="font-medium text-white mb-2">{t.section3.purposes.serviceImprovement.title}</p>
                            <ul className="text-gray-200 space-y-1 ml-4">
                                {t.section3.purposes.serviceImprovement.items.map((item, i) => (
                                    <li key={i}>• {item}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <p className="font-medium text-white mb-2">{t.section3.purposes.essentialComms.title}</p>
                            <ul className="text-gray-200 space-y-1 ml-4">
                                {t.section3.purposes.essentialComms.items.map((item, i) => (
                                    <li key={i}>• {item}</li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-white mb-4">{t.section4.title}</h2>
                        
                        <h3 className="text-base font-medium text-white mb-2">{t.section4.noCommercialization.title}</h3>
                        <p className="text-gray-200 mb-6">{t.section4.noCommercialization.content}</p>

                        <h3 className="text-base font-medium text-white mb-3">{t.section4.dataRecipients.title}</h3>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <p className="font-medium text-white">{t.section4.dataRecipients.mapbox.name}</p>
                                <p className="text-gray-200 text-sm">{t.section4.dataRecipients.mapbox.description}</p>
                                <p className="text-gray-300 text-sm">{t.section4.dataRecipients.mapbox.policy}</p>
                            </div>

                            <div>
                                <p className="font-medium text-white">{t.section4.dataRecipients.hosting.name}</p>
                                <p className="text-gray-200 text-sm">{t.section4.dataRecipients.hosting.description}</p>
                                <p className="text-gray-300 text-sm">{t.section4.dataRecipients.hosting.access}</p>
                            </div>

                            <div>
                                <p className="font-medium text-white">{t.section4.dataRecipients.payment.name}</p>
                                <p className="text-gray-200 text-sm">{t.section4.dataRecipients.payment.description}</p>
                                <p className="text-gray-300 text-sm">{t.section4.dataRecipients.payment.note}</p>
                            </div>

                            <div>
                                <p className="font-medium text-white">{t.section4.dataRecipients.legal.name}</p>
                                <p className="text-gray-200 text-sm">{t.section4.dataRecipients.legal.description}</p>
                            </div>

                            <div>
                                <p className="font-medium text-white">{t.section4.dataRecipients.businessTransfers.name}</p>
                                <p className="text-gray-200 text-sm">{t.section4.dataRecipients.businessTransfers.description}</p>
                            </div>
                        </div>

                        <h3 className="text-base font-medium text-white mb-2">{t.section4.internationalTransfers.title}</h3>
                        <p className="text-gray-200">{t.section4.internationalTransfers.content}</p>
                    </section>

                    {/* Section 5 */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-white mb-4">{t.section5.title}</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-base font-medium text-white mb-2">{t.section5.accountData.title}</h3>
                                <ul className="text-gray-200 space-y-1">
                                    {t.section5.accountData.items.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-base font-medium text-white mb-2">{t.section5.mqttTelemetry.title}</h3>
                                <ul className="text-gray-200 space-y-1">
                                    {t.section5.mqttTelemetry.items.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-base font-medium text-white mb-2">{t.section5.systemLogs.title}</h3>
                                <ul className="text-gray-200 space-y-1">
                                    {t.section5.systemLogs.items.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-base font-medium text-white mb-2">{t.section5.serviceClosure.title}</h3>
                                <p className="text-gray-200 mb-2">{t.section5.serviceClosure.intro}</p>
                                <ol className="text-gray-200 space-y-1 list-decimal ml-5">
                                    {t.section5.serviceClosure.items.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ol>
                            </div>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-white mb-4">{t.section6.title}</h2>
                        
                        <h3 className="text-base font-medium text-white mb-3">{t.section6.technicalMeasures.title}</h3>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <p className="font-medium text-white mb-1">{t.section6.technicalMeasures.inTransit.title}</p>
                                <ul className="text-gray-200 space-y-1 ml-4">
                                    {t.section6.technicalMeasures.inTransit.items.map((item, i) => (
                                        <li key={i}>• {item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <p className="font-medium text-white mb-1">{t.section6.technicalMeasures.atRest.title}</p>
                                <ul className="text-gray-200 space-y-1 ml-4">
                                    {t.section6.technicalMeasures.atRest.items.map((item, i) => (
                                        <li key={i}>• {item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <p className="font-medium text-white mb-1">{t.section6.technicalMeasures.accessControl.title}</p>
                                <ul className="text-gray-200 space-y-1 ml-4">
                                    {t.section6.technicalMeasures.accessControl.items.map((item, i) => (
                                        <li key={i}>• {item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <p className="font-medium text-white mb-1">{t.section6.technicalMeasures.monitoring.title}</p>
                                <ul className="text-gray-200 space-y-1 ml-4">
                                    {t.section6.technicalMeasures.monitoring.items.map((item, i) => (
                                        <li key={i}>• {item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <h3 className="text-base font-medium text-white mb-2">{t.section6.securityBreaches.title}</h3>
                        <p className="text-gray-200 mb-2">{t.section6.securityBreaches.intro}</p>
                        <ol className="text-gray-200 space-y-1 list-decimal ml-5 mb-6">
                            {t.section6.securityBreaches.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ol>

                        <h3 className="text-base font-medium text-white mb-2">{t.section6.userResponsibilities.title}</h3>
                        <p className="text-gray-200 mb-2">{t.section6.userResponsibilities.intro}</p>
                        <ul className="text-gray-200 space-y-1">
                            {t.section6.userResponsibilities.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    {/* Section 7 */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-white mb-4">{t.section7.title}</h2>
                        
                        <p className="text-gray-200 mb-4">{t.section7.intro}</p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <h3 className="text-base font-medium text-white mb-1">{t.section7.access.title}</h3>
                                <p className="text-gray-200">{t.section7.access.content}</p>
                            </div>

                            <div>
                                <h3 className="text-base font-medium text-white mb-1">{t.section7.rectification.title}</h3>
                                <p className="text-gray-200">{t.section7.rectification.content}</p>
                            </div>

                            <div>
                                <h3 className="text-base font-medium text-white mb-1">{t.section7.deletion.title}</h3>
                                <p className="text-gray-200 mb-1">{t.section7.deletion.intro}</p>
                                <ul className="text-gray-200 space-y-1 ml-4">
                                    {t.section7.deletion.items.map((item, i) => (
                                        <li key={i}>• {item}</li>
                                    ))}
                                </ul>
                                <p className="text-gray-200 mt-2">{t.section7.deletion.deadline}</p>
                            </div>

                            <div>
                                <h3 className="text-base font-medium text-white mb-1">{t.section7.limitation.title}</h3>
                                <p className="text-gray-200 mb-1">{t.section7.limitation.intro}</p>
                                <ul className="text-gray-200 space-y-1 ml-4">
                                    {t.section7.limitation.items.map((item, i) => (
                                        <li key={i}>• {item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-base font-medium text-white mb-1">{t.section7.portability.title}</h3>
                                <p className="text-gray-200">{t.section7.portability.content}</p>
                                <p className="text-gray-200 mt-1">{t.section7.portability.format}</p>
                            </div>

                            <div>
                                <h3 className="text-base font-medium text-white mb-1">{t.section7.opposition.title}</h3>
                                <p className="text-gray-200">{t.section7.opposition.content}</p>
                            </div>

                            <div>
                                <h3 className="text-base font-medium text-white mb-1">{t.section7.automatedDecisions.title}</h3>
                                <p className="text-gray-200">{t.section7.automatedDecisions.content}</p>
                            </div>
                        </div>

                        <div className="bg-white/10 border border-white/20 backdrop-blur-sm rounded-lg p-4">
                            <h3 className="text-base font-medium text-white mb-2">{t.section7.exerciseRights.title}</h3>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-200">{t.section7.exerciseRights.contact}</p>
                                <p className="text-gray-200">{t.section7.exerciseRights.responseTime}</p>
                                <p className="text-gray-200">{t.section7.exerciseRights.identityVerification}</p>
                                <p className="text-gray-200">{t.section7.exerciseRights.complaint}</p>
                            </div>
                        </div>
                    </section>

                    {/* Section 8 */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-white mb-4">{t.section8.title}</h2>
                        
                        <h3 className="text-base font-medium text-white mb-2">{t.section8.experimentalNature.title}</h3>
                        <p className="text-gray-200 mb-2">{t.section8.experimentalNature.intro}</p>
                        <ul className="text-gray-200 space-y-1 mb-6">
                            {t.section8.experimentalNature.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        <h3 className="text-base font-medium text-white mb-2">{t.section8.historicalData.title}</h3>
                        <ul className="text-gray-200 space-y-1 mb-6">
                            {t.section8.historicalData.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        <h3 className="text-base font-medium text-white mb-2">{t.section8.recommendation.title}</h3>
                        <p className="text-gray-200">{t.section8.recommendation.content}</p>
                    </section>

                    {/* Section 9 */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-white mb-4">{t.section9.title}</h2>
                        {t.section9.paragraphs.map((paragraph, i) => (
                            <p key={i} className="text-gray-200 mb-4">{paragraph}</p>
                        ))}
                    </section>

                    {/* Section 10 */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-white mb-4">{t.section10.title}</h2>
                        
                        <h3 className="text-base font-medium text-white mb-3">{t.section10.contact.title}</h3>
                        <div className="space-y-2 mb-6">
                            <p className="text-gray-200">{t.section10.contact.privacy}</p>
                            <p className="text-gray-200">{t.section10.contact.security}</p>
                            <p className="text-gray-200">{t.section10.contact.support}</p>
                        </div>

                        <h3 className="text-base font-medium text-white mb-2">{t.section10.supervisoryAuthority.title}</h3>
                        <div className="text-gray-200">
                            <p className="font-medium text-white">{t.section10.supervisoryAuthority.name}</p>
                            {t.section10.supervisoryAuthority.address.map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                            <p>{t.section10.supervisoryAuthority.website}</p>
                        </div>
                    </section>

                    {/* Section 11 */}
                    <section className="mb-12">
                        <h2 className="text-xl font-semibold text-white mb-4">{t.section11.title}</h2>
                        
                        <h3 className="text-base font-medium text-white mb-2">{t.section11.applicableLaw.title}</h3>
                        <p className="text-gray-200 mb-2">{t.section11.applicableLaw.intro}</p>
                        <ul className="text-gray-200 space-y-1 mb-6">
                            {t.section11.applicableLaw.items.map((item, i) => (
                                <li key={i}>{item}</li>
                            ))}
                        </ul>

                        <h3 className="text-base font-medium text-white mb-2">{t.section11.jurisdiction.title}</h3>
                        <p className="text-gray-200">{t.section11.jurisdiction.content}</p>
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
    );
}