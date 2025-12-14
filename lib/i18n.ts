// ./utils/i18n.ts
export type Language = 'en' | 'es' | 'pt' | 'ja' | 'fr' | 'de';

export const languageNames: Record<Language, string> = {
  en: "English",
  es: "Español", 
  pt: "Português",
  ja: "日本語",
  fr: "Français",
  de: "Deutsch"
};   


interface Section {
  title: string;
  subsections?: {
    subtitle?: string;
    content: string | string[];
  }[];
}

export const termsTranslations: Record<Language, {
  legalWarning: {
    title: string;
    content: string;
  };
  sections: {
    serviceNature: Section;
    prohibitedUses: Section;
    warrantyExclusion: Section;
    availabilityModifications: Section;
    liabilityLimitation: Section;
    indemnificationObligation: Section;
    userObligations: Section;
    intellectualProperty: Section;
    durationTermination: Section;
    termsModifications: Section;
    generalProvisions: Section;
    lawJurisdiction: Section;
    contact: Section;
  };
  footer: {
    version: string;
    effectiveDate: string;
  };
}> = {
  es: {
    legalWarning: {
      title: "AVISO LEGAL PREVIO",
      content: "GIS Insight constituye un proyecto en fase experimental proporcionado sin garantías. El uso del Servicio implica la aceptación expresa de estos términos. No es software profesional ni producto comercialmente maduro. El usuario asume íntegramente toda responsabilidad derivada del uso."
    },
    sections: {
      serviceNature: {
        title: "1. Naturaleza del Servicio",
        subsections: [
          {
            subtitle: "1.1 Definición",
            content: "GIS Insight es una plataforma experimental de visualización de datos MQTT en tiempo real que permite conexión a brokers, procesamiento de telemetría, representación geoespacial y configuración de alertas."
          },
          {
            subtitle: "1.2 Carácter Experimental",
            content: [
              "Proyecto personal y educativo en desarrollo continuo",
              "Herramienta no certificada para uso profesional o industrial",
              "Servicio sin auditoría externa ni cobertura de seguro",
              "Fase Alpha/Beta, inadecuado para entornos de producción"
            ]
          },
          {
            subtitle: "1.3 Ámbito Autorizado",
            content: [
              "Experimentación personal y fines educativos",
              "Pruebas de concepto sin consecuencias operacionales",
              "Demostración de tecnologías y proyectos no críticos"
            ]
          }
        ]
      },
      prohibitedUses: {
        title: "2. Usos Expresamente Prohibidos",
        subsections: [
          {
            content: "Queda terminantemente prohibido utilizar el Servicio para aplicaciones críticas"
          },
          {
            subtitle: "2.1 Aplicaciones Críticas",
            content: [
              "Seguridad y emergencias: Alarmas contra incendios, sistemas de evacuación, alertas de desastres, geolocalización de emergencia",
              "Sanidad: Monitorización de pacientes, dispositivos médicos, dispensación farmacéutica, alertas médicas críticas",
              "Infraestructura crítica: Generación eléctrica, tratamiento de agua, transporte público, telecomunicaciones esenciales",
              "Procesos industriales peligrosos: Instalaciones químicas, materiales peligrosos, maquinaria pesada con riesgo",
              "Servicios financieros: Trading automático, procesamiento de transacciones, sistemas regulados"
            ]
          },
          {
            subtitle: "2.2 Criterio General de Exclusión",
            content: [
              "Riesgo de muerte o lesiones graves",
              "Posibilidad de pérdidas económicas superiores a 1.000 EUR",
              "Riesgo de daños ambientales significativos",
              "Sistemas regulados por autoridades competentes",
              "Contratos con SLA o certificaciones requeridas"
            ]
          },
          {
            subtitle: "2.3 Consecuencias",
            content: "El uso indebido constituye violación material de estos Términos y causa de cancelación inmediata de cuenta, asumiendo el usuario toda responsabilidad derivada."
          }
        ]
      },
      warrantyExclusion: {
        title: "3. Exclusión de Garantías",
        subsections: [
          {
            content: 'El Servicio se proporciona "tal cual", "según disponibilidad" y "con todos sus defectos", sin garantías de ninguna naturaleza.'
          },
          {
            subtitle: "3.2 Garantías Excluidas",
            content: [
              "Disponibilidad, continuidad o tiempo de actividad del servicio",
              "Funcionamiento correcto o ausencia de errores",
              "Compatibilidad con sistemas de terceros",
              "Recepción garantizada de mensajes MQTT",
              "Integridad, completitud o persistencia de datos",
              "Activación correcta de alertas (pueden fallar, retrasarse o perderse)",
              "Exactitud de visualizaciones o cálculos",
              "Seguridad absoluta o ausencia de vulnerabilidades"
            ]
          },
          {
            subtitle: "3.3 Riesgos Reconocidos",
            content: [
              "Pérdida irreversible de datos",
              "Interrupciones prolongadas",
              "Vulnerabilidades de seguridad",
              "Incompatibilidades de navegador/dispositivo",
              "Errores en cálculos o visualizaciones",
              "Fallos en alertas (falsos positivos/negativos)"
            ]
          }
        ]
      },
      availabilityModifications: {
        title: "4. Disponibilidad y Modificaciones",
        subsections: [
          {
            subtitle: "4.1 Disponibilidad No Garantizada",
            content: "El Servicio puede ser inaccesible sin previo aviso por mantenimiento, fallos técnicos, ataques DDoS, decisión discrecional o cualquier otra causa. No se garantiza porcentaje alguno de uptime."
          },
          {
            subtitle: "4.2 Modificaciones Unilaterales",
            content: [
              "Funcionalidades del Servicio",
              "Diseño e interfaces",
              "APIs e integraciones",
              "Límites de uso",
              "Modelo de precios (introducir tarifas en servicios gratuitos)",
              "Estos Términos"
            ]
          },
          {
            subtitle: "4.3 Discontinuación",
            content: "El Servicio puede cerrarse definitivamente en cualquier momento. Se intentará notificar con 30 días de antelación cuando sea posible. No proceden reembolsos ni existe obligación de migración de datos."
          }
        ]
      },
      liabilityLimitation: {
        title: "5. Limitación de Responsabilidad",
        subsections: [
          {
            subtitle: "5.1 Exclusión Máxima",
            content: [
              "Pérdida de beneficios, ingresos o ahorros",
              "Pérdida o corrupción de datos",
              "Interrupción de negocio",
              "Daños a reputación",
              "Reclamaciones de terceros",
              "Multas o sanciones",
              "Daños indirectos, consecuentes o punitivos"
            ]
          },
          {
            subtitle: "5.2 Límite Máximo Absoluto",
            content: "La responsabilidad total agregada no excederá de: 50 EUR o el importe pagado en los últimos 12 meses, lo que sea menor. En servicios gratuitos: 0 EUR"
          },
          {
            subtitle: "5.3 Naturaleza Esencial",
            content: "El usuario reconoce que estas limitaciones son esenciales y que el Servicio no existiría sin ellas, aceptándolas voluntariamente con pleno conocimiento."
          }
        ]
      },
      indemnificationObligation: {
        title: "6. Obligación de Indemnización",
        subsections: [
          {
            subtitle: "6.1 Alcance",
            content: [
              "Uso o uso indebido del Servicio",
              "Violación de estos Términos",
              "Violación de derechos de terceros",
              "Decisiones basadas en datos del Servicio",
              "Uso para aplicaciones prohibidas",
              "Daños a terceros por uso del Servicio"
            ]
          },
          {
            subtitle: "6.3 Vigencia",
            content: "Esta obligación sobrevive a la terminación de la cuenta y cierre del Servicio."
          }
        ]
      },
      userObligations: {
        title: "7. Obligaciones del Usuario",
        subsections: [
          {
            subtitle: "7.1 Uso Adecuado",
            content: [
              "Usar el Servicio solo para fines lícitos y autorizados",
              "Respetar los usos prohibidos",
              "No intentar acceso no autorizado ni realizar ingeniería inversa",
              "No sobrecargar o dañar el Servicio"
            ]
          },
          {
            subtitle: "7.2 Seguridad",
            content: [
              "Mantener confidencialidad de credenciales",
              "Usar contraseñas robustas y únicas",
              "Activar 2FA cuando esté disponible",
              "Notificar accesos no autorizados",
              "Todas las actividades bajo su cuenta"
            ]
          },
          {
            subtitle: "7.3 Copias de Seguridad",
            content: "El usuario es exclusivamente responsable de mantener copias de seguridad de datos críticos y no depender del Servicio como sistema de almacenamiento principal."
          },
          {
            subtitle: "7.4 Validación",
            content: "El usuario debe verificar la exactitud de datos y alertas mediante fuentes independientes antes de tomar decisiones importantes."
          }
        ]
      },
      intellectualProperty: {
        title: "8. Propiedad Intelectual",
        subsections: [
          {
            content: "Todos los derechos de propiedad intelectual sobre el Servicio (código, diseño, marcas) son propiedad exclusiva del responsable. Se otorga licencia limitada, no exclusiva, intransferible y revocable para usar el Servicio conforme a estos Términos."
          },
          {
            content: "El usuario retiene propiedad de sus datos y otorga licencia al responsable para procesarlos según necesario para prestar el Servicio."
          }
        ]
      },
      durationTermination: {
        title: "9. Duración y Terminación",
        subsections: [
          {
            subtitle: "9.2 Terminación por el Usuario",
            content: "El usuario puede eliminar su cuenta en cualquier momento desde la configuración o contactando support@gisinsight.io. Efectiva tras confirmación y eliminación de datos (hasta 90 días)."
          },
          {
            subtitle: "9.3 Terminación por el Responsable",
            content: [
              "Violación de Términos",
              "Uso para aplicaciones prohibidas",
              "Uso fraudulento o ilegal",
              "Inactividad prolongada",
              "Cierre del Servicio",
              "Cualquier otra razón discrecional"
            ]
          },
          {
            subtitle: "9.4 Efectos",
            content: "Tras terminación: pérdida inmediata de acceso, eliminación de datos, sin reembolsos. Sobreviven: exclusión de garantías, limitación de responsabilidad, indemnización y resolución de disputas."
          }
        ]
      },
      termsModifications: {
        title: "10. Modificaciones de los Términos",
        subsections: [
          {
            content: "El responsable puede modificar estos Términos en cualquier momento. Las modificaciones sustanciales se notificarán por correo electrónico (7 días de antelación cuando sea posible) o aviso en plataforma."
          },
          {
            content: "El uso continuado tras las modificaciones constituye aceptación. Si no se aceptan, el usuario debe cesar el uso y eliminar su cuenta."
          }
        ]
      },
      generalProvisions: {
        title: "11. Disposiciones Generales",
        subsections: [
          {
            content: "Estos Términos y la Política de Privacidad constituyen el acuerdo íntegro entre las partes. Si alguna disposición fuera inválida, las restantes permanecerán en vigor."
          },
          {
            content: "El responsable puede ceder estos Términos libremente. El usuario no puede cederlos sin consentimiento previo escrito."
          },
          {
            content: "Las notificaciones al usuario se enviarán al correo electrónico registrado. Las notificaciones al responsable deben enviarse a legal@gisinsight.io."
          }
        ]
      },
      lawJurisdiction: {
        title: "12. Ley Aplicable y Jurisdicción",
        subsections: [
          {
            content: "Estos Términos se rigen por la legislación española."
          },
          {
            content: "Las partes se someten a los Juzgados y Tribunales de Madrid (España), renunciando expresamente a cualquier otro fuero que pudiera corresponderles."
          }
        ]
      },
      contact: {
        title: "13. Contacto",
        subsections: [
          {
            content: [
              "Soporte general: support@gisinsight.io",
              "Asuntos legales: legal@gisinsight.io",
              "Seguridad: security@gisinsight.io"
            ]
          }
        ]
      }
    },
    footer: {
      version: "Versión 1.0",
      effectiveDate: "Fecha de entrada en vigor: 10 de diciembre de 2025"
    }
  },
  en: {
    legalWarning: {
      title: "PRIOR LEGAL NOTICE",
      content: "GIS Insight is an experimental project provided without warranties. Use of the Service implies express acceptance of these terms. It is not professional software or a commercially mature product. The user assumes full responsibility for use."
    },
    sections: {
      serviceNature: {
        title: "1. Nature of Service",
        subsections: [
          {
            subtitle: "1.1 Definition",
            content: "GIS Insight is an experimental platform for real-time MQTT data visualization that allows broker connection, telemetry processing, geospatial representation, and alert configuration."
          },
          {
            subtitle: "1.2 Experimental Nature",
            content: [
              "Personal and educational project under continuous development",
              "Tool not certified for professional or industrial use",
              "Service without external audit or insurance coverage",
              "Alpha/Beta phase, unsuitable for production environments"
            ]
          },
          {
            subtitle: "1.3 Authorized Scope",
            content: [
              "Personal experimentation and educational purposes",
              "Proof of concept without operational consequences",
              "Technology demonstration and non-critical projects"
            ]
          }
        ]
      },
      prohibitedUses: {
        title: "2. Expressly Prohibited Uses",
        subsections: [
          {
            content: "Use of the Service for critical applications is strictly prohibited"
          },
          {
            subtitle: "2.1 Critical Applications",
            content: [
              "Safety and emergencies: Fire alarms, evacuation systems, disaster alerts, emergency geolocation",
              "Healthcare: Patient monitoring, medical devices, pharmaceutical dispensing, critical medical alerts",
              "Critical infrastructure: Power generation, water treatment, public transport, essential telecommunications",
              "Hazardous industrial processes: Chemical facilities, hazardous materials, risky heavy machinery",
              "Financial services: Automated trading, transaction processing, regulated systems"
            ]
          },
          {
            subtitle: "2.2 General Exclusion Criteria",
            content: [
              "Risk of death or serious injury",
              "Possibility of economic losses exceeding €1,000",
              "Risk of significant environmental damage",
              "Systems regulated by competent authorities",
              "Contracts with SLA or required certifications"
            ]
          },
          {
            subtitle: "2.3 Consequences",
            content: "Improper use constitutes material violation of these Terms and grounds for immediate account termination, with the user assuming all resulting liability."
          }
        ]
      },
      warrantyExclusion: {
        title: "3. Warranty Exclusion",
        subsections: [
          {
            content: 'The Service is provided "as is", "as available" and "with all faults", without warranties of any kind.'
          },
          {
            subtitle: "3.2 Excluded Warranties",
            content: [
              "Availability, continuity or service uptime",
              "Correct operation or absence of errors",
              "Compatibility with third-party systems",
              "Guaranteed MQTT message reception",
              "Data integrity, completeness or persistence",
              "Correct alert activation (may fail, delay or be lost)",
              "Accuracy of visualizations or calculations",
              "Absolute security or absence of vulnerabilities"
            ]
          },
          {
            subtitle: "3.3 Recognized Risks",
            content: [
              "Irreversible data loss",
              "Prolonged interruptions",
              "Security vulnerabilities",
              "Browser/device incompatibilities",
              "Errors in calculations or visualizations",
              "Alert failures (false positives/negatives)"
            ]
          }
        ]
      },
      availabilityModifications: {
        title: "4. Availability and Modifications",
        subsections: [
          {
            subtitle: "4.1 Non-Guaranteed Availability",
            content: "The Service may be inaccessible without prior notice due to maintenance, technical failures, DDoS attacks, discretionary decision or any other cause. No uptime percentage is guaranteed."
          },
          {
            subtitle: "4.2 Unilateral Modifications",
            content: [
              "Service functionalities",
              "Design and interfaces",
              "APIs and integrations",
              "Usage limits",
              "Pricing model (introduce fees for free services)",
              "These Terms"
            ]
          },
          {
            subtitle: "4.3 Discontinuation",
            content: "The Service may be permanently closed at any time. 30 days' notice will be attempted when possible. No refunds and no data migration obligation."
          }
        ]
      },
      liabilityLimitation: {
        title: "5. Limitation of Liability",
        subsections: [
          {
            subtitle: "5.1 Maximum Exclusion",
            content: [
              "Loss of profits, income or savings",
              "Data loss or corruption",
              "Business interruption",
              "Reputational damage",
              "Third-party claims",
              "Fines or penalties",
              "Indirect, consequential or punitive damages"
            ]
          },
          {
            subtitle: "5.2 Absolute Maximum Limit",
            content: "Total aggregate liability shall not exceed: €50 or the amount paid in the last 12 months, whichever is less. For free services: €0"
          },
          {
            subtitle: "5.3 Essential Nature",
            content: "User acknowledges these limitations are essential and the Service would not exist without them, accepting them voluntarily with full knowledge."
          }
        ]
      },
      indemnificationObligation: {
        title: "6. Indemnification Obligation",
        subsections: [
          {
            subtitle: "6.1 Scope",
            content: [
              "Use or misuse of the Service",
              "Violation of these Terms",
              "Violation of third-party rights",
              "Decisions based on Service data",
              "Use for prohibited applications",
              "Third-party damage from Service use"
            ]
          },
          {
            subtitle: "6.3 Term",
            content: "This obligation survives account termination and Service closure."
          }
        ]
      },
      userObligations: {
        title: "7. User Obligations",
        subsections: [
          {
            subtitle: "7.1 Proper Use",
            content: [
              "Use the Service only for lawful and authorized purposes",
              "Respect prohibited uses",
              "Do not attempt unauthorized access or reverse engineering",
              "Do not overload or damage the Service"
            ]
          },
          {
            subtitle: "7.2 Security",
            content: [
              "Maintain credential confidentiality",
              "Use strong and unique passwords",
              "Enable 2FA when available",
              "Report unauthorized access",
              "All activities under your account"
            ]
          },
          {
            subtitle: "7.3 Backups",
            content: "User is solely responsible for maintaining backups of critical data and not relying on the Service as primary storage system."
          },
          {
            subtitle: "7.4 Validation",
            content: "User must verify data and alert accuracy through independent sources before making important decisions."
          }
        ]
      },
      intellectualProperty: {
        title: "8. Intellectual Property",
        subsections: [
          {
            content: "All intellectual property rights to the Service (code, design, trademarks) are exclusive property of the responsible party. A limited, non-exclusive, non-transferable and revocable license is granted to use the Service according to these Terms."
          },
          {
            content: "User retains ownership of their data and grants license to the responsible party to process them as necessary to provide the Service."
          }
        ]
      },
      durationTermination: {
        title: "9. Duration and Termination",
        subsections: [
          {
            subtitle: "9.2 Termination by User",
            content: "User may delete their account at any time from settings or by contacting support@gisinsight.io. Effective after confirmation and data deletion (up to 90 days)."
          },
          {
            subtitle: "9.3 Termination by Responsible Party",
            content: [
              "Terms violation",
              "Use for prohibited applications",
              "Fraudulent or illegal use",
              "Prolonged inactivity",
              "Service closure",
              "Any other discretionary reason"
            ]
          },
          {
            subtitle: "9.4 Effects",
            content: "After termination: immediate loss of access, data deletion, no refunds. Surviving: warranty exclusion, liability limitation, indemnification and dispute resolution."
          }
        ]
      },
      termsModifications: {
        title: "10. Terms Modifications",
        subsections: [
          {
            content: "The responsible party may modify these Terms at any time. Substantial modifications will be notified by email (7 days' notice when possible) or platform notice."
          },
          {
            content: "Continued use after modifications constitutes acceptance. If not accepted, user must cease use and delete account."
          }
        ]
      },
      generalProvisions: {
        title: "11. General Provisions",
        subsections: [
          {
            content: "These Terms and Privacy Policy constitute the entire agreement between parties. If any provision is invalid, the remaining ones remain in force."
          },
          {
            content: "The responsible party may freely assign these Terms. User cannot assign them without prior written consent."
          },
          {
            content: "Notifications to user will be sent to registered email. Notifications to responsible party must be sent to legal@gisinsight.io."
          }
        ]
      },
      lawJurisdiction: {
        title: "12. Applicable Law and Jurisdiction",
        subsections: [
          {
            content: "These Terms are governed by Spanish law."
          },
          {
            content: "Parties submit to the Courts and Tribunals of Madrid (Spain), expressly waiving any other jurisdiction that might correspond to them."
          }
        ]
      },
      contact: {
        title: "13. Contact",
        subsections: [
          {
            content: [
              "General support: support@gisinsight.io",
              "Legal matters: legal@gisinsight.io",
              "Security: security@gisinsight.io"
            ]
          }
        ]
      }
    },
    footer: {
      version: "Version 1.0",
      effectiveDate: "Effective date: December 10, 2025"
    }
  },
  pt: {
    legalWarning: {
      title: "AVISO LEGAL PRÉVIO",
      content: "GIS Insight constitui um projeto em fase experimental fornecido sem garantias. O uso do Serviço implica a aceitação expressa destes termos. Não é software profissional nem produto comercialmente maduro. O usuário assume integralmente toda responsabilidade derivada do uso."
    },
    sections: {
      serviceNature: {
        title: "1. Natureza do Serviço",
        subsections: [
          {
            subtitle: "1.1 Definição",
            content: "GIS Insight é uma plataforma experimental de visualização de dados MQTT em tempo real que permite conexão a brokers, processamento de telemetria, representação geoespacial e configuração de alertas."
          },
          {
            subtitle: "1.2 Caráter Experimental",
            content: [
              "Projeto pessoal e educacional em desenvolvimento contínuo",
              "Ferramenta não certificada para uso profissional ou industrial",
              "Serviço sem auditoria externa nem cobertura de seguro",
              "Fase Alpha/Beta, inadequado para ambientes de produção"
            ]
          },
          {
            subtitle: "1.3 Âmbito Autorizado",
            content: [
              "Experimentação pessoal e fins educacionais",
              "Provas de conceito sem consequências operacionais",
              "Demonstração de tecnologias e projetos não críticos"
            ]
          }
        ]
      },
      prohibitedUses: {
        title: "2. Usos Expressamente Proibidos",
        subsections: [
          {
            content: "É terminantemente proibido utilizar o Serviço para aplicações críticas"
          },
          {
            subtitle: "2.1 Aplicações Críticas",
            content: [
              "Segurança e emergências: Alarmes contra incêndios, sistemas de evacuação, alertas de desastres, geolocalização de emergência",
              "Saúde: Monitorização de pacientes, dispositivos médicos, dispensação farmacêutica, alertas médicos críticos",
              "Infraestrutura crítica: Geração elétrica, tratamento de água, transporte público, telecomunicações essenciais",
              "Processos industriais perigosos: Instalações químicas, materiais perigosos, maquinaria pesada com risco",
              "Serviços financeiros: Trading automático, processamento de transações, sistemas regulados"
            ]
          },
          {
            subtitle: "2.2 Critério Geral de Exclusão",
            content: [
              "Risco de morte ou lesões graves",
              "Possibilidade de perdas econômicas superiores a €1.000",
              "Risco de danos ambientais significativos",
              "Sistemas regulados por autoridades competentes",
              "Contratos com SLA ou certificações requeridas"
            ]
          },
          {
            subtitle: "2.3 Consequências",
            content: "O uso indevido constitui violação material destes Termos e causa de cancelamento imediato de conta, assumindo o usuário toda responsabilidade derivada."
          }
        ]
      },
      warrantyExclusion: {
        title: "3. Exclusão de Garantias",
        subsections: [
          {
            content: 'O Serviço é fornecido "tal qual", "conforme disponibilidade" e "com todos os seus defeitos", sem garantias de nenhuma natureza.'
          },
          {
            subtitle: "3.2 Garantias Excluídas",
            content: [
              "Disponibilidade, continuidade ou tempo de atividade do serviço",
              "Funcionamento correto ou ausência de erros",
              "Compatibilidade com sistemas de terceiros",
              "Recepção garantida de mensagens MQTT",
              "Integridade, completude ou persistência de dados",
              "Ativação correta de alertas (podem falhar, atrasar ou perder-se)",
              "Exatidão de visualizações ou cálculos",
              "Segurança absoluta ou ausência de vulnerabilidades"
            ]
          },
          {
            subtitle: "3.3 Riscos Reconhecidos",
            content: [
              "Perda irreversível de dados",
              "Interrupções prolongadas",
              "Vulnerabilidades de segurança",
              "Incompatibilidades de navegador/dispositivo",
              "Erros em cálculos ou visualizações",
              "Falhas em alertas (falsos positivos/negativos)"
            ]
          }
        ]
      },
      availabilityModifications: {
        title: "4. Disponibilidade e Modificações",
        subsections: [
          {
            subtitle: "4.1 Disponibilidade Não Garantida",
            content: "O Serviço pode estar inacessível sem aviso prévio por manutenção, falhas técnicas, ataques DDoS, decisão discricionária ou qualquer outra causa. Não se garante percentual algum de uptime."
          },
          {
            subtitle: "4.2 Modificações Unilaterais",
            content: [
              "Funcionalidades do Serviço",
              "Design e interfaces",
              "APIs e integrações",
              "Limites de uso",
              "Modelo de preços (introduzir tarifas em serviços gratuitos)",
              "Estes Termos"
            ]
          },
          {
            subtitle: "4.3 Descontinuação",
            content: "O Serviço pode ser encerrado definitivamente a qualquer momento. Tentará notificar com 30 dias de antecedência quando possível. Não procedem reembolsos nem existe obrigação de migração de dados."
          }
        ]
      },
      liabilityLimitation: {
        title: "5. Limitação de Responsabilidade",
        subsections: [
          {
            subtitle: "5.1 Exclusão Máxima",
            content: [
              "Perda de benefícios, receitas ou poupanças",
              "Perda ou corrupção de dados",
              "Interrupção de negócio",
              "Danos à reputação",
              "Reclamações de terceiros",
              "Multas ou sanções",
              "Danos indiretos, consequentes ou punitivos"
            ]
          },
          {
            subtitle: "5.2 Limite Máximo Absoluto",
            content: "A responsabilidade total agregada não excederá: €50 ou o valor pago nos últimos 12 meses, o que for menor. Em serviços gratuitos: €0"
          },
          {
            subtitle: "5.3 Natureza Essencial",
            content: "O usuário reconhece que estas limitações são essenciais e que o Serviço não existiria sem elas, aceitando-as voluntariamente com pleno conhecimento."
          }
        ]
      },
      indemnificationObligation: {
        title: "6. Obrigação de Indenização",
        subsections: [
          {
            subtitle: "6.1 Alcance",
            content: [
              "Uso ou uso indevido do Serviço",
              "Violação destes Termos",
              "Violação de direitos de terceiros",
              "Decisões baseadas em dados do Serviço",
              "Uso para aplicações proibidas",
              "Danos a terceiros por uso do Serviço"
            ]
          },
          {
            subtitle: "6.3 Vigência",
            content: "Esta obrigação sobrevive ao término da conta e encerramento do Serviço."
          }
        ]
      },
      userObligations: {
        title: "7. Obrigações do Usuário",
        subsections: [
          {
            subtitle: "7.1 Uso Adequado",
            content: [
              "Usar o Serviço apenas para fins lícitos e autorizados",
              "Respeitar os usos proibidos",
              "Não tentar acesso não autorizado nem realizar engenharia reversa",
              "Não sobrecarregar ou danificar o Serviço"
            ]
          },
          {
            subtitle: "7.2 Segurança",
            content: [
              "Manter confidencialidade de credenciais",
              "Usar senhas robustas e únicas",
              "Ativar 2FA quando estiver disponível",
              "Notificar acessos não autorizados",
              "Todas as atividades sob sua conta"
            ]
          },
          {
            subtitle: "7.3 Cópias de Segurança",
            content: "O usuário é exclusivamente responsável por manter cópias de segurança de dados críticos e não depender do Serviço como sistema de armazenamento principal."
          },
          {
            subtitle: "7.4 Validação",
            content: "O usuário deve verificar a exatidão de dados e alertas mediante fontes independentes antes de tomar decisões importantes."
          }
        ]
      },
      intellectualProperty: {
        title: "8. Propriedade Intelectual",
        subsections: [
          {
            content: "Todos os direitos de propriedade intelectual sobre o Serviço (código, design, marcas) são propriedade exclusiva do responsável. Outorga-se licença limitada, não exclusiva, intransferível e revogável para usar o Serviço conforme estes Termos."
          },
          {
            content: "O usuário retém propriedade de seus dados e outorga licença ao responsável para processá-los segundo necessário para prestar o Serviço."
          }
        ]
      },
      durationTermination: {
        title: "9. Duração e Término",
        subsections: [
          {
            subtitle: "9.2 Término pelo Usuário",
            content: "O usuário pode eliminar sua conta a qualquer momento desde a configuração ou contactando support@gisinsight.io. Efetiva após confirmação e eliminação de dados (até 90 dias)."
          },
          {
            subtitle: "9.3 Término pelo Responsável",
            content: [
              "Violação de Termos",
              "Uso para aplicações proibidas",
              "Uso fraudulento ou ilegal",
              "Inatividade prolongada",
              "Encerramento do Serviço",
              "Qualquer outra razão discricionária"
            ]
          },
          {
            subtitle: "9.4 Efeitos",
            content: "Após término: perda imediata de acesso, eliminação de dados, sem reembolsos. Sobrevivem: exclusão de garantias, limitação de responsabilidade, indenização e resolução de disputas."
          }
        ]
      },
      termsModifications: {
        title: "10. Modificações dos Termos",
        subsections: [
          {
            content: "O responsável pode modificar estes Termos a qualquer momento. As modificações substanciais serão notificadas por correio eletrônico (7 dias de antecedência quando possível) ou aviso em plataforma."
          },
          {
            content: "O uso continuado após as modificações constitui aceitação. Se não se aceitam, o usuário deve cessar o uso e eliminar sua conta."
          }
        ]
      },
      generalProvisions: {
        title: "11. Disposições Gerais",
        subsections: [
          {
            content: "Estes Termos e a Política de Privacidade constituem o acordo íntegro entre as partes. Se alguma disposição for inválida, as restantes permanecerão em vigor."
          },
          {
            content: "O responsável pode ceder estes Termos livremente. O usuário não pode cedê-los sem consentimento prévio escrito."
          },
          {
            content: "As notificações ao usuário serão enviadas ao correio eletrônico registrado. As notificações ao responsável devem ser enviadas a legal@gisinsight.io."
          }
        ]
      },
      lawJurisdiction: {
        title: "12. Lei Aplicável e Jurisdição",
        subsections: [
          {
            content: "Estes Termos regem-se pela legislação espanhola."
          },
          {
            content: "As partes submetem-se aos Juízos e Tribunais de Madrid (Espanha), renunciando expressamente a qualquer outro foro que pudesse corresponder-lhes."
          }
        ]
      },
      contact: {
        title: "13. Contato",
        subsections: [
          {
            content: [
              "Suporte geral: support@gisinsight.io",
              "Assuntos legais: legal@gisinsight.io",
              "Segurança: security@gisinsight.io"
            ]
          }
        ]
      }
    },
    footer: {
      version: "Versão 1.0",
      effectiveDate: "Data de entrada em vigor: 10 de dezembro de 2025"
    }
  },
  ja: {
    legalWarning: {
      title: "事前法的通知",
      content: "GIS Insightは保証なしで提供される実験的プロジェクトです。本サービスの使用は、本規約の明示的な承諾を意味します。これは専門的なソフトウェアでも商業的に成熟した製品でもありません。ユーザーは使用から生じるすべての責任を負います。"
    },
    sections: {
      serviceNature: {
        title: "1. サービスの性質",
        subsections: [
          {
            subtitle: "1.1 定義",
            content: "GIS Insightは、ブローカーへの接続、テレメトリ処理、地理空間表現、アラート設定を可能にするリアルタイムMQTTデータ視覚化の実験的プラットフォームです。"
          },
          {
            subtitle: "1.2 実験的性質",
            content: [
              "継続的開発中の個人的・教育的プロジェクト",
              "専門的・産業的使用には認定されていないツール",
              "外部監査や保険対象なしのサービス",
              "アルファ/ベータ段階で、本番環境には不適切"
            ]
          },
          {
            subtitle: "1.3 許可範囲",
            content: [
              "個人的な実験と教育目的",
              "運用上の影響のない概念実証",
              "技術デモンストレーションと非クリティカルプロジェクト"
            ]
          }
        ]
      },
      prohibitedUses: {
        title: "2. 明示的に禁止される使用",
        subsections: [
          {
            content: "クリティカルアプリケーションへのサービス使用は厳重に禁止されています"
          },
          {
            subtitle: "2.1 クリティカルアプリケーション",
            content: [
              "安全と緊急事態：火災警報、避難システム、災害警報、緊急位置情報",
              "医療：患者モニタリング、医療機器、薬剤調剤、重大な医療警報",
              "重要インフラ：発電、水処理、公共交通、必須通信",
              "危険な産業プロセス：化学施設、危険物質、リスクのある重機械",
              "金融サービス：自動取引、取引処理、規制システム"
            ]
          },
          {
            subtitle: "2.2 一般除外基準",
            content: [
              "死亡または重傷のリスク",
              "€1,000を超える経済的損失の可能性",
              "重大な環境被害のリスク",
              "所轄当局により規制されているシステム",
              "SLAまたは必要な認証を伴う契約"
            ]
          },
          {
            subtitle: "2.3 結果",
            content: "不適切な使用は本規約の重大な違反を構成し、即時アカウント解約の原因となり、ユーザーはすべての派生責任を負います。"
          }
        ]
      },
      warrantyExclusion: {
        title: "3. 保証の除外",
        subsections: [
          {
            content: 'サービスは「現状のまま」、「利用可能な状態で」、「すべての欠陥を含めて」提供され、いかなる種類の保証もありません。'
          },
          {
            subtitle: "3.2 除外される保証",
            content: [
              "サービスの可用性、継続性、または稼働時間",
              "正しい動作またはエラーの不在",
              "サードパーティシステムとの互換性",
              "MQTTメッセージの保証された受信",
              "データの完全性、完全性、または永続性",
              "アラートの正しい起動（失敗、遅延、または喪失の可能性）",
              "視覚化または計算の正確性",
              "絶対的なセキュリティまたは脆弱性の不在"
            ]
          },
          {
            subtitle: "3.3 認識されたリスク",
            content: [
              "不可逆的なデータ損失",
              "長期の中断",
              "セキュリティの脆弱性",
              "ブラウザ/デバイスの非互換性",
              "計算または視覚化のエラー",
              "アラートの失敗（偽陽性/偽陰性）"
            ]
          }
        ]
      },
      availabilityModifications: {
        title: "4. 可用性と変更",
        subsections: [
          {
            subtitle: "4.1 保証されない可用性",
            content: "サービスは、メンテナンス、技術的障害、DDoS攻撃、裁量的決定、またはその他の原因により、事前通知なしにアクセス不能になる可能性があります。稼働時間の割合は保証されません。"
          },
          {
            subtitle: "4.2 一方的な変更",
            content: [
              "サービスの機能",
              "デザインとインターフェース",
              "APIと統合",
              "使用制限",
              "価格モデル（無料サービスへの料金導入）",
              "本規約"
            ]
          },
          {
            subtitle: "4.3 廃止",
            content: "サービスはいつでも恒久的に閉鎖される可能性があります。可能な場合は30日前の通知を試みます。返金なし、データ移行の義務もありません。"
          }
        ]
      },
      liabilityLimitation: {
        title: "5. 責任の制限",
        subsections: [
          {
            subtitle: "5.1 最大除外",
            content: [
              "利益、収入、または貯蓄の損失",
              "データの損失または破損",
              "事業中断",
              "評判への損害",
              "第三者の請求",
              "罰金または制裁",
              "間接的、派生的、または懲罰的損害"
            ]
          },
          {
            subtitle: "5.2 絶対最大制限",
            content: "総合計責任は次を超えません：€50または過去12か月に支払われた金額のいずれか少ない方。無料サービスの場合：€0"
          },
          {
            subtitle: "5.3 本質的性質",
            content: "ユーザーは、これらの制限が不可欠であり、サービスはこれらなしには存在しないことを認識し、完全な知識をもって自発的にこれらを受け入れます。"
          }
        ]
      },
      indemnificationObligation: {
        title: "6. 補償義務",
        subsections: [
          {
            subtitle: "6.1 範囲",
            content: [
              "サービスの使用または誤用",
              "本規約の違反",
              "第三者の権利の侵害",
              "サービスデータに基づく決定",
              "禁止されたアプリケーションへの使用",
              "サービス使用による第三者への損害"
            ]
          },
          {
            subtitle: "6.3 期間",
            content: "この義務はアカウント終了およびサービス閉鎖後も存続します。"
          }
        ]
      },
      userObligations: {
        title: "7. ユーザーの義務",
        subsections: [
          {
            subtitle: "7.1 適切な使用",
            content: [
              "合法的かつ許可された目的のみにサービスを使用する",
              "禁止された使用を尊重する",
              "不正アクセスやリバースエンジニアリングを試みない",
              "サービスに過負荷をかけたり損傷を与えたりしない"
            ]
          },
          {
            subtitle: "7.2 セキュリティ",
            content: [
              "認証情報の機密性を維持する",
              "強力でユニークなパスワードを使用する",
              "利用可能な場合は2FAを有効にする",
              "不正アクセスを通知する",
              "アカウント下のすべての活動"
            ]
          },
          {
            subtitle: "7.3 バックアップ",
            content: "ユーザーは重要なデータのバックアップを維持し、サービスを主要なストレージシステムとして依存しないことについて独自に責任を負います。"
          },
          {
            subtitle: "7.4 検証",
            content: "ユーザーは重要な決定を下す前に、独立した情報源を通じてデータとアラートの正確性を検証する必要があります。"
          }
        ]
      },
      intellectualProperty: {
        title: "8. 知的財産",
        subsections: [
          {
            content: "サービスに関するすべての知的財産権（コード、デザイン、商標）は責任者の専有財産です。本規約に従ってサービスを使用するための限定的、非独占的、譲渡不可、取消可能なライセンスが付与されます。"
          },
          {
            content: "ユーザーは自分のデータの所有権を保持し、サービスを提供するために必要に応じてそれらを処理するためのライセンスを責任者に付与します。"
          }
        ]
      },
      durationTermination: {
        title: "9. 期間と終了",
        subsections: [
          {
            subtitle: "9.2 ユーザーによる終了",
            content: "ユーザーは設定からいつでもアカウントを削除するか、support@gisinsight.ioに連絡することができます。確認とデータ削除後に有効（最大90日）。"
          },
          {
            subtitle: "9.3 責任者による終了",
            content: [
              "規約違反",
              "禁止されたアプリケーションへの使用",
              "不正または違法な使用",
              "長期の非アクティブ",
              "サービス閉鎖",
              "その他の裁量的理由"
            ]
          },
          {
            subtitle: "9.4 効果",
            content: "終了後：即時アクセス喪失、データ削除、返金なし。存続：保証除外、責任制限、補償、および紛争解決。"
          }
        ]
      },
      termsModifications: {
        title: "10. 規約の変更",
        subsections: [
          {
            content: "責任者はいつでも本規約を変更できます。実質的な変更は電子メール（可能な場合は7日前の通知）またはプラットフォーム通知により通知されます。"
          },
          {
            content: "変更後の継続使用は承諾を構成します。承諾されない場合、ユーザーは使用を中止し、アカウントを削除する必要があります。"
          }
        ]
      },
      generalProvisions: {
        title: "11. 一般規定",
        subsections: [
          {
            content: "本規約とプライバシーポリシーは当事者間の完全な合意を構成します。いずれかの規定が無効である場合、残りの規定は効力を維持します。"
          },
          {
            content: "責任者は本規約を自由に譲渡できます。ユーザーは事前の書面による同意なしに譲渡できません。"
          },
          {
            content: "ユーザーへの通知は登録された電子メールに送信されます。責任者への通知はlegal@gisinsight.ioに送信する必要があります。"
          }
        ]
      },
      lawJurisdiction: {
        title: "12. 準拠法と管轄",
        subsections: [
          {
            content: "本規約はスペイン法に準拠します。"
          },
          {
            content: "当事者はマドリード（スペイン）の裁判所および法廷に服し、対応する可能性のある他の管轄権を明示的に放棄します。"
          }
        ]
      },
      contact: {
        title: "13. 連絡先",
        subsections: [
          {
            content: [
              "一般サポート：support@gisinsight.io",
              "法的事項：legal@gisinsight.io",
              "セキュリティ：security@gisinsight.io"
            ]
          }
        ]
      }
    },
    footer: {
      version: "バージョン1.0",
      effectiveDate: "発効日：2025年12月10日"
    }
  },
  fr: {
    legalWarning: {
      title: "AVIS JURIDIQUE PRÉALABLE",
      content: "GIS Insight constitue un projet en phase expérimentale fourni sans garanties. L'utilisation du Service implique l'acceptation expresse de ces conditions. Ce n'est pas un logiciel professionnel ni un produit commercialement mature. L'utilisateur assume intégralement toute responsabilité découlant de l'utilisation."
    },
    sections: {
      serviceNature: {
        title: "1. Nature du Service",
        subsections: [
          {
            subtitle: "1.1 Définition",
            content: "GIS Insight est une plateforme expérimentale de visualisation de données MQTT en temps réel permettant la connexion aux brokers, le traitement de la télémétrie, la représentation géospatiale et la configuration d'alertes."
          },
          {
            subtitle: "1.2 Caractère Expérimental",
            content: [
              "Projet personnel et éducatif en développement continu",
              "Outil non certifié pour usage professionnel ou industriel",
              "Service sans audit externe ni couverture d'assurance",
              "Phase Alpha/Beta, inadéquat pour environnements de production"
            ]
          },
          {
            subtitle: "1.3 Cadre Autorisé",
            content: [
              "Expérimentation personnelle et fins éducatives",
              "Preuves de concept sans conséquences opérationnelles",
              "Démonstration de technologies et projets non critiques"
            ]
          }
        ]
      },
      prohibitedUses: {
        title: "2. Usages Expressément Interdits",
        subsections: [
          {
            content: "Il est formellement interdit d'utiliser le Service pour des applications critiques"
          },
          {
            subtitle: "2.1 Applications Critiques",
            content: [
              "Sécurité et urgences : Alarmes incendie, systèmes d'évacuation, alertes de catastrophes, géolocalisation d'urgence",
              "Santé : Surveillance des patients, dispositifs médicaux, dispensation pharmaceutique, alertes médicales critiques",
              "Infrastructure critique : Production électrique, traitement de l'eau, transport public, télécommunications essentielles",
              "Processus industriels dangereux : Installations chimiques, matières dangereuses, machines lourdes à risque",
              "Services financiers : Trading automatique, traitement de transactions, systèmes régulés"
            ]
          },
          {
            subtitle: "2.2 Critère Général d'Exclusion",
            content: [
              "Risque de décès ou blessures graves",
              "Possibilité de pertes économiques supérieures à 1 000 €",
              "Risque de dommages environnementaux significatifs",
              "Systèmes régulés par les autorités compétentes",
              "Contrats avec SLA ou certifications requises"
            ]
          },
          {
            subtitle: "2.3 Conséquences",
            content: "L'usage abusif constitue une violation matérielle de ces Conditions et cause de résiliation immédiate du compte, l'utilisateur assumant toute responsabilité découlant."
          }
        ]
      },
      warrantyExclusion: {
        title: "3. Exclusion de Garanties",
        subsections: [
          {
            content: 'Le Service est fourni "tel quel", "selon disponibilité" et "avec tous ses défauts", sans garanties d\'aucune nature.'
          },
          {
            subtitle: "3.2 Garanties Exclues",
            content: [
              "Disponibilité, continuité ou temps d'activité du service",
              "Fonctionnement correct ou absence d'erreurs",
              "Compatibilité avec les systèmes tiers",
              "Réception garantie des messages MQTT",
              "Intégrité, complétude ou persistance des données",
              "Activation correcte des alertes (peuvent échouer, retarder ou se perdre)",
              "Exactitude des visualisations ou calculs",
              "Sécurité absolue ou absence de vulnérabilités"
            ]
          },
          {
            subtitle: "3.3 Risques Reconnus",
            content: [
              "Perte irréversible de données",
              "Interruptions prolongées",
              "Vulnérabilités de sécurité",
              "Incompatibilités navigateur/appareil",
              "Erreurs dans les calculs ou visualisations",
              "Défaillances d'alertes (faux positifs/négatifs)"
            ]
          }
        ]
      },
      availabilityModifications: {
        title: "4. Disponibilité et Modifications",
        subsections: [
          {
            subtitle: "4.1 Disponibilité Non Garantie",
            content: "Le Service peut être inaccessible sans préavis pour maintenance, pannes techniques, attaques DDoS, décision discrétionnaire ou toute autre cause. Aucun pourcentage de disponibilité n'est garanti."
          },
          {
            subtitle: "4.2 Modifications Unilatérales",
            content: [
              "Fonctionnalités du Service",
              "Design et interfaces",
              "APIs et intégrations",
              "Limites d'utilisation",
              "Modèle de tarification (introduire des frais pour services gratuits)",
              "Ces Conditions"
            ]
          },
          {
            subtitle: "4.3 Discontinuation",
            content: "Le Service peut être fermé définitivement à tout moment. Une notification de 30 jours sera tentée lorsque possible. Aucun remboursement ni obligation de migration de données."
          }
        ]
      },
      liabilityLimitation: {
        title: "5. Limitation de Responsabilité",
        subsections: [
          {
            subtitle: "5.1 Exclusion Maximale",
            content: [
              "Perte de bénéfices, revenus ou économies",
              "Perte ou corruption de données",
              "Interruption d'activité",
              "Dommages à la réputation",
              "Réclamations de tiers",
              "Amendes ou sanctions",
              "Dommages indirects, consécutifs ou punitifs"
            ]
          },
          {
            subtitle: "5.2 Limite Maximale Absolue",
            content: "La responsabilité totale agrégée ne dépassera pas : 50 € ou le montant payé au cours des 12 derniers mois, selon le moins élevé. Pour les services gratuits : 0 €"
          },
          {
            subtitle: "5.3 Nature Essentielle",
            content: "L'utilisateur reconnaît que ces limitations sont essentielles et que le Service n'existerait pas sans elles, les acceptant volontairement en pleine connaissance."
          }
        ]
      },
      indemnificationObligation: {
        title: "6. Obligation d'Indemnisation",
        subsections: [
          {
            subtitle: "6.1 Portée",
            content: [
              "Utilisation ou usage abusif du Service",
              "Violation de ces Conditions",
              "Violation des droits de tiers",
              "Décisions basées sur les données du Service",
              "Utilisation pour applications interdites",
              "Dommages à des tiers par utilisation du Service"
            ]
          },
          {
            subtitle: "6.3 Durée",
            content: "Cette obligation survit à la résiliation du compte et à la fermeture du Service."
          }
        ]
      },
      userObligations: {
        title: "7. Obligations de l'Utilisateur",
        subsections: [
          {
            subtitle: "7.1 Usage Approprié",
            content: [
              "Utiliser le Service uniquement à des fins licites et autorisées",
              "Respecter les usages interdits",
              "Ne pas tenter d'accès non autorisé ni réaliser d'ingénierie inverse",
              "Ne pas surcharger ou endommager le Service"
            ]
          },
          {
            subtitle: "7.2 Sécurité",
            content: [
              "Maintenir la confidentialité des identifiants",
              "Utiliser des mots de passe robustes et uniques",
              "Activer 2FA lorsque disponible",
              "Notifier les accès non autorisés",
              "Toutes les activités sous votre compte"
            ]
          },
          {
            subtitle: "7.3 Sauvegardes",
            content: "L'utilisateur est exclusivement responsable de maintenir des sauvegardes de données critiques et de ne pas dépendre du Service comme système de stockage principal."
          },
          {
            subtitle: "7.4 Validation",
            content: "L'utilisateur doit vérifier l'exactitude des données et alertes via des sources indépendantes avant de prendre des décisions importantes."
          }
        ]
      },
      intellectualProperty: {
        title: "8. Propriété Intellectuelle",
        subsections: [
          {
            content: "Tous les droits de propriété intellectuelle sur le Service (code, design, marques) sont la propriété exclusive du responsable. Une licence limitée, non exclusive, incessible et révocable est accordée pour utiliser le Service conformément à ces Conditions."
          },
          {
            content: "L'utilisateur conserve la propriété de ses données et accorde au responsable une licence pour les traiter selon nécessaire pour fournir le Service."
          }
        ]
      },
      durationTermination: {
        title: "9. Durée et Résiliation",
        subsections: [
          {
            subtitle: "9.2 Résiliation par l'Utilisateur",
            content: "L'utilisateur peut supprimer son compte à tout moment depuis les paramètres ou en contactant support@gisinsight.io. Effective après confirmation et suppression des données (jusqu'à 90 jours)."
          },
          {
            subtitle: "9.3 Résiliation par le Responsable",
            content: [
              "Violation des Conditions",
              "Utilisation pour applications interdites",
              "Utilisation frauduleuse ou illégale",
              "Inactivité prolongée",
              "Fermeture du Service",
              "Toute autre raison discrétionnaire"
            ]
          },
          {
            subtitle: "9.4 Effets",
            content: "Après résiliation : perte immédiate d'accès, suppression des données, aucun remboursement. Survivent : exclusion de garanties, limitation de responsabilité, indemnisation et résolution de litiges."
          }
        ]
      },
      termsModifications: {
        title: "10. Modifications des Conditions",
        subsections: [
          {
            content: "Le responsable peut modifier ces Conditions à tout moment. Les modifications substantielles seront notifiées par email (préavis de 7 jours lorsque possible) ou avis sur la plateforme."
          },
          {
            content: "L'utilisation continue après les modifications constitue une acceptation. Si non acceptées, l'utilisateur doit cesser l'utilisation et supprimer son compte."
          }
        ]
      },
      generalProvisions: {
        title: "11. Dispositions Générales",
        subsections: [
          {
            content: "Ces Conditions et la Politique de Confidentialité constituent l'accord intégral entre les parties. Si une disposition est invalide, les autres restent en vigueur."
          },
          {
            content: "Le responsable peut céder ces Conditions librement. L'utilisateur ne peut les céder sans consentement écrit préalable."
          },
          {
            content: "Les notifications à l'utilisateur seront envoyées à l'email enregistré. Les notifications au responsable doivent être envoyées à legal@gisinsight.io."
          }
        ]
      },
      lawJurisdiction: {
        title: "12. Loi Applicable et Juridiction",
        subsections: [
          {
            content: "Ces Conditions sont régies par la législation espagnole."
          },
          {
            content: "Les parties se soumettent aux Tribunaux de Madrid (Espagne), renonçant expressément à toute autre juridiction qui pourrait leur correspondre."
          }
        ]
      },
      contact: {
        title: "13. Contact",
        subsections: [
          {
            content: [
              "Support général : support@gisinsight.io",
              "Affaires juridiques : legal@gisinsight.io",
              "Sécurité : security@gisinsight.io"
            ]
          }
        ]
      }
    },
    footer: {
      version: "Version 1.0",
      effectiveDate: "Date d'entrée en vigueur : 10 décembre 2025"
    }
  },
  de: {
    legalWarning: {
      title: "VORHERIGE RECHTLICHE MITTEILUNG",
      content: "GIS Insight ist ein experimentelles Projekt, das ohne Garantien bereitgestellt wird. Die Nutzung des Dienstes impliziert die ausdrückliche Annahme dieser Bedingungen. Es handelt sich nicht um professionelle Software oder ein kommerziell ausgereiftes Produkt. Der Benutzer übernimmt die volle Verantwortung für die Nutzung."
    },
    sections: {
      serviceNature: {
        title: "1. Art des Dienstes",
        subsections: [
          {
            subtitle: "1.1 Definition",
            content: "GIS Insight ist eine experimentelle Plattform zur Echtzeit-Visualisierung von MQTT-Daten, die Broker-Verbindung, Telemetrieverarbeitung, geospatiale Darstellung und Alarmkonfiguration ermöglicht."
          },
          {
            subtitle: "1.2 Experimenteller Charakter",
            content: [
              "Persönliches und pädagogisches Projekt in kontinuierlicher Entwicklung",
              "Werkzeug nicht zertifiziert für professionelle oder industrielle Nutzung",
              "Dienst ohne externe Prüfung oder Versicherungsschutz",
              "Alpha/Beta-Phase, ungeeignet für Produktionsumgebungen"
            ]
          },
          {
            subtitle: "1.3 Autorisierter Umfang",
            content: [
              "Persönliches Experimentieren und Bildungszwecke",
              "Proof of Concept ohne betriebliche Konsequenzen",
              "Technologiedemonstration und nicht-kritische Projekte"
            ]
          }
        ]
      },
      prohibitedUses: {
        title: "2. Ausdrücklich Verbotene Verwendungen",
        subsections: [
          {
            content: "Die Verwendung des Dienstes für kritische Anwendungen ist strengstens untersagt"
          },
          {
            subtitle: "2.1 Kritische Anwendungen",
            content: [
              "Sicherheit und Notfälle: Feueralarme, Evakuierungssysteme, Katastrophenwarnungen, Notfall-Geolokalisierung",
              "Gesundheitswesen: Patientenüberwachung, medizinische Geräte, pharmazeutische Ausgabe, kritische medizinische Alarme",
              "Kritische Infrastruktur: Stromerzeugung, Wasseraufbereitung, öffentlicher Verkehr, wesentliche Telekommunikation",
              "Gefährliche Industrieprozesse: Chemische Anlagen, Gefahrstoffe, risikobehaftete Schwermaschinerie",
              "Finanzdienstleistungen: Automatisierter Handel, Transaktionsverarbeitung, regulierte Systeme"
            ]
          },
          {
            subtitle: "2.2 Allgemeines Ausschlusskriterium",
            content: [
              "Risiko von Tod oder schweren Verletzungen",
              "Möglichkeit wirtschaftlicher Verluste über 1.000 €",
              "Risiko erheblicher Umweltschäden",
              "Von zuständigen Behörden regulierte Systeme",
              "Verträge mit SLA oder erforderlichen Zertifizierungen"
            ]
          },
          {
            subtitle: "2.3 Konsequenzen",
            content: "Unsachgemäße Nutzung stellt einen wesentlichen Verstoß gegen diese Bedingungen dar und ist Grund für sofortige Kontokündigung, wobei der Benutzer die gesamte resultierende Haftung übernimmt."
          }
        ]
      },
      warrantyExclusion: {
        title: "3. Gewährleistungsausschluss",
        subsections: [
          {
            content: 'Der Dienst wird "wie besehen", "wie verfügbar" und "mit allen Mängeln" bereitgestellt, ohne Garantien jeglicher Art.'
          },
          {
            subtitle: "3.2 Ausgeschlossene Garantien",
            content: [
              "Verfügbarkeit, Kontinuität oder Betriebszeit des Dienstes",
              "Korrekter Betrieb oder Fehlerfreiheit",
              "Kompatibilität mit Drittanbietersystemen",
              "Garantierter MQTT-Nachrichtenempfang",
              "Datenintegrität, Vollständigkeit oder Persistenz",
              "Korrekte Alarmaktivierung (können fehlschlagen, sich verzögern oder verloren gehen)",
              "Genauigkeit von Visualisierungen oder Berechnungen",
              "Absolute Sicherheit oder Fehlen von Schwachstellen"
            ]
          },
          {
            subtitle: "3.3 Anerkannte Risiken",
            content: [
              "Irreversibler Datenverlust",
              "Längere Unterbrechungen",
              "Sicherheitsschwachstellen",
              "Browser/Gerät-Inkompatibilitäten",
              "Fehler in Berechnungen oder Visualisierungen",
              "Alarmausfälle (Fehlalarme/Falschnegative)"
            ]
          }
        ]
      },
      availabilityModifications: {
        title: "4. Verfügbarkeit und Änderungen",
        subsections: [
          {
            subtitle: "4.1 Nicht Garantierte Verfügbarkeit",
            content: "Der Dienst kann ohne Vorankündigung aufgrund von Wartung, technischen Ausfällen, DDoS-Angriffen, diskretionärer Entscheidung oder aus anderen Gründen nicht zugänglich sein. Es wird kein Prozentsatz der Betriebszeit garantiert."
          },
          {
            subtitle: "4.2 Einseitige Änderungen",
            content: [
              "Dienstfunktionalitäten",
              "Design und Schnittstellen",
              "APIs und Integrationen",
              "Nutzungsgrenzen",
              "Preismodell (Einführung von Gebühren für kostenlose Dienste)",
              "Diese Bedingungen"
            ]
          },
          {
            subtitle: "4.3 Einstellung",
            content: "Der Dienst kann jederzeit endgültig geschlossen werden. Eine Benachrichtigung 30 Tage im Voraus wird versucht, wenn möglich. Keine Rückerstattungen und keine Datenmigrationspflicht."
          }
        ]
      },
      liabilityLimitation: {
        title: "5. Haftungsbeschränkung",
        subsections: [
          {
            subtitle: "5.1 Maximaler Ausschluss",
            content: [
              "Verlust von Gewinnen, Einnahmen oder Ersparnissen",
              "Datenverlust oder -beschädigung",
              "Geschäftsunterbrechung",
              "Reputationsschäden",
              "Ansprüche Dritter",
              "Bußgelder oder Strafen",
              "Indirekte, Folge- oder Strafschäden"
            ]
          },
          {
            subtitle: "5.2 Absolute Höchstgrenze",
            content: "Die gesamte aggregierte Haftung überschreitet nicht: 50 € oder den in den letzten 12 Monaten gezahlten Betrag, je nachdem, welcher Betrag niedriger ist. Für kostenlose Dienste: 0 €"
          },
          {
            subtitle: "5.3 Wesentliche Natur",
            content: "Der Benutzer erkennt an, dass diese Beschränkungen wesentlich sind und der Dienst ohne sie nicht existieren würde, und akzeptiert sie freiwillig mit vollem Wissen."
          }
        ]
      },
      indemnificationObligation: {
        title: "6. Freistellungsverpflichtung",
        subsections: [
          {
            subtitle: "6.1 Umfang",
            content: [
              "Nutzung oder Missbrauch des Dienstes",
              "Verstoß gegen diese Bedingungen",
              "Verletzung von Rechten Dritter",
              "Entscheidungen basierend auf Dienstdaten",
              "Verwendung für verbotene Anwendungen",
              "Schäden Dritter durch Dienstnutzung"
            ]
          },
          {
            subtitle: "6.3 Laufzeit",
            content: "Diese Verpflichtung besteht nach Kontobeendigung und Dienstschließung fort."
          }
        ]
      },
      userObligations: {
        title: "7. Benutzerpflichten",
        subsections: [
          {
            subtitle: "7.1 Angemessene Nutzung",
            content: [
              "Den Dienst nur für rechtmäßige und autorisierte Zwecke verwenden",
              "Verbotene Verwendungen respektieren",
              "Keinen unbefugten Zugriff oder Reverse Engineering versuchen",
              "Den Dienst nicht überlasten oder beschädigen"
            ]
          },
          {
            subtitle: "7.2 Sicherheit",
            content: [
              "Vertraulichkeit der Anmeldedaten wahren",
              "Starke und eindeutige Passwörter verwenden",
              "2FA aktivieren, wenn verfügbar",
              "Unbefugten Zugriff melden",
              "Alle Aktivitäten unter Ihrem Konto"
            ]
          },
          {
            subtitle: "7.3 Backups",
            content: "Der Benutzer ist allein verantwortlich für die Aufbewahrung von Backups kritischer Daten und darf sich nicht auf den Dienst als primäres Speichersystem verlassen."
          },
          {
            subtitle: "7.4 Validierung",
            content: "Der Benutzer muss die Genauigkeit von Daten und Alarmen durch unabhängige Quellen überprüfen, bevor wichtige Entscheidungen getroffen werden."
          }
        ]
      },
      intellectualProperty: {
        title: "8. Geistiges Eigentum",
        subsections: [
          {
            content: "Alle Rechte an geistigem Eigentum am Dienst (Code, Design, Marken) sind ausschließliches Eigentum des Verantwortlichen. Es wird eine begrenzte, nicht-exklusive, nicht übertragbare und widerrufliche Lizenz zur Nutzung des Dienstes gemäß diesen Bedingungen gewährt."
          },
          {
            content: "Der Benutzer behält das Eigentum an seinen Daten und gewährt dem Verantwortlichen eine Lizenz zur Verarbeitung nach Bedarf zur Bereitstellung des Dienstes."
          }
        ]
      },
      durationTermination: {
        title: "9. Laufzeit und Beendigung",
        subsections: [
          {
            subtitle: "9.2 Beendigung durch Benutzer",
            content: "Der Benutzer kann sein Konto jederzeit aus den Einstellungen löschen oder support@gisinsight.io kontaktieren. Wirksam nach Bestätigung und Datenlöschung (bis zu 90 Tage)."
          },
          {
            subtitle: "9.3 Beendigung durch Verantwortlichen",
            content: [
              "Verstoß gegen Bedingungen",
              "Verwendung für verbotene Anwendungen",
              "Betrügerische oder illegale Nutzung",
              "Längere Inaktivität",
              "Dienstschließung",
              "Jeder andere diskretionäre Grund"
            ]
          },
          {
            subtitle: "9.4 Auswirkungen",
            content: "Nach Beendigung: sofortiger Zugriffsverlust, Datenlöschung, keine Rückerstattungen. Fortbestehend: Gewährleistungsausschluss, Haftungsbeschränkung, Freistellung und Streitbeilegung."
          }
        ]
      },
      termsModifications: {
        title: "10. Änderungen der Bedingungen",
        subsections: [
          {
            content: "Der Verantwortliche kann diese Bedingungen jederzeit ändern. Wesentliche Änderungen werden per E-Mail (7 Tage Vorankündigung, wenn möglich) oder Plattform-Benachrichtigung mitgeteilt."
          },
          {
            content: "Die fortgesetzte Nutzung nach Änderungen stellt eine Annahme dar. Wenn nicht akzeptiert, muss der Benutzer die Nutzung einstellen und sein Konto löschen."
          }
        ]
      },
      generalProvisions: {
        title: "11. Allgemeine Bestimmungen",
        subsections: [
          {
            content: "Diese Bedingungen und die Datenschutzrichtlinie bilden die gesamte Vereinbarung zwischen den Parteien. Wenn eine Bestimmung ungültig ist, bleiben die übrigen in Kraft."
          },
          {
            content: "Der Verantwortliche kann diese Bedingungen frei übertragen. Der Benutzer kann sie nicht ohne vorherige schriftliche Zustimmung übertragen."
          },
          {
            content: "Benachrichtigungen an den Benutzer werden an die registrierte E-Mail gesendet. Benachrichtigungen an den Verantwortlichen müssen an legal@gisinsight.io gesendet werden."
          }
        ]
      },
      lawJurisdiction: {
        title: "12. Anwendbares Recht und Gerichtsstand",
        subsections: [
          {
            content: "Diese Bedingungen unterliegen spanischem Recht."
          },
          {
            content: "Die Parteien unterwerfen sich den Gerichten von Madrid (Spanien) und verzichten ausdrücklich auf jeden anderen Gerichtsstand, der ihnen zustehen könnte."
          }
        ]
      },
      contact: {
        title: "13. Kontakt",
        subsections: [
          {
            content: [
              "Allgemeiner Support: support@gisinsight.io",
              "Rechtsangelegenheiten: legal@gisinsight.io",
              "Sicherheit: security@gisinsight.io"
            ]
          }
        ]
      }
    },
    footer: {
      version: "Version 1.0",
      effectiveDate: "Inkrafttreten: 10. Dezember 2025"
    }
  }
};

// Traducciones de la política de privacidad
export const privacyTranslations: Record<Language, {
  title: string;
  section1: {
    title: string;
    denomination: string;
    contact: string;
  };
  section2: {
    title: string;
    registrationData: {
      title: string;
      intro: string;
      items: string[];
    };
    configurationData: {
      title: string;
      intro: string;
      items: string[];
    };
    mqttTelemetry: {
      title: string;
      intro: string;
      items: string[];
      alert: {
        title: string;
        content: string;
      };
    };
    technicalLogs: {
      title: string;
      intro: string;
      items: string[];
    };
    cookiesStorage: {
      title: string;
      items: string[];
    };
  };
  section3: {
    title: string;
    legalBasis: {
      title: string;
      intro: string;
      items: string[];
    };
    purposes: {
      title: string;
      serviceOperation: {
        title: string;
        items: string[];
      };
      serviceImprovement: {
        title: string;
        items: string[];
      };
      essentialComms: {
        title: string;
        items: string[];
      };
    };
  };
  section4: {
    title: string;
    noCommercialization: {
      title: string;
      content: string;
    };
    dataRecipients: {
      title: string;
      mapbox: {
        name: string;
        description: string;
        policy: string;
      };
      hosting: {
        name: string;
        description: string;
        access: string;
      };
      payment: {
        name: string;
        description: string;
        note: string;
      };
      legal: {
        name: string;
        description: string;
      };
      businessTransfers: {
        name: string;
        description: string;
      };
    };
    internationalTransfers: {
      title: string;
      content: string;
    };
  };
  section5: {
    title: string;
    accountData: {
      title: string;
      items: string[];
    };
    mqttTelemetry: {
      title: string;
      items: string[];
    };
    systemLogs: {
      title: string;
      items: string[];
    };
    serviceClosure: {
      title: string;
      intro: string;
      items: string[];
    };
  };
  section6: {
    title: string;
    technicalMeasures: {
      title: string;
      inTransit: {
        title: string;
        items: string[];
      };
      atRest: {
        title: string;
        items: string[];
      };
      accessControl: {
        title: string;
        items: string[];
      };
      monitoring: {
        title: string;
        items: string[];
      };
    };
    securityBreaches: {
      title: string;
      intro: string;
      items: string[];
    };
    userResponsibilities: {
      title: string;
      intro: string;
      items: string[];
    };
  };
  section7: {
    title: string;
    intro: string;
    access: {
      title: string;
      content: string;
    };
    rectification: {
      title: string;
      content: string;
    };
    deletion: {
      title: string;
      intro: string;
      items: string[];
      deadline: string;
    };
    limitation: {
      title: string;
      intro: string;
      items: string[];
    };
    portability: {
      title: string;
      content: string;
      format: string;
    };
    opposition: {
      title: string;
      content: string;
    };
    automatedDecisions: {
      title: string;
      content: string;
    };
    exerciseRights: {
      title: string;
      contact: string;
      responseTime: string;
      identityVerification: string;
      complaint: string;
    };
  };
  section8: {
    title: string;
    experimentalNature: {
      title: string;
      intro: string;
      items: string[];
    };
    historicalData: {
      title: string;
      items: string[];
    };
    recommendation: {
      title: string;
      content: string;
    };
  };
  section9: {
    title: string;
    paragraphs: string[];
  };
  section10: {
    title: string;
    contact: {
      title: string;
      privacy: string;
      security: string;
      support: string;
    };
    supervisoryAuthority: {
      title: string;
      name: string;
      address: string[];
      website: string;
    };
  };
  section11: {
    title: string;
    applicableLaw: {
      title: string;
      intro: string;
      items: string[];
    };
    jurisdiction: {
      title: string;
      content: string;
    };
  };
  footer: {
    version: string;
    effectiveDate: string;
  };
}> = {
  es: {
    title: "Política de Privacidad",
    section1: {
      title: "1. Responsable del Tratamiento",
      denomination: "Denominación:",
      contact: "Contacto:",
    },
    section2: {
      title: "2. Información Recopilada",
      registrationData: {
        title: "2.1 Datos de Registro",
        intro: "Durante el proceso de registro se recopilan:",
        items: [
          "Dirección de correo electrónico",
          "Contraseña (almacenada mediante hash bcrypt)",
          "Nombre u organización (opcional)",
          "Fecha de creación de cuenta"
        ]
      },
      configurationData: {
        title: "2.2 Datos de Configuración",
        intro: "Durante la configuración de la plataforma se almacenan:",
        items: [
          "Topics MQTT suscritos",
          "URLs y credenciales de brokers MQTT (encriptadas mediante AES-256)",
          "Configuraciones JSON de datasets y mapeos",
          "Definiciones de alertas, condiciones y umbrales",
          "Capas geoespaciales personalizadas",
          "Preferencias de visualización"
        ]
      },
      mqttTelemetry: {
        title: "2.3 Telemetría MQTT",
        intro: "Se procesan en tiempo real:",
        items: [
          "Cargas útiles JSON recibidas de brokers MQTT",
          "Valores numéricos extraídos conforme a mapeos",
          "Coordenadas geográficas (latitud/longitud)",
          "Marcas temporales de eventos"
        ],
        alert: {
          title: "Importante",
          content: "Los datos se procesan principalmente para visualización en tiempo real. El almacenamiento histórico es temporal (7-30 días típicamente) y no está garantizado. Los datos históricos pueden eliminarse en cualquier momento."
        }
      },
      technicalLogs: {
        title: "2.4 Registros Técnicos",
        intro: "Se generan registros del sistema que pueden incluir:",
        items: [
          "Errores de conexión MQTT",
          "Cargas útiles rechazadas por validación",
          "Métricas de rendimiento agregadas",
          "Acciones de usuario (inicio/cierre de sesión, modificaciones)",
          "Dirección IP y user-agent (finalidad: seguridad)"
        ]
      },
      cookiesStorage: {
        title: "2.5 Cookies y Almacenamiento Local",
        items: [
          "Cookie de sesión (token JWT) para autenticación",
          "LocalStorage para preferencias de interfaz",
          "No se emplean cookies de terceros ni seguimiento publicitario"
        ]
      }
    },
    section3: {
      title: "3. Finalidades del Tratamiento",
      legalBasis: {
        title: "3.1 Base Legal",
        intro: "El tratamiento de datos se fundamenta en:",
        items: [
          "Ejecución del contrato de prestación de servicios",
          "Interés legítimo del responsable en la mejora del servicio",
          "Consentimiento del usuario para comunicaciones opcionales"
        ]
      },
      purposes: {
        title: "3.2 Finalidades",
        serviceOperation: {
          title: "Operación del Servicio:",
          items: [
            "Autenticación del usuario",
            "Conexión a brokers MQTT",
            "Procesamiento y visualización de datos en tiempo real",
            "Ejecución de reglas de alertas",
            "Renderizado de mapas geoespaciales",
            "Mantenimiento de configuraciones"
          ]
        },
        serviceImprovement: {
          title: "Mejora del Servicio:",
          items: [
            "Análisis de rendimiento (datos agregados y anonimizados)",
            "Desarrollo de funcionalidades",
            "Optimización de algoritmos",
            "Investigación y experimentación"
          ]
        },
        essentialComms: {
          title: "Comunicaciones Esenciales:",
          items: [
            "Verificación de cuenta",
            "Notificaciones de seguridad críticas",
            "Cambios en Términos o Políticas",
            "Mantenimiento que afecte al servicio",
            "Cierre del servicio (30 días de antelación)"
          ]
        }
      }
    },
    section4: {
      title: "4. Comunicación de Datos",
      noCommercialization: {
        title: "4.1 No Comercialización",
        content: "No se venden, alquilan ni intercambian datos personales a terceros con fines comerciales."
      },
      dataRecipients: {
        title: "4.2 Destinatarios de los Datos",
        mapbox: {
          name: "Mapbox (mapbox.com)",
          description: "Coordenadas geográficas para renderizado cartográfico",
          policy: "Política: https://www.mapbox.com/legal/privacy"
        },
        hosting: {
          name: "Proveedor de Hosting",
          description: "Datos almacenados en formato encriptado",
          access: "Acceso limitado para mantenimiento"
        },
        payment: {
          name: "Procesador de Pagos (futuro)",
          description: "Información de facturación",
          note: "No se almacenan datos de tarjetas (tokenización)"
        },
        legal: {
          name: "Requerimientos Legales",
          description: "Se podrá divulgar información cuando sea legalmente requerido (orden judicial, citación) o necesario para prevenir fraude o actividad ilegal."
        },
        businessTransfers: {
          name: "Transferencias Empresariales",
          description: "En caso de fusión, adquisición o procedimiento concursal, los datos pueden transferirse a la nueva entidad. Se notificará por correo electrónico cuando sea posible."
        }
      },
      internationalTransfers: {
        title: "4.3 Transferencias Internacionales",
        content: "Los datos pueden ser procesados en servidores ubicados en la Unión Europea o en terceros países con decisión de adecuación o garantías apropiadas conforme al GDPR."
      }
    },
    section5: {
      title: "5. Conservación de Datos",
      accountData: {
        title: "5.1 Datos de Cuenta",
        items: [
          "Durante vigencia: Mientras la cuenta esté activa",
          "Tras eliminación: 90 días (incluyendo copias de seguridad)",
          "Se pueden retener registros anonimizados de auditoría"
        ]
      },
      mqttTelemetry: {
        title: "5.2 Telemetría MQTT",
        items: [
          "Período típico: 7-30 días (variable según carga del sistema)",
          "Eliminación automática por límites de almacenamiento, políticas de rotación, optimización o cierre de cuenta",
          "No se garantiza disponibilidad más allá de 7 días"
        ]
      },
      systemLogs: {
        title: "5.3 Registros del Sistema",
        items: [
          "Conservación indefinida y discrecional",
          "Pueden eliminarse sin notificación previa",
          "Contienen datos técnicos, no contenido de cargas útiles MQTT"
        ]
      },
      serviceClosure: {
        title: "5.4 Cierre del Servicio",
        intro: "En caso de discontinuación definitiva:",
        items: [
          "Notificación con 30 días de antelación (si es posible)",
          "Funcionalidad de exportación (si es técnicamente factible)",
          "Plazo de 30 días para exportar datos",
          "Eliminación permanente tras el cierre"
        ]
      }
    },
    section6: {
      title: "6. Seguridad",
      technicalMeasures: {
        title: "6.1 Medidas Técnicas y Organizativas",
        inTransit: {
          title: "En tránsito:",
          items: [
            "Encriptación TLS/SSL (HTTPS)",
            "Conexiones MQTT seguras (MQTTS)",
            "Tokens JWT con caducidad"
          ]
        },
        atRest: {
          title: "En reposo:",
          items: [
            "Encriptación AES-256 para credenciales MQTT",
            "Hash bcrypt para contraseñas",
            "Encriptación de disco"
          ]
        },
        accessControl: {
          title: "Control de acceso:",
          items: [
            "Autenticación obligatoria",
            "Autorización basada en titularidad",
            "Limitación de tasa de peticiones"
          ]
        },
        monitoring: {
          title: "Monitorización:",
          items: [
            "Registros de acceso y errores",
            "Detección de actividades anómalas"
          ]
        }
      },
      securityBreaches: {
        title: "6.2 Brechas de Seguridad",
        intro: "En caso de brecha que afecte a datos personales:",
        items: [
          "Investigación del alcance",
          "Notificación al usuario en 72 horas (conforme GDPR)",
          "Notificación a la AEPD cuando proceda",
          "Implementación de medidas correctivas"
        ]
      },
      userResponsibilities: {
        title: "6.3 Responsabilidades del Usuario",
        intro: "El usuario debe:",
        items: [
          "Utilizar contraseñas robustas y únicas",
          "Activar autenticación de dos factores (si disponible)",
          "No compartir credenciales",
          "Proteger dispositivos contra malware",
          "Cerrar sesiones en dispositivos compartidos",
          "Notificar vulnerabilidades (security@gisinsight.io)"
        ]
      }
    },
    section7: {
      title: "7. Derechos del Usuario",
      intro: "Conforme al GDPR y LOPD-GDD, el usuario tiene derecho a:",
      access: {
        title: "7.1 Acceso",
        content: "Obtener confirmación sobre el tratamiento de sus datos y copia de los mismos."
      },
      rectification: {
        title: "7.2 Rectificación",
        content: "Solicitar la corrección de datos inexactos o incompletos."
      },
      deletion: {
        title: "7.3 Supresión",
        intro: "Solicitar la eliminación de sus datos cuando:",
        items: [
          "Ya no sean necesarios",
          "Retire su consentimiento",
          "Se opongan al tratamiento sin interés legítimo prevalente",
          "Se hayan tratado ilícitamente"
        ],
        deadline: "Plazo: Eliminación completa en 90 días (incluyendo copias de seguridad)."
      },
      limitation: {
        title: "7.4 Limitación del Tratamiento",
        intro: "Solicitar la limitación cuando:",
        items: [
          "Impugne la exactitud de los datos",
          "El tratamiento sea ilícito pero no desee su supresión",
          "Ya no sean necesarios pero los necesite para reclamaciones",
          "Se haya opuesto al tratamiento"
        ]
      },
      portability: {
        title: "7.5 Portabilidad",
        content: "Recibir sus datos en formato estructurado, de uso común y lectura mecánica, y transmitirlos a otro responsable.",
        format: "Formato: JSON (a discreción del responsable)."
      },
      opposition: {
        title: "7.6 Oposición",
        content: "Oponerse al tratamiento basado en interés legítimo por motivos relacionados con su situación particular."
      },
      automatedDecisions: {
        title: "7.7 Decisiones Automatizadas",
        content: "El Servicio no emplea decisiones basadas únicamente en tratamiento automatizado que produzcan efectos jurídicos o le afecten significativamente."
      },
      exerciseRights: {
        title: "7.8 Ejercicio de Derechos",
        contact: "Contacto: privacy@gisinsight.io",
        responseTime: "Plazo de respuesta: 30 días (prorrogable a 60 días)",
        identityVerification: "Verificación de identidad: Se podrá requerir acreditación antes de procesar la solicitud.",
        complaint: "Reclamación: El usuario tiene derecho a presentar reclamación ante la Agencia Española de Protección de Datos (AEPD) - www.aepd.es"
      }
    },
    section8: {
      title: "8. Limitaciones del Servicio",
      experimentalNature: {
        title: "8.1 Naturaleza Experimental",
        intro: "GIS Insight es un proyecto en fase experimental, sin garantías de:",
        items: [
          "Disponibilidad continua",
          "Persistencia de datos históricos",
          "Fiabilidad de alertas",
          "Precisión de visualizaciones",
          "Ausencia de errores"
        ]
      },
      historicalData: {
        title: "8.2 Datos Históricos",
        items: [
          "El almacenamiento histórico es temporal (7-30 días típicamente)",
          "Los datos pueden eliminarse sin notificación previa",
          "No existe garantía de recuperación tras pérdida",
          "El servicio no constituye sistema de backup"
        ]
      },
      recommendation: {
        title: "8.3 Recomendación",
        content: "El usuario debe mantener copias de seguridad de datos críticos y no depender exclusivamente de GIS Insight para almacenamiento de información importante."
      }
    },
    section9: {
      title: "9. Modificaciones de la Política",
      paragraphs: [
        "Esta Política puede modificarse en cualquier momento para adaptarse a cambios normativos, operacionales o tecnológicos.",
        "Los cambios sustanciales se notificarán mediante correo electrónico a la dirección registrada o aviso en la plataforma.",
        "El uso continuado del Servicio tras las modificaciones constituye aceptación de la nueva Política. Si el usuario no acepta los cambios, deberá cesar el uso del Servicio."
      ]
    },
    section10: {
      title: "10. Contacto y Autoridad de Control",
      contact: {
        title: "10.1 Contacto",
        privacy: "Consultas de privacidad: privacy@gisinsight.io",
        security: "Incidentes de seguridad: security@gisinsight.io",
        support: "Soporte general: support@gisinsight.io"
      },
      supervisoryAuthority: {
        title: "10.2 Autoridad de Supervisión",
        name: "Agencia Española de Protección de Datos (AEPD)",
        address: ["C/ Jorge Juan, 6", "28001 Madrid"],
        website: "www.aepd.es"
      }
    },
    section11: {
      title: "11. Ley Aplicable y Jurisdicción",
      applicableLaw: {
        title: "11.1 Ley Aplicable",
        intro: "Esta Política se rige por la legislación española, en particular:",
        items: [
          "Reglamento (UE) 2016/679 (GDPR)",
          "Ley Orgánica 3/2018, de Protección de Datos Personales y garantía de los derechos digitales (LOPD-GDD)"
        ]
      },
      jurisdiction: {
        title: "11.2 Jurisdicción",
        content: "Para la resolución de controversias, las partes se someten a los Juzgados y Tribunales del domicilio del usuario o, en su defecto, a los de Madrid (España)."
      }
    },
    footer: {
      version: "Versión 1.0",
      effectiveDate: "Fecha de entrada en vigor: 10 de diciembre de 2025"
    }
  },
  en: {
    title: "Privacy Policy",
    section1: {
      title: "1. Data Controller",
      denomination: "Name:",
      contact: "Contact:",
    },
    section2: {
      title: "2. Information Collected",
      registrationData: {
        title: "2.1 Registration Data",
        intro: "During the registration process, we collect:",
        items: [
          "Email address",
          "Password (stored using bcrypt hash)",
          "Name or organization (optional)",
          "Account creation date"
        ]
      },
      configurationData: {
        title: "2.2 Configuration Data",
        intro: "During platform configuration, we store:",
        items: [
          "Subscribed MQTT topics",
          "MQTT broker URLs and credentials (encrypted using AES-256)",
          "Dataset and mapping JSON configurations",
          "Alert definitions, conditions, and thresholds",
          "Custom geospatial layers",
          "Visualization preferences"
        ]
      },
      mqttTelemetry: {
        title: "2.3 MQTT Telemetry",
        intro: "We process in real-time:",
        items: [
          "JSON payloads received from MQTT brokers",
          "Numerical values extracted according to mappings",
          "Geographic coordinates (latitude/longitude)",
          "Event timestamps"
        ],
        alert: {
          title: "Important",
          content: "Data is primarily processed for real-time visualization. Historical storage is temporary (typically 7-30 days) and not guaranteed. Historical data may be deleted at any time."
        }
      },
      technicalLogs: {
        title: "2.4 Technical Logs",
        intro: "System logs are generated that may include:",
        items: [
          "MQTT connection errors",
          "Payloads rejected by validation",
          "Aggregated performance metrics",
          "User actions (login/logout, modifications)",
          "IP address and user-agent (purpose: security)"
        ]
      },
      cookiesStorage: {
        title: "2.5 Cookies and Local Storage",
        items: [
          "Session cookie (JWT token) for authentication",
          "LocalStorage for interface preferences",
          "No third-party cookies or advertising tracking"
        ]
      }
    },
    section3: {
      title: "3. Processing Purposes",
      legalBasis: {
        title: "3.1 Legal Basis",
        intro: "Data processing is based on:",
        items: [
          "Performance of the service provision contract",
          "Legitimate interest of the controller in service improvement",
          "User consent for optional communications"
        ]
      },
      purposes: {
        title: "3.2 Purposes",
        serviceOperation: {
          title: "Service Operation:",
          items: [
            "User authentication",
            "Connection to MQTT brokers",
            "Real-time data processing and visualization",
            "Alert rule execution",
            "Geospatial map rendering",
            "Configuration maintenance"
          ]
        },
        serviceImprovement: {
          title: "Service Improvement:",
          items: [
            "Performance analysis (aggregated and anonymized data)",
            "Feature development",
            "Algorithm optimization",
            "Research and experimentation"
          ]
        },
        essentialComms: {
          title: "Essential Communications:",
          items: [
            "Account verification",
            "Critical security notifications",
            "Changes to Terms or Policies",
            "Service-affecting maintenance",
            "Service closure (30 days' notice)"
          ]
        }
      }
    },
    section4: {
      title: "4. Data Disclosure",
      noCommercialization: {
        title: "4.1 No Commercialization",
        content: "We do not sell, rent, or trade personal data to third parties for commercial purposes."
      },
      dataRecipients: {
        title: "4.2 Data Recipients",
        mapbox: {
          name: "Mapbox (mapbox.com)",
          description: "Geographic coordinates for map rendering",
          policy: "Policy: https://www.mapbox.com/legal/privacy"
        },
        hosting: {
          name: "Hosting Provider",
          description: "Data stored in encrypted format",
          access: "Limited access for maintenance"
        },
        payment: {
          name: "Payment Processor (future)",
          description: "Billing information",
          note: "No card data stored (tokenization)"
        },
        legal: {
          name: "Legal Requirements",
          description: "Information may be disclosed when legally required (court order, subpoena) or necessary to prevent fraud or illegal activity."
        },
        businessTransfers: {
          name: "Business Transfers",
          description: "In case of merger, acquisition, or bankruptcy proceedings, data may be transferred to the new entity. Email notification will be provided when possible."
        }
      },
      internationalTransfers: {
        title: "4.3 International Transfers",
        content: "Data may be processed on servers located in the European Union or in third countries with adequacy decisions or appropriate safeguards in accordance with GDPR."
      }
    },
    section5: {
      title: "5. Data Retention",
      accountData: {
        title: "5.1 Account Data",
        items: [
          "During validity: While the account is active",
          "After deletion: 90 days (including backups)",
          "Anonymized audit logs may be retained"
        ]
      },
      mqttTelemetry: {
        title: "5.2 MQTT Telemetry",
        items: [
          "Typical period: 7-30 days (variable depending on system load)",
          "Automatic deletion due to storage limits, rotation policies, optimization, or account closure",
          "Availability beyond 7 days is not guaranteed"
        ]
      },
      systemLogs: {
        title: "5.3 System Logs",
        items: [
          "Indefinite and discretionary retention",
          "May be deleted without prior notice",
          "Contain technical data, not MQTT payload content"
        ]
      },
      serviceClosure: {
        title: "5.4 Service Closure",
        intro: "In case of permanent discontinuation:",
        items: [
          "30 days' advance notice (if possible)",
          "Export functionality (if technically feasible)",
          "30-day period to export data",
          "Permanent deletion after closure"
        ]
      }
    },
    section6: {
      title: "6. Security",
      technicalMeasures: {
        title: "6.1 Technical and Organizational Measures",
        inTransit: {
          title: "In transit:",
          items: [
            "TLS/SSL encryption (HTTPS)",
            "Secure MQTT connections (MQTTS)",
            "JWT tokens with expiration"
          ]
        },
        atRest: {
          title: "At rest:",
          items: [
            "AES-256 encryption for MQTT credentials",
            "Bcrypt hash for passwords",
            "Disk encryption"
          ]
        },
        accessControl: {
          title: "Access control:",
          items: [
            "Mandatory authentication",
            "Ownership-based authorization",
            "Rate limiting"
          ]
        },
        monitoring: {
          title: "Monitoring:",
          items: [
            "Access and error logs",
            "Anomalous activity detection"
          ]
        }
      },
      securityBreaches: {
        title: "6.2 Security Breaches",
        intro: "In case of a breach affecting personal data:",
        items: [
          "Investigation of scope",
          "User notification within 72 hours (per GDPR)",
          "Notification to supervisory authority when applicable",
          "Implementation of corrective measures"
        ]
      },
      userResponsibilities: {
        title: "6.3 User Responsibilities",
        intro: "Users must:",
        items: [
          "Use strong and unique passwords",
          "Enable two-factor authentication (if available)",
          "Not share credentials",
          "Protect devices against malware",
          "Log out on shared devices",
          "Report vulnerabilities (security@gisinsight.io)"
        ]
      }
    },
    section7: {
      title: "7. User Rights",
      intro: "In accordance with GDPR, users have the right to:",
      access: {
        title: "7.1 Access",
        content: "Obtain confirmation about the processing of their data and a copy thereof."
      },
      rectification: {
        title: "7.2 Rectification",
        content: "Request correction of inaccurate or incomplete data."
      },
      deletion: {
        title: "7.3 Erasure",
        intro: "Request deletion of their data when:",
        items: [
          "No longer necessary",
          "Consent is withdrawn",
          "They object to processing without overriding legitimate interest",
          "Unlawfully processed"
        ],
        deadline: "Deadline: Complete deletion within 90 days (including backups)."
      },
      limitation: {
        title: "7.4 Restriction of Processing",
        intro: "Request restriction when:",
        items: [
          "Contesting data accuracy",
          "Processing is unlawful but deletion is not desired",
          "No longer needed but required for legal claims",
          "Objection to processing has been made"
        ]
      },
      portability: {
        title: "7.5 Data Portability",
        content: "Receive data in a structured, commonly used, machine-readable format, and transmit it to another controller.",
        format: "Format: JSON (at controller's discretion)."
      },
      opposition: {
        title: "7.6 Objection",
        content: "Object to processing based on legitimate interest for reasons related to their particular situation."
      },
      automatedDecisions: {
        title: "7.7 Automated Decisions",
        content: "The Service does not employ decisions based solely on automated processing that produce legal effects or significantly affect the user."
      },
      exerciseRights: {
        title: "7.8 Exercising Rights",
        contact: "Contact: privacy@gisinsight.io",
        responseTime: "Response time: 30 days (extendable to 60 days)",
        identityVerification: "Identity verification: Proof may be required before processing the request.",
        complaint: "Complaint: Users have the right to lodge a complaint with the relevant supervisory authority."
      }
    },
    section8: {
      title: "8. Service Limitations",
      experimentalNature: {
        title: "8.1 Experimental Nature",
        intro: "GIS Insight is an experimental project, with no guarantees of:",
        items: [
          "Continuous availability",
          "Historical data persistence",
          "Alert reliability",
          "Visualization accuracy",
          "Error-free operation"
        ]
      },
      historicalData: {
        title: "8.2 Historical Data",
        items: [
          "Historical storage is temporary (typically 7-30 days)",
          "Data may be deleted without prior notice",
          "No guarantee of recovery after loss",
          "The service does not constitute a backup system"
        ]
      },
      recommendation: {
        title: "8.3 Recommendation",
        content: "Users should maintain backups of critical data and not rely exclusively on GIS Insight for storing important information."
      }
    },
    section9: {
      title: "9. Policy Modifications",
      paragraphs: [
        "This Policy may be modified at any time to adapt to regulatory, operational, or technological changes.",
        "Substantial changes will be notified via email to the registered address or notice on the platform.",
        "Continued use of the Service after modifications constitutes acceptance of the new Policy. If users do not accept the changes, they must cease using the Service."
      ]
    },
    section10: {
      title: "10. Contact and Supervisory Authority",
      contact: {
        title: "10.1 Contact",
        privacy: "Privacy inquiries: privacy@gisinsight.io",
        security: "Security incidents: security@gisinsight.io",
        support: "General support: support@gisinsight.io"
      },
      supervisoryAuthority: {
        title: "10.2 Supervisory Authority",
        name: "Relevant data protection supervisory authority in your jurisdiction",
        address: ["Contact information available at", "your local data protection authority"],
        website: "Refer to your local data protection authority"
      }
    },
    section11: {
      title: "11. Applicable Law and Jurisdiction",
      applicableLaw: {
        title: "11.1 Applicable Law",
        intro: "This Policy is governed by applicable data protection laws, particularly:",
        items: [
          "Regulation (EU) 2016/679 (GDPR)",
          "Applicable national data protection legislation"
        ]
      },
      jurisdiction: {
        title: "11.2 Jurisdiction",
        content: "For dispute resolution, parties submit to the competent courts in accordance with applicable law."
      }
    },
    footer: {
      version: "Version 1.0",
      effectiveDate: "Effective date: December 10, 2025"
    }
  },
  pt: {
    title: "Política de Privacidade",
    section1: {
      title: "1. Responsável pelo Tratamento",
      denomination: "Denominação:",
      contact: "Contato:",
    },
    section2: {
      title: "2. Informações Coletadas",
      registrationData: {
        title: "2.1 Dados de Registro",
        intro: "Durante o processo de registro, coletamos:",
        items: [
          "Endereço de e-mail",
          "Senha (armazenada usando hash bcrypt)",
          "Nome ou organização (opcional)",
          "Data de criação da conta"
        ]
      },
      configurationData: {
        title: "2.2 Dados de Configuração",
        intro: "Durante a configuração da plataforma, armazenamos:",
        items: [
          "Tópicos MQTT subscritos",
          "URLs e credenciais de brokers MQTT (criptografadas usando AES-256)",
          "Configurações JSON de datasets e mapeamentos",
          "Definições de alertas, condições e limites",
          "Camadas geoespaciais personalizadas",
          "Preferências de visualização"
        ]
      },
      mqttTelemetry: {
        title: "2.3 Telemetria MQTT",
        intro: "Processamos em tempo real:",
        items: [
          "Cargas úteis JSON recebidas de brokers MQTT",
          "Valores numéricos extraídos conforme mapeamentos",
          "Coordenadas geográficas (latitude/longitude)",
          "Marcas temporais de eventos"
        ],
        alert: {
          title: "Importante",
          content: "Os dados são processados principalmente para visualização em tempo real. O armazenamento histórico é temporário (tipicamente 7-30 dias) e não é garantido. Os dados históricos podem ser eliminados a qualquer momento."
        }
      },
      technicalLogs: {
        title: "2.4 Registros Técnicos",
        intro: "São gerados registros do sistema que podem incluir:",
        items: [
          "Erros de conexão MQTT",
          "Cargas úteis rejeitadas por validação",
          "Métricas de desempenho agregadas",
          "Ações do usuário (login/logout, modificações)",
          "Endereço IP e user-agent (finalidade: segurança)"
        ]
      },
      cookiesStorage: {
        title: "2.5 Cookies e Armazenamento Local",
        items: [
          "Cookie de sessão (token JWT) para autenticação",
          "LocalStorage para preferências de interface",
          "Não utilizamos cookies de terceiros ou rastreamento publicitário"
        ]
      }
    },
    section3: {
      title: "3. Finalidades do Tratamento",
      legalBasis: {
        title: "3.1 Base Legal",
        intro: "O tratamento de dados fundamenta-se em:",
        items: [
          "Execução do contrato de prestação de serviços",
          "Interesse legítimo do responsável na melhoria do serviço",
          "Consentimento do usuário para comunicações opcionais"
        ]
      },
      purposes: {
        title: "3.2 Finalidades",
        serviceOperation: {
          title: "Operação do Serviço:",
          items: [
            "Autenticação do usuário",
            "Conexão a brokers MQTT",
            "Processamento e visualização de dados em tempo real",
            "Execução de regras de alertas",
            "Renderização de mapas geoespaciais",
            "Manutenção de configurações"
          ]
        },
        serviceImprovement: {
          title: "Melhoria do Serviço:",
          items: [
            "Análise de desempenho (dados agregados e anonimizados)",
            "Desenvolvimento de funcionalidades",
            "Otimização de algoritmos",
            "Pesquisa e experimentação"
          ]
        },
        essentialComms: {
          title: "Comunicações Essenciais:",
          items: [
            "Verificação de conta",
            "Notificações de segurança críticas",
            "Mudanças nos Termos ou Políticas",
            "Manutenção que afete o serviço",
            "Encerramento do serviço (aviso de 30 dias)"
          ]
        }
      }
    },
    section4: {
      title: "4. Comunicação de Dados",
      noCommercialization: {
        title: "4.1 Não Comercialização",
        content: "Não vendemos, alugamos ou trocamos dados pessoais a terceiros para fins comerciais."
      },
      dataRecipients: {
        title: "4.2 Destinatários dos Dados",
        mapbox: {
          name: "Mapbox (mapbox.com)",
          description: "Coordenadas geográficas para renderização cartográfica",
          policy: "Política: https://www.mapbox.com/legal/privacy"
        },
        hosting: {
          name: "Provedor de Hospedagem",
          description: "Dados armazenados em formato criptografado",
          access: "Acesso limitado para manutenção"
        },
        payment: {
          name: "Processador de Pagamentos (futuro)",
          description: "Informações de faturamento",
          note: "Não armazenamos dados de cartões (tokenização)"
        },
        legal: {
          name: "Requisitos Legais",
          description: "As informações podem ser divulgadas quando legalmente exigido (ordem judicial, intimação) ou necessário para prevenir fraude ou atividade ilegal."
        },
        businessTransfers: {
          name: "Transferências Empresariais",
          description: "Em caso de fusão, aquisição ou processo de insolvência, os dados podem ser transferidos para a nova entidade. Notificação por e-mail será fornecida quando possível."
        }
      },
      internationalTransfers: {
        title: "4.3 Transferências Internacionais",
        content: "Os dados podem ser processados em servidores localizados na União Europeia ou em países terceiros com decisão de adequação ou garantias apropriadas conforme o RGPD."
      }
    },
    section5: {
      title: "5. Conservação de Dados",
      accountData: {
        title: "5.1 Dados de Conta",
        items: [
          "Durante vigência: Enquanto a conta estiver ativa",
          "Após eliminação: 90 dias (incluindo cópias de segurança)",
          "Registros de auditoria anonimizados podem ser retidos"
        ]
      },
      mqttTelemetry: {
        title: "5.2 Telemetria MQTT",
        items: [
          "Período típico: 7-30 dias (variável conforme carga do sistema)",
          "Eliminação automática por limites de armazenamento, políticas de rotação, otimização ou encerramento de conta",
          "Não há garantia de disponibilidade além de 7 dias"
        ]
      },
      systemLogs: {
        title: "5.3 Registros do Sistema",
        items: [
          "Conservação indefinida e discricionária",
          "Podem ser eliminados sem notificação prévia",
          "Contêm dados técnicos, não conteúdo de cargas úteis MQTT"
        ]
      },
      serviceClosure: {
        title: "5.4 Encerramento do Serviço",
        intro: "Em caso de descontinuação definitiva:",
        items: [
          "Notificação com 30 dias de antecedência (se possível)",
          "Funcionalidade de exportação (se tecnicamente viável)",
          "Prazo de 30 dias para exportar dados",
          "Eliminação permanente após o encerramento"
        ]
      }
    },
    section6: {
      title: "6. Segurança",
      technicalMeasures: {
        title: "6.1 Medidas Técnicas e Organizacionais",
        inTransit: {
          title: "Em trânsito:",
          items: [
            "Criptografia TLS/SSL (HTTPS)",
            "Conexões MQTT seguras (MQTTS)",
            "Tokens JWT com expiração"
          ]
        },
        atRest: {
          title: "Em repouso:",
          items: [
            "Criptografia AES-256 para credenciais MQTT",
            "Hash bcrypt para senhas",
            "Criptografia de disco"
          ]
        },
        accessControl: {
          title: "Controle de acesso:",
          items: [
            "Autenticação obrigatória",
            "Autorização baseada em propriedade",
            "Limitação de taxa de solicitações"
          ]
        },
        monitoring: {
          title: "Monitorização:",
          items: [
            "Registros de acesso e erros",
            "Detecção de atividades anômalas"
          ]
        }
      },
      securityBreaches: {
        title: "6.2 Violações de Segurança",
        intro: "Em caso de violação que afete dados pessoais:",
        items: [
          "Investigação do alcance",
          "Notificação ao usuário em 72 horas (conforme RGPD)",
          "Notificação à autoridade supervisora quando aplicável",
          "Implementação de medidas corretivas"
        ]
      },
      userResponsibilities: {
        title: "6.3 Responsabilidades do Usuário",
        intro: "O usuário deve:",
        items: [
          "Utilizar senhas robustas e únicas",
          "Ativar autenticação de dois fatores (se disponível)",
          "Não compartilhar credenciais",
          "Proteger dispositivos contra malware",
          "Encerrar sessões em dispositivos compartilhados",
          "Notificar vulnerabilidades (security@gisinsight.io)"
        ]
      }
    },
    section7: {
      title: "7. Direitos do Usuário",
      intro: "Conforme o RGPD, o usuário tem direito a:",
      access: {
        title: "7.1 Acesso",
        content: "Obter confirmação sobre o tratamento de seus dados e cópia dos mesmos."
      },
      rectification: {
        title: "7.2 Retificação",
        content: "Solicitar a correção de dados inexatos ou incompletos."
      },
      deletion: {
        title: "7.3 Eliminação",
        intro: "Solicitar a eliminação de seus dados quando:",
        items: [
          "Já não forem necessários",
          "Retirar seu consentimento",
          "Se opor ao tratamento sem interesse legítimo prevalente",
          "Tenham sido tratados ilicitamente"
        ],
        deadline: "Prazo: Eliminação completa em 90 dias (incluindo cópias de segurança)."
      },
      limitation: {
        title: "7.4 Limitação do Tratamento",
        intro: "Solicitar a limitação quando:",
        items: [
          "Contestar a exatidão dos dados",
          "O tratamento for ilícito mas não desejar sua eliminação",
          "Já não forem necessários mas os necessitar para reclamações",
          "Se opor ao tratamento"
        ]
      },
      portability: {
        title: "7.5 Portabilidade",
        content: "Receber seus dados em formato estruturado, de uso comum e leitura mecânica, e transmiti-los a outro responsável.",
        format: "Formato: JSON (a critério do responsável)."
      },
      opposition: {
        title: "7.6 Oposição",
        content: "Opor-se ao tratamento baseado em interesse legítimo por motivos relacionados à sua situação particular."
      },
      automatedDecisions: {
        title: "7.7 Decisões Automatizadas",
        content: "O Serviço não emprega decisões baseadas exclusivamente em tratamento automatizado que produzam efeitos jurídicos ou o afetem significativamente."
      },
      exerciseRights: {
        title: "7.8 Exercício de Direitos",
        contact: "Contato: privacy@gisinsight.io",
        responseTime: "Prazo de resposta: 30 dias (prorrogável a 60 dias)",
        identityVerification: "Verificação de identidade: Pode ser solicitada comprovação antes de processar a solicitação.",
        complaint: "Reclamação: O usuário tem direito a apresentar reclamação à autoridade supervisora de proteção de dados competente."
      }
    },
    section8: {
      title: "8. Limitações do Serviço",
      experimentalNature: {
        title: "8.1 Natureza Experimental",
        intro: "GIS Insight é um projeto em fase experimental, sem garantias de:",
        items: [
          "Disponibilidade contínua",
          "Persistência de dados históricos",
          "Confiabilidade de alertas",
          "Precisão de visualizações",
          "Ausência de erros"
        ]
      },
      historicalData: {
        title: "8.2 Dados Históricos",
        items: [
          "O armazenamento histórico é temporário (tipicamente 7-30 dias)",
          "Os dados podem ser eliminados sem notificação prévia",
          "Não existe garantia de recuperação após perda",
          "O serviço não constitui sistema de backup"
        ]
      },
      recommendation: {
        title: "8.3 Recomendação",
        content: "O usuário deve manter cópias de segurança de dados críticos e não depender exclusivamente do GIS Insight para armazenamento de informações importantes."
      }
    },
    section9: {
      title: "9. Modificações da Política",
      paragraphs: [
        "Esta Política pode ser modificada a qualquer momento para adaptar-se a mudanças normativas, operacionais ou tecnológicas.",
        "As mudanças substanciais serão notificadas mediante e-mail ao endereço registrado ou aviso na plataforma.",
        "O uso continuado do Serviço após as modificações constitui aceitação da nova Política. Se o usuário não aceitar as mudanças, deverá cessar o uso do Serviço."
      ]
    },
    section10: {
      title: "10. Contato e Autoridade de Controle",
      contact: {
        title: "10.1 Contato",
        privacy: "Consultas de privacidade: privacy@gisinsight.io",
        security: "Incidentes de segurança: security@gisinsight.io",
        support: "Suporte geral: support@gisinsight.io"
      },
      supervisoryAuthority: {
        title: "10.2 Autoridade de Supervisão",
        name: "Autoridade supervisora de proteção de dados competente em sua jurisdição",
        address: ["Informações de contato disponíveis em", "sua autoridade local de proteção de dados"],
        website: "Consulte sua autoridade local de proteção de dados"
      }
    },
    section11: {
      title: "11. Lei Aplicável e Jurisdição",
      applicableLaw: {
        title: "11.1 Lei Aplicável",
        intro: "Esta Política é regida pelas leis aplicáveis de proteção de dados, em particular:",
        items: [
          "Regulamento (UE) 2016/679 (RGPD)",
          "Legislação nacional de proteção de dados aplicável"
        ]
      },
      jurisdiction: {
        title: "11.2 Jurisdição",
        content: "Para a resolução de controvérsias, as partes submetem-se aos tribunais competentes de acordo com a lei aplicável."
      }
    },
    footer: {
      version: "Versão 1.0",
      effectiveDate: "Data de entrada em vigor: 10 de dezembro de 2025"
    }
  },
  ja: {
    title: "プライバシーポリシー",
    section1: {
      title: "1. データ管理者",
      denomination: "名称:",
      contact: "連絡先:",
    },
    section2: {
      title: "2. 収集する情報",
      registrationData: {
        title: "2.1 登録データ",
        intro: "登録プロセスにおいて、以下の情報を収集します:",
        items: [
          "メールアドレス",
          "パスワード(bcryptハッシュを使用して保存)",
          "名前または組織名(オプション)",
          "アカウント作成日"
        ]
      },
      configurationData: {
        title: "2.2 設定データ",
        intro: "プラットフォーム設定において、以下を保存します:",
        items: [
          "購読したMQTTトピック",
          "MQTTブローカーのURLと認証情報(AES-256で暗号化)",
          "データセットとマッピングのJSON設定",
          "アラート定義、条件、しきい値",
          "カスタム地理空間レイヤー",
          "可視化の設定"
        ]
      },
      mqttTelemetry: {
        title: "2.3 MQTTテレメトリ",
        intro: "リアルタイムで以下を処理します:",
        items: [
          "MQTTブローカーから受信したJSONペイロード",
          "マッピングに従って抽出された数値",
          "地理座標(緯度/経度)",
          "イベントのタイムスタンプ"
        ],
        alert: {
          title: "重要",
          content: "データは主にリアルタイム可視化のために処理されます。履歴ストレージは一時的(通常7〜30日)であり、保証されません。履歴データはいつでも削除される可能性があります。"
        }
      },
      technicalLogs: {
        title: "2.4 技術ログ",
        intro: "以下を含むシステムログが生成されます:",
        items: [
          "MQTT接続エラー",
          "検証により拒否されたペイロード",
          "集約されたパフォーマンス指標",
          "ユーザーアクション(ログイン/ログアウト、変更)",
          "IPアドレスとユーザーエージェント(目的:セキュリティ)"
        ]
      },
      cookiesStorage: {
        title: "2.5 クッキーとローカルストレージ",
        items: [
          "認証用のセッションクッキー(JWTトークン)",
          "インターフェース設定用のローカルストレージ",
          "第三者クッキーや広告トラッキングは使用しません"
        ]
      }
    },
    section3: {
      title: "3. 処理の目的",
      legalBasis: {
        title: "3.1 法的根拠",
        intro: "データ処理は以下に基づいています:",
        items: [
          "サービス提供契約の履行",
          "サービス改善における管理者の正当な利益",
          "オプション通信に対するユーザーの同意"
        ]
      },
      purposes: {
        title: "3.2 目的",
        serviceOperation: {
          title: "サービス運営:",
          items: [
            "ユーザー認証",
            "MQTTブローカーへの接続",
            "リアルタイムデータ処理と可視化",
            "アラートルールの実行",
            "地理空間マップのレンダリング",
            "設定の維持"
          ]
        },
        serviceImprovement: {
          title: "サービス改善:",
          items: [
            "パフォーマンス分析(集約および匿名化されたデータ)",
            "機能開発",
            "アルゴリズムの最適化",
            "研究と実験"
          ]
        },
        essentialComms: {
          title: "必須コミュニケーション:",
          items: [
            "アカウント確認",
            "重要なセキュリティ通知",
            "利用規約またはポリシーの変更",
            "サービスに影響するメンテナンス",
            "サービス終了(30日前通知)"
          ]
        }
      }
    },
    section4: {
      title: "4. データの開示",
      noCommercialization: {
        title: "4.1 商業化なし",
        content: "商業目的で個人データを第三者に販売、賃貸、または交換することはありません。"
      },
      dataRecipients: {
        title: "4.2 データ受領者",
        mapbox: {
          name: "Mapbox (mapbox.com)",
          description: "地図レンダリングのための地理座標",
          policy: "ポリシー: https://www.mapbox.com/legal/privacy"
        },
        hosting: {
          name: "ホスティングプロバイダー",
          description: "暗号化形式で保存されたデータ",
          access: "メンテナンスのための限定的アクセス"
        },
        payment: {
          name: "決済処理業者(将来)",
          description: "請求情報",
          note: "カードデータは保存されません(トークン化)"
        },
        legal: {
          name: "法的要件",
          description: "法的に要求された場合(裁判所命令、召喚状)、または詐欺や違法行為を防ぐために必要な場合、情報が開示される可能性があります。"
        },
        businessTransfers: {
          name: "事業譲渡",
          description: "合併、買収、または破産手続きの場合、データは新しい事業体に譲渡される可能性があります。可能な場合、メール通知が提供されます。"
        }
      },
      internationalTransfers: {
        title: "4.3 国際転送",
        content: "データは、欧州連合内、または十分性決定または適切な保護措置を有する第三国のサーバーで処理される可能性があります(GDPR準拠)。"
      }
    },
    section5: {
      title: "5. データ保持",
      accountData: {
        title: "5.1 アカウントデータ",
        items: [
          "有効期間中:アカウントがアクティブな間",
          "削除後:90日間(バックアップを含む)",
          "匿名化された監査ログが保持される場合があります"
        ]
      },
      mqttTelemetry: {
        title: "5.2 MQTTテレメトリ",
        items: [
          "通常期間:7〜30日(システム負荷により変動)",
          "ストレージ制限、ローテーションポリシー、最適化、またはアカウント閉鎖による自動削除",
          "7日を超える可用性は保証されません"
        ]
      },
      systemLogs: {
        title: "5.3 システムログ",
        items: [
          "無期限かつ裁量的な保持",
          "事前通知なしに削除される場合があります",
          "技術データを含み、MQTTペイロードの内容は含みません"
        ]
      },
      serviceClosure: {
        title: "5.4 サービス終了",
        intro: "完全な中止の場合:",
        items: [
          "30日前の通知(可能な場合)",
          "エクスポート機能(技術的に実現可能な場合)",
          "データをエクスポートするための30日間の期間",
          "閉鎖後の永久削除"
        ]
      }
    },
    section6: {
      title: "6. セキュリティ",
      technicalMeasures: {
        title: "6.1 技術的および組織的措置",
        inTransit: {
          title: "転送中:",
          items: [
            "TLS/SSL暗号化(HTTPS)",
            "安全なMQTT接続(MQTTS)",
            "有効期限付きJWTトークン"
          ]
        },
        atRest: {
          title: "保存時:",
          items: [
            "MQTT認証情報のAES-256暗号化",
            "パスワードのBcryptハッシュ",
            "ディスク暗号化"
          ]
        },
        accessControl: {
          title: "アクセス制御:",
          items: [
            "必須認証",
            "所有権ベースの認可",
            "レート制限"
          ]
        },
        monitoring: {
          title: "監視:",
          items: [
            "アクセスとエラーのログ",
            "異常なアクティビティの検出"
          ]
        }
      },
      securityBreaches: {
        title: "6.2 セキュリティ侵害",
        intro: "個人データに影響する侵害の場合:",
        items: [
          "範囲の調査",
          "72時間以内のユーザー通知(GDPR準拠)",
          "該当する場合の監督機関への通知",
          "是正措置の実施"
        ]
      },
      userResponsibilities: {
        title: "6.3 ユーザーの責任",
        intro: "ユーザーは以下を行う必要があります:",
        items: [
          "強力でユニークなパスワードの使用",
          "二要素認証の有効化(利用可能な場合)",
          "認証情報の非共有",
          "マルウェアからデバイスを保護",
          "共有デバイスでのログアウト",
          "脆弱性の報告(security@gisinsight.io)"
        ]
      }
    },
    section7: {
      title: "7. ユーザーの権利",
      intro: "GDPRに従い、ユーザーは以下の権利を有します:",
      access: {
        title: "7.1 アクセス",
        content: "データの処理に関する確認とそのコピーを取得する。"
      },
      rectification: {
        title: "7.2 訂正",
        content: "不正確または不完全なデータの修正を要求する。"
      },
      deletion: {
        title: "7.3 消去",
        intro: "以下の場合にデータの削除を要求する:",
        items: [
          "もはや必要でない場合",
          "同意を撤回する場合",
          "優越する正当な利益なしに処理に反対する場合",
          "違法に処理された場合"
        ],
        deadline: "期限:90日以内の完全削除(バックアップを含む)。"
      },
      limitation: {
        title: "7.4 処理の制限",
        intro: "以下の場合に制限を要求する:",
        items: [
          "データの正確性に異議を唱える場合",
          "処理が違法だが削除を望まない場合",
          "もはや必要ないが法的請求に必要な場合",
          "処理に反対した場合"
        ]
      },
      portability: {
        title: "7.5 データポータビリティ",
        content: "構造化された、一般的に使用される、機械可読形式でデータを受け取り、別の管理者に送信する。",
        format: "形式:JSON(管理者の裁量による)。"
      },
      opposition: {
        title: "7.6 反対",
        content: "特定の状況に関連する理由により、正当な利益に基づく処理に反対する。"
      },
      automatedDecisions: {
        title: "7.7 自動化された決定",
        content: "サービスは、ユーザーに法的効果をもたらすか、重大な影響を与える自動処理のみに基づく決定を使用しません。"
      },
      exerciseRights: {
        title: "7.8 権利の行使",
        contact: "連絡先: privacy@gisinsight.io",
        responseTime: "応答時間:30日間(60日間まで延長可能)",
        identityVerification: "本人確認:リクエストを処理する前に証明が必要な場合があります。",
        complaint: "苦情:ユーザーは関連する監督機関に苦情を申し立てる権利があります。"
      }
    },
    section8: {
      title: "8. サービスの制限",
      experimentalNature: {
        title: "8.1 実験的性質",
        intro: "GIS Insightは実験的プロジェクトであり、以下の保証はありません:",
        items: [
          "継続的な可用性",
          "履歴データの永続性",
          "アラートの信頼性",
          "可視化の正確性",
          "エラーのない動作"
        ]
      },
      historicalData: {
        title: "8.2 履歴データ",
        items: [
          "履歴ストレージは一時的です(通常7〜30日)",
          "データは事前通知なしに削除される場合があります",
          "損失後の回復の保証はありません",
          "サービスはバックアップシステムではありません"
        ]
      },
      recommendation: {
        title: "8.3 推奨事項",
        content: "ユーザーは重要なデータのバックアップを維持し、重要な情報の保存をGIS Insightのみに依存しないでください。"
      }
    },
    section9: {
      title: "9. ポリシーの変更",
      paragraphs: [
        "このポリシーは、規制、運用、または技術的な変更に適応するためにいつでも変更される場合があります。",
        "重大な変更は、登録されたアドレスへのメールまたはプラットフォーム上の通知により通知されます。",
        "変更後のサービスの継続使用は、新しいポリシーの受け入れを構成します。ユーザーが変更を受け入れない場合は、サービスの使用を中止する必要があります。"
      ]
    },
    section10: {
      title: "10. 連絡先と監督機関",
      contact: {
        title: "10.1 連絡先",
        privacy: "プライバシーに関するお問い合わせ: privacy@gisinsight.io",
        security: "セキュリティインシデント: security@gisinsight.io",
        support: "一般サポート: support@gisinsight.io"
      },
      supervisoryAuthority: {
        title: "10.2 監督機関",
        name: "管轄区域内の関連データ保護監督機関",
        address: ["連絡先情報は", "お住まいの地域のデータ保護機関でご確認ください"],
        website: "お住まいの地域のデータ保護機関を参照してください"
      }
    },
    section11: {
      title: "11. 準拠法と管轄",
      applicableLaw: {
        title: "11.1 準拠法",
        intro: "このポリシーは、特に以下の適用されるデータ保護法に準拠します:",
        items: [
          "規則(EU)2016/679(GDPR)",
          "適用される国内データ保護法"
        ]
      },
      jurisdiction: {
        title: "11.2 管轄",
        content: "紛争解決のため、当事者は適用法に従って管轄裁判所に服します。"
      }
    },
    footer: {
      version: "バージョン 1.0",
      effectiveDate: "発効日: 2025年12月10日"
    }
  },
  fr: {
    title: "Politique de Confidentialité",
    section1: {
      title: "1. Responsable du Traitement",
      denomination: "Dénomination:",
      contact: "Contact:",
    },
    section2: {
      title: "2. Informations Collectées",
      registrationData: {
        title: "2.1 Données d'Inscription",
        intro: "Lors du processus d'inscription, nous collectons:",
        items: [
          "Adresse e-mail",
          "Mot de passe (stocké avec hash bcrypt)",
          "Nom ou organisation (optionnel)",
          "Date de création du compte"
        ]
      },
      configurationData: {
        title: "2.2 Données de Configuration",
        intro: "Lors de la configuration de la plateforme, nous stockons:",
        items: [
          "Sujets MQTT souscrits",
          "URLs et identifiants des brokers MQTT (chiffrés avec AES-256)",
          "Configurations JSON des ensembles de données et mappages",
          "Définitions d'alertes, conditions et seuils",
          "Couches géospatiales personnalisées",
          "Préférences de visualisation"
        ]
      },
      mqttTelemetry: {
        title: "2.3 Télémétrie MQTT",
        intro: "Nous traitons en temps réel:",
        items: [
          "Charges utiles JSON reçues des brokers MQTT",
          "Valeurs numériques extraites selon les mappages",
          "Coordonnées géographiques (latitude/longitude)",
          "Horodatages des événements"
        ],
        alert: {
          title: "Important",
          content: "Les données sont principalement traitées pour la visualisation en temps réel. Le stockage historique est temporaire (généralement 7-30 jours) et non garanti. Les données historiques peuvent être supprimées à tout moment."
        }
      },
      technicalLogs: {
        title: "2.4 Journaux Techniques",
        intro: "Des journaux système sont générés qui peuvent inclure:",
        items: [
          "Erreurs de connexion MQTT",
          "Charges utiles rejetées par validation",
          "Métriques de performance agrégées",
          "Actions utilisateur (connexion/déconnexion, modifications)",
          "Adresse IP et user-agent (but: sécurité)"
        ]
      },
      cookiesStorage: {
        title: "2.5 Cookies et Stockage Local",
        items: [
          "Cookie de session (jeton JWT) pour l'authentification",
          "LocalStorage pour les préférences d'interface",
          "Pas de cookies tiers ni de suivi publicitaire"
        ]
      }
    },
    section3: {
      title: "3. Finalités du Traitement",
      legalBasis: {
        title: "3.1 Base Légale",
        intro: "Le traitement des données est fondé sur:",
        items: [
          "Exécution du contrat de prestation de services",
          "Intérêt légitime du responsable pour l'amélioration du service",
          "Consentement de l'utilisateur pour les communications optionnelles"
        ]
      },
      purposes: {
        title: "3.2 Finalités",
        serviceOperation: {
          title: "Fonctionnement du Service:",
          items: [
            "Authentification de l'utilisateur",
            "Connexion aux brokers MQTT",
            "Traitement et visualisation des données en temps réel",
            "Exécution des règles d'alerte",
            "Rendu des cartes géospatiales",
            "Maintenance des configurations"
          ]
        },
        serviceImprovement: {
          title: "Amélioration du Service:",
          items: [
            "Analyse de performance (données agrégées et anonymisées)",
            "Développement de fonctionnalités",
            "Optimisation des algorithmes",
            "Recherche et expérimentation"
          ]
        },
        essentialComms: {
          title: "Communications Essentielles:",
          items: [
            "Vérification du compte",
            "Notifications de sécurité critiques",
            "Modifications des Conditions ou Politiques",
            "Maintenance affectant le service",
            "Fermeture du service (préavis de 30 jours)"
          ]
        }
      }
    },
    section4: {
      title: "4. Communication des Données",
      noCommercialization: {
        title: "4.1 Non Commercialisation",
        content: "Nous ne vendons, ne louons ni n'échangeons les données personnelles à des tiers à des fins commerciales."
      },
      dataRecipients: {
        title: "4.2 Destinataires des Données",
        mapbox: {
          name: "Mapbox (mapbox.com)",
          description: "Coordonnées géographiques pour le rendu cartographique",
          policy: "Politique: https://www.mapbox.com/legal/privacy"
        },
        hosting: {
          name: "Fournisseur d'Hébergement",
          description: "Données stockées sous format chiffré",
          access: "Accès limité pour la maintenance"
        },
        payment: {
          name: "Processeur de Paiement (futur)",
          description: "Informations de facturation",
          note: "Aucune donnée de carte stockée (tokenisation)"
        },
        legal: {
          name: "Exigences Légales",
          description: "Les informations peuvent être divulguées lorsque légalement requis (ordonnance judiciaire, citation) ou nécessaire pour prévenir la fraude ou l'activité illégale."
        },
        businessTransfers: {
          name: "Transferts d'Entreprise",
          description: "En cas de fusion, acquisition ou procédure de faillite, les données peuvent être transférées à la nouvelle entité. Une notification par e-mail sera fournie si possible."
        }
      },
      internationalTransfers: {
        title: "4.3 Transferts Internationaux",
        content: "Les données peuvent être traitées sur des serveurs situés dans l'Union européenne ou dans des pays tiers avec des décisions d'adéquation ou des garanties appropriées conformément au RGPD."
      }
    },
    section5: {
      title: "5. Conservation des Données",
      accountData: {
        title: "5.1 Données de Compte",
        items: [
          "Pendant la validité: Tant que le compte est actif",
          "Après suppression: 90 jours (y compris les sauvegardes)",
          "Les journaux d'audit anonymisés peuvent être conservés"
        ]
      },
      mqttTelemetry: {
        title: "5.2 Télémétrie MQTT",
        items: [
          "Période typique: 7-30 jours (variable selon la charge système)",
          "Suppression automatique en raison de limites de stockage, politiques de rotation, optimisation ou fermeture de compte",
          "La disponibilité au-delà de 7 jours n'est pas garantie"
        ]
      },
      systemLogs: {
        title: "5.3 Journaux Système",
        items: [
          "Conservation indéfinie et discrétionnaire",
          "Peuvent être supprimés sans préavis",
          "Contiennent des données techniques, pas le contenu des charges utiles MQTT"
        ]
      },
      serviceClosure: {
        title: "5.4 Fermeture du Service",
        intro: "En cas de discontinuation définitive:",
        items: [
          "Notification avec 30 jours d'avance (si possible)",
          "Fonctionnalité d'exportation (si techniquement réalisable)",
          "Période de 30 jours pour exporter les données",
          "Suppression permanente après la fermeture"
        ]
      }
    },
    section6: {
      title: "6. Sécurité",
      technicalMeasures: {
        title: "6.1 Mesures Techniques et Organisationnelles",
        inTransit: {
          title: "En transit:",
          items: [
            "Chiffrement TLS/SSL (HTTPS)",
            "Connexions MQTT sécurisées (MQTTS)",
            "Jetons JWT avec expiration"
          ]
        },
        atRest: {
          title: "Au repos:",
          items: [
            "Chiffrement AES-256 pour les identifiants MQTT",
            "Hash bcrypt pour les mots de passe",
            "Chiffrement de disque"
          ]
        },
        accessControl: {
          title: "Contrôle d'accès:",
          items: [
            "Authentification obligatoire",
            "Autorisation basée sur la propriété",
            "Limitation du taux de requêtes"
          ]
        },
        monitoring: {
          title: "Surveillance:",
          items: [
            "Journaux d'accès et d'erreurs",
            "Détection d'activités anormales"
          ]
        }
      },
      securityBreaches: {
        title: "6.2 Violations de Sécurité",
        intro: "En cas de violation affectant les données personnelles:",
        items: [
          "Enquête sur la portée",
          "Notification à l'utilisateur dans les 72 heures (conformément au RGPD)",
          "Notification à l'autorité de contrôle le cas échéant",
          "Mise en œuvre de mesures correctives"
        ]
      },
      userResponsibilities: {
        title: "6.3 Responsabilités de l'Utilisateur",
        intro: "L'utilisateur doit:",
        items: [
          "Utiliser des mots de passe robustes et uniques",
          "Activer l'authentification à deux facteurs (si disponible)",
          "Ne pas partager les identifiants",
          "Protéger les appareils contre les logiciels malveillants",
          "Se déconnecter sur les appareils partagés",
          "Signaler les vulnérabilités (security@gisinsight.io)"
        ]
      }
    },
    section7: {
      title: "7. Droits de l'Utilisateur",
      intro: "Conformément au RGPD, l'utilisateur a le droit de:",
      access: {
        title: "7.1 Accès",
        content: "Obtenir confirmation du traitement de ses données et une copie de celles-ci."
      },
      rectification: {
        title: "7.2 Rectification",
        content: "Demander la correction de données inexactes ou incomplètes."
      },
      deletion: {
        title: "7.3 Effacement",
        intro: "Demander la suppression de ses données lorsque:",
        items: [
          "Elles ne sont plus nécessaires",
          "Le consentement est retiré",
          "Opposition au traitement sans intérêt légitime prépondérant",
          "Traitement illicite"
        ],
        deadline: "Délai: Suppression complète dans les 90 jours (y compris les sauvegardes)."
      },
      limitation: {
        title: "7.4 Limitation du Traitement",
        intro: "Demander la limitation lorsque:",
        items: [
          "Contestation de l'exactitude des données",
          "Le traitement est illicite mais la suppression n'est pas souhaitée",
          "Plus nécessaire mais requis pour des réclamations légales",
          "Opposition au traitement formulée"
        ]
      },
      portability: {
        title: "7.5 Portabilité",
        content: "Recevoir ses données dans un format structuré, couramment utilisé et lisible par machine, et les transmettre à un autre responsable.",
        format: "Format: JSON (à la discrétion du responsable)."
      },
      opposition: {
        title: "7.6 Opposition",
        content: "S'opposer au traitement fondé sur l'intérêt légitime pour des raisons tenant à sa situation particulière."
      },
      automatedDecisions: {
        title: "7.7 Décisions Automatisées",
        content: "Le Service n'utilise pas de décisions basées uniquement sur un traitement automatisé produisant des effets juridiques ou affectant significativement l'utilisateur."
      },
      exerciseRights: {
        title: "7.8 Exercice des Droits",
        contact: "Contact: privacy@gisinsight.io",
        responseTime: "Délai de réponse: 30 jours (prolongeable à 60 jours)",
        identityVerification: "Vérification d'identité: Une preuve peut être requise avant de traiter la demande.",
        complaint: "Réclamation: L'utilisateur a le droit de déposer une plainte auprès de l'autorité de contrôle compétente."
      }
    },
    section8: {
      title: "8. Limitations du Service",
      experimentalNature: {
        title: "8.1 Nature Expérimentale",
        intro: "GIS Insight est un projet expérimental, sans garantie de:",
        items: [
          "Disponibilité continue",
          "Persistance des données historiques",
          "Fiabilité des alertes",
          "Précision des visualisations",
          "Fonctionnement sans erreur"
        ]
      },
      historicalData: {
        title: "8.2 Données Historiques",
        items: [
          "Le stockage historique est temporaire (généralement 7-30 jours)",
          "Les données peuvent être supprimées sans préavis",
          "Aucune garantie de récupération après perte",
          "Le service ne constitue pas un système de sauvegarde"
        ]
      },
      recommendation: {
        title: "8.3 Recommandation",
        content: "L'utilisateur doit maintenir des sauvegardes des données critiques et ne pas se fier exclusivement à GIS Insight pour le stockage d'informations importantes."
      }
    },
    section9: {
      title: "9. Modifications de la Politique",
      paragraphs: [
        "Cette Politique peut être modifiée à tout moment pour s'adapter aux changements réglementaires, opérationnels ou technologiques.",
        "Les changements substantiels seront notifiés par e-mail à l'adresse enregistrée ou avis sur la plateforme.",
        "L'utilisation continue du Service après les modifications constitue l'acceptation de la nouvelle Politique. Si l'utilisateur n'accepte pas les changements, il doit cesser d'utiliser le Service."
      ]
    },
    section10: {
      title: "10. Contact et Autorité de Contrôle",
      contact: {
        title: "10.1 Contact",
        privacy: "Demandes de confidentialité: privacy@gisinsight.io",
        security: "Incidents de sécurité: security@gisinsight.io",
        support: "Support général: support@gisinsight.io"
      },
      supervisoryAuthority: {
        title: "10.2 Autorité de Contrôle",
        name: "Autorité de contrôle de la protection des données compétente dans votre juridiction",
        address: ["Informations de contact disponibles auprès de", "votre autorité locale de protection des données"],
        website: "Consultez votre autorité locale de protection des données"
      }
    },
    section11: {
      title: "11. Droit Applicable et Juridiction",
      applicableLaw: {
        title: "11.1 Droit Applicable",
        intro: "Cette Politique est régie par les lois applicables en matière de protection des données, notamment:",
        items: [
          "Règlement (UE) 2016/679 (RGPD)",
          "Législation nationale applicable en matière de protection des données"
        ]
      },
      jurisdiction: {
        title: "11.2 Juridiction",
        content: "Pour la résolution des litiges, les parties se soumettent aux tribunaux compétents conformément à la loi applicable."
      }
    },
    footer: {
      version: "Version 1.0",
      effectiveDate: "Date d'entrée en vigueur: 10 décembre 2025"
    }
  },
  de: {
    title: "Datenschutzrichtlinie",
    section1: {
      title: "1. Verantwortlicher",
      denomination: "Bezeichnung:",
      contact: "Kontakt:",
    },
    section2: {
      title: "2. Erfasste Informationen",
      registrationData: {
        title: "2.1 Registrierungsdaten",
        intro: "Während des Registrierungsprozesses erfassen wir:",
        items: [
          "E-Mail-Adresse",
          "Passwort (mit bcrypt-Hash gespeichert)",
          "Name oder Organisation (optional)",
          "Datum der Kontoerstellung"
        ]
      },
      configurationData: {
        title: "2.2 Konfigurationsdaten",
        intro: "Während der Plattformkonfiguration speichern wir:",
        items: [
          "Abonnierte MQTT-Topics",
          "MQTT-Broker-URLs und Anmeldeinformationen (verschlüsselt mit AES-256)",
          "JSON-Konfigurationen für Datensätze und Zuordnungen",
          "Alarmdefinitionen, Bedingungen und Schwellenwerte",
          "Benutzerdefinierte geospatiale Ebenen",
          "Visualisierungseinstellungen"
        ]
      },
      mqttTelemetry: {
        title: "2.3 MQTT-Telemetrie",
        intro: "Wir verarbeiten in Echtzeit:",
        items: [
          "Von MQTT-Brokern empfangene JSON-Nutzdaten",
          "Gemäß Zuordnungen extrahierte numerische Werte",
          "Geografische Koordinaten (Breitengrad/Längengrad)",
          "Ereigniszeitstempel"
        ],
        alert: {
          title: "Wichtig",
          content: "Daten werden hauptsächlich für die Echtzeit-Visualisierung verarbeitet. Die historische Speicherung ist temporär (typischerweise 7-30 Tage) und nicht garantiert. Historische Daten können jederzeit gelöscht werden."
        }
      },
      technicalLogs: {
        title: "2.4 Technische Protokolle",
        intro: "Es werden Systemprotokolle erstellt, die Folgendes enthalten können:",
        items: [
          "MQTT-Verbindungsfehler",
          "Durch Validierung abgelehnte Nutzdaten",
          "Aggregierte Leistungsmetriken",
          "Benutzeraktionen (Anmeldung/Abmeldung, Änderungen)",
          "IP-Adresse und User-Agent (Zweck: Sicherheit)"
        ]
      },
      cookiesStorage: {
        title: "2.5 Cookies und lokale Speicherung",
        items: [
          "Sitzungs-Cookie (JWT-Token) zur Authentifizierung",
          "LocalStorage für Schnittstellenpräferenzen",
          "Keine Drittanbieter-Cookies oder Werbe-Tracking"
        ]
      }
    },
    section3: {
      title: "3. Verarbeitungszwecke",
      legalBasis: {
        title: "3.1 Rechtsgrundlage",
        intro: "Die Datenverarbeitung basiert auf:",
        items: [
          "Erfüllung des Dienstleistungsvertrags",
          "Berechtigtes Interesse des Verantwortlichen an der Serviceverbesserung",
          "Einwilligung des Nutzers für optionale Kommunikation"
        ]
      },
      purposes: {
        title: "3.2 Zwecke",
        serviceOperation: {
          title: "Servicebetrieb:",
          items: [
            "Benutzerauthentifizierung",
            "Verbindung zu MQTT-Brokern",
            "Echtzeit-Datenverarbeitung und -visualisierung",
            "Ausführung von Alarmregeln",
            "Darstellung geospatialer Karten",
            "Wartung von Konfigurationen"
          ]
        },
        serviceImprovement: {
          title: "Serviceverbesserung:",
          items: [
            "Leistungsanalyse (aggregierte und anonymisierte Daten)",
            "Funktionsentwicklung",
            "Algorithmusoptimierung",
            "Forschung und Experimente"
          ]
        },
        essentialComms: {
          title: "Wesentliche Kommunikation:",
          items: [
            "Kontobestätigung",
            "Kritische Sicherheitsbenachrichtigungen",
            "Änderungen an Bedingungen oder Richtlinien",
            "Servicerelevante Wartung",
            "Serviceeinstellung (30 Tage Vorankündigung)"
          ]
        }
      }
    },
    section4: {
      title: "4. Datenweitergabe",
      noCommercialization: {
        title: "4.1 Keine Kommerzialisierung",
        content: "Wir verkaufen, vermieten oder tauschen personenbezogene Daten nicht zu kommerziellen Zwecken an Dritte."
      },
      dataRecipients: {
        title: "4.2 Datenempfänger",
        mapbox: {
          name: "Mapbox (mapbox.com)",
          description: "Geografische Koordinaten für Kartendarstellung",
          policy: "Richtlinie: https://www.mapbox.com/legal/privacy"
        },
        hosting: {
          name: "Hosting-Anbieter",
          description: "Daten in verschlüsseltem Format gespeichert",
          access: "Eingeschränkter Zugriff für Wartung"
        },
        payment: {
          name: "Zahlungsdienstleister (zukünftig)",
          description: "Abrechnungsinformationen",
          note: "Keine Kartendaten gespeichert (Tokenisierung)"
        },
        legal: {
          name: "Gesetzliche Anforderungen",
          description: "Informationen können offengelegt werden, wenn gesetzlich erforderlich (Gerichtsbeschluss, Vorladung) oder zur Verhinderung von Betrug oder illegalen Aktivitäten notwendig."
        },
        businessTransfers: {
          name: "Unternehmensübertragungen",
          description: "Im Falle von Fusion, Übernahme oder Insolvenzverfahren können Daten an die neue Einheit übertragen werden. E-Mail-Benachrichtigung wird nach Möglichkeit bereitgestellt."
        }
      },
      internationalTransfers: {
        title: "4.3 Internationale Übermittlungen",
        content: "Daten können auf Servern in der Europäischen Union oder in Drittländern mit Angemessenheitsbeschlüssen oder geeigneten Garantien gemäß DSGVO verarbeitet werden."
      }
    },
    section5: {
      title: "5. Datenspeicherung",
      accountData: {
        title: "5.1 Kontodaten",
        items: [
          "Während der Gültigkeit: Solange das Konto aktiv ist",
          "Nach Löschung: 90 Tage (einschließlich Backups)",
          "Anonymisierte Audit-Logs können aufbewahrt werden"
        ]
      },
      mqttTelemetry: {
        title: "5.2 MQTT-Telemetrie",
        items: [
          "Typischer Zeitraum: 7-30 Tage (variabel je nach Systemlast)",
          "Automatische Löschung aufgrund von Speichergrenzen, Rotationsrichtlinien, Optimierung oder Kontoschließung",
          "Verfügbarkeit über 7 Tage hinaus ist nicht garantiert"
        ]
      },
      systemLogs: {
        title: "5.3 Systemprotokolle",
        items: [
          "Unbegrenzte und diskretionäre Aufbewahrung",
          "Können ohne Vorankündigung gelöscht werden",
          "Enthalten technische Daten, nicht den Inhalt von MQTT-Nutzdaten"
        ]
      },
      serviceClosure: {
        title: "5.4 Serviceeinstellung",
        intro: "Im Falle einer endgültigen Einstellung:",
        items: [
          "Benachrichtigung 30 Tage im Voraus (falls möglich)",
          "Exportfunktion (falls technisch machbar)",
          "30-Tage-Frist zum Exportieren von Daten",
          "Permanente Löschung nach Schließung"
        ]
      }
    },
    section6: {
      title: "6. Sicherheit",
      technicalMeasures: {
        title: "6.1 Technische und organisatorische Maßnahmen",
        inTransit: {
          title: "Bei Übertragung:",
          items: [
            "TLS/SSL-Verschlüsselung (HTTPS)",
            "Sichere MQTT-Verbindungen (MQTTS)",
            "JWT-Token mit Ablauf"
          ]
        },
        atRest: {
          title: "Im Ruhezustand:",
          items: [
            "AES-256-Verschlüsselung für MQTT-Anmeldeinformationen",
            "Bcrypt-Hash für Passwörter",
            "Festplattenverschlüsselung"
          ]
        },
        accessControl: {
          title: "Zugriffskontrolle:",
          items: [
            "Obligatorische Authentifizierung",
            "Eigentümerbasierte Autorisierung",
            "Ratenbegrenzung"
          ]
        },
        monitoring: {
          title: "Überwachung:",
          items: [
            "Zugriffs- und Fehlerprotokolle",
            "Erkennung anomaler Aktivitäten"
          ]
        }
      },
      securityBreaches: {
        title: "6.2 Sicherheitsverletzungen",
        intro: "Im Falle einer Verletzung personenbezogener Daten:",
        items: [
          "Untersuchung des Umfangs",
          "Benachrichtigung des Benutzers innerhalb von 72 Stunden (gemäß DSGVO)",
          "Benachrichtigung der Aufsichtsbehörde falls zutreffend",
          "Umsetzung von Korrekturmaßnahmen"
        ]
      },
      userResponsibilities: {
        title: "6.3 Benutzerverantwortlichkeiten",
        intro: "Der Benutzer muss:",
        items: [
          "Starke und eindeutige Passwörter verwenden",
          "Zwei-Faktor-Authentifizierung aktivieren (falls verfügbar)",
          "Anmeldeinformationen nicht weitergeben",
          "Geräte vor Malware schützen",
          "Auf gemeinsam genutzten Geräten abmelden",
          "Sicherheitslücken melden (security@gisinsight.io)"
        ]
      }
    },
    section7: {
      title: "7. Benutzerrechte",
      intro: "Gemäß DSGVO hat der Benutzer das Recht auf:",
      access: {
        title: "7.1 Zugang",
        content: "Bestätigung über die Verarbeitung seiner Daten und eine Kopie davon erhalten."
      },
      rectification: {
        title: "7.2 Berichtigung",
        content: "Korrektur unrichtiger oder unvollständiger Daten anfordern."
      },
      deletion: {
        title: "7.3 Löschung",
        intro: "Löschung seiner Daten anfordern, wenn:",
        items: [
          "Sie nicht mehr erforderlich sind",
          "Die Einwilligung widerrufen wird",
          "Widerspruch gegen die Verarbeitung ohne überwiegendes berechtigtes Interesse erhoben wird",
          "Sie unrechtmäßig verarbeitet wurden"
        ],
        deadline: "Frist: Vollständige Löschung innerhalb von 90 Tagen (einschließlich Backups)."
      },
      limitation: {
        title: "7.4 Einschränkung der Verarbeitung",
        intro: "Einschränkung anfordern, wenn:",
        items: [
          "Die Richtigkeit der Daten bestritten wird",
          "Die Verarbeitung unrechtmäßig ist, aber keine Löschung gewünscht wird",
          "Nicht mehr erforderlich, aber für Rechtsansprüche benötigt",
          "Widerspruch gegen die Verarbeitung eingelegt wurde"
        ]
      },
      portability: {
        title: "7.5 Datenübertragbarkeit",
        content: "Seine Daten in einem strukturierten, gängigen und maschinenlesbaren Format erhalten und an einen anderen Verantwortlichen übermitteln.",
        format: "Format: JSON (nach Ermessen des Verantwortlichen)."
      },
      opposition: {
        title: "7.6 Widerspruch",
        content: "Der Verarbeitung auf Grundlage berechtigter Interessen aus Gründen, die sich aus seiner besonderen Situation ergeben, widersprechen."
      },
      automatedDecisions: {
        title: "7.7 Automatisierte Entscheidungen",
        content: "Der Service verwendet keine ausschließlich auf automatisierter Verarbeitung beruhenden Entscheidungen, die rechtliche Wirkung entfalten oder den Benutzer erheblich beeinträchtigen."
      },
      exerciseRights: {
        title: "7.8 Ausübung der Rechte",
        contact: "Kontakt: privacy@gisinsight.io",
        responseTime: "Antwortzeit: 30 Tage (verlängerbar auf 60 Tage)",
        identityVerification: "Identitätsüberprüfung: Ein Nachweis kann vor der Bearbeitung der Anfrage erforderlich sein.",
        complaint: "Beschwerde: Der Benutzer hat das Recht, bei der zuständigen Aufsichtsbehörde Beschwerde einzulegen."
      }
    },
    section8: {
      title: "8. Serviceeinschränkungen",
      experimentalNature: {
        title: "8.1 Experimentelle Natur",
        intro: "GIS Insight ist ein experimentelles Projekt ohne Garantie für:",
        items: [
          "Kontinuierliche Verfügbarkeit",
          "Persistenz historischer Daten",
          "Zuverlässigkeit von Alarmen",
          "Genauigkeit von Visualisierungen",
          "Fehlerfreien Betrieb"
        ]
      },
      historicalData: {
        title: "8.2 Historische Daten",
        items: [
          "Die historische Speicherung ist temporär (typischerweise 7-30 Tage)",
          "Daten können ohne Vorankündigung gelöscht werden",
          "Keine Garantie für Wiederherstellung nach Verlust",
          "Der Service stellt kein Backup-System dar"
        ]
      },
      recommendation: {
        title: "8.3 Empfehlung",
        content: "Der Benutzer sollte Backups kritischer Daten führen und sich nicht ausschließlich auf GIS Insight für die Speicherung wichtiger Informationen verlassen."
      }
    },
    section9: {
      title: "9. Richtlinienänderungen",
      paragraphs: [
        "Diese Richtlinie kann jederzeit geändert werden, um sich an regulatorische, betriebliche oder technologische Änderungen anzupassen.",
        "Wesentliche Änderungen werden per E-Mail an die registrierte Adresse oder durch Hinweis auf der Plattform mitgeteilt.",
        "Die fortgesetzte Nutzung des Service nach Änderungen stellt die Akzeptanz der neuen Richtlinie dar. Wenn der Benutzer die Änderungen nicht akzeptiert, muss er die Nutzung des Service einstellen."
      ]
    },
    section10: {
      title: "10. Kontakt und Aufsichtsbehörde",
      contact: {
        title: "10.1 Kontakt",
        privacy: "Datenschutzanfragen: privacy@gisinsight.io",
        security: "Sicherheitsvorfälle: security@gisinsight.io",
        support: "Allgemeiner Support: support@gisinsight.io"
      },
      supervisoryAuthority: {
        title: "10.2 Aufsichtsbehörde",
        name: "Zuständige Datenschutzaufsichtsbehörde in Ihrer Rechtsordnung",
        address: ["Kontaktinformationen verfügbar bei", "Ihrer lokalen Datenschutzbehörde"],
        website: "Siehe Ihre lokale Datenschutzbehörde"
      }
    },
    section11: {
      title: "11. Anwendbares Recht und Gerichtsstand",
      applicableLaw: {
        title: "11.1 Anwendbares Recht",
        intro: "Diese Richtlinie unterliegt den geltenden Datenschutzgesetzen, insbesondere:",
        items: [
          "Verordnung (EU) 2016/679 (DSGVO)",
          "Anwendbare nationale Datenschutzgesetzgebung"
        ]
      },
      jurisdiction: {
        title: "11.2 Gerichtsstand",
        content: "Zur Beilegung von Streitigkeiten unterwerfen sich die Parteien den zuständigen Gerichten gemäß geltendem Recht."
      }
    },
    footer: {
      version: "Version 1.0",
      effectiveDate: "Wirksamkeitsdatum: 10. Dezember 2025"
    }
  }
}
// Traducciones del navbar
export const navTranslations: Record<Language, {
  home: string;
  blog: string;
  pricing: string;
  dashboard: string;
  signIn: string;
  signOut: string;
  language: string;
}> = {
  en: {
    home: "Home",
    blog: "Blog",
    pricing: "Pricing",
    dashboard: "Dashboard",
    signIn: "Sign In",
    signOut: "Sign Out",
    language: "Language"
  },
  es: {
    home: "Inicio",
    blog: "Blog",
    pricing: "Precios",
    dashboard: "Panel",
    signIn: "Iniciar Sesión",
    signOut: "Cerrar Sesión", 
    language: "Idioma"
  },
  pt: {
    home: "Início",
    blog: "Blog",
    pricing: "Preços",
    dashboard: "Painel",
    signIn: "Entrar",
    signOut: "Sair",
    language: "Idioma"
  },
  ja: {
    home: "ホーム",
    blog: "ブログ",
    pricing: "料金",
    dashboard: "ダッシュボード", 
    signIn: "ログイン",
    signOut: "ログアウト",
    language: "言語"
  },
  fr: {
    home: "Accueil",
    blog: "Blog",
    pricing: "Tarifs",
    dashboard: "Tableau de bord",
    signIn: "Se connecter",
    signOut: "Se déconnecter",
    language: "Langue"
  },
  de: {
    home: "Startseite",
    blog: "Blog",
    pricing: "Preise", 
    dashboard: "Dashboard",
    signIn: "Anmelden",
    signOut: "Abmelden",
    language: "Sprache"
  }
};

// Traducciones del header de términos de uso
export const headerTermsTranslations: Record<Language, {
  title: string;
  lastUpdated: string;
}> = {
  en: {
    title: "Terms of Use",
    lastUpdated: "Last updated: December 10, 2025"
  },
  es: {
    title: "Términos de Uso",
    lastUpdated: "Última actualización: 10 de diciembre de 2025"
  },
  pt: {
    title: "Termos de Uso",
    lastUpdated: "Última atualização: 10 de dezembro de 2025"
  },
  ja: {
    title: "利用規約",
    lastUpdated: "最終更新日: 2025年12月10日"
  },
  fr: {
    title: "Conditions d'Utilisation",
    lastUpdated: "Dernière mise à jour : 10 décembre 2025"
  },
  de: {
    title: "Nutzungsbedingungen",
    lastUpdated: "Letzte Aktualisierung: 10. Dezember 2025"
  }
};


export const headerTermsPrivacyTranslations: Record<Language, {
  title: string;
  lastUpdated: string;
}> = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: December 10, 2025"
  },
  es: {
    title: "Política de Privacidad",
    lastUpdated: "Última actualización: 10 de diciembre de 2025"
  },
  pt: {
    title: "Política de Privacidade",
    lastUpdated: "Última atualização: 10 de dezembro de 2025"
  },
  ja: {
    title: "プライバシーポリシー",
    lastUpdated: "最終更新日: 2025年12月10日"
  },
  fr: {
    title: "Politique de Confidentialité",
    lastUpdated: "Dernière mise à jour : 10 décembre 2025"
  },
  de: {
    title: "Datenschutzrichtlinie",
    lastUpdated: "Letzte Aktualisierung: 10. Dezember 2025"
  }
};


// Traducciones del hero section
export const heroTranslations: Record<Language, {
  eyebrow: string;
  headline1: string;
  headline2: string;
  headline3: string;
  subheadline: string;
  ctaPrimary: string;
  ctaSecondary: string;
}> = {
  en: {
    eyebrow: "Industrial Digital Twin Platform",
    headline1: "See Your",
    headline2: "Infrastructure.",
    headline3: "In Real Time.",
    subheadline: "GIS Insight connects billions of MQTT signals from your sensors, PLCs, and edge devices rendered live on geospatial maps. One platform. Every asset. Total operational clarity.",
    ctaPrimary: "Request Early Access",
    ctaSecondary: "Watch Platform Demo"
  },
  es: {
    eyebrow: "Plataforma de Gemelo Digital Industrial",
    headline1: "Visualiza Tu",
    headline2: "Infraestructura.",
    headline3: "En Tiempo Real.",
    subheadline: "GIS Insight conecta miles de millones de señales MQTT de tus sensores, PLCs y dispositivos edge renderizados en vivo en mapas geoespaciales. Una plataforma. Cada activo. Claridad operacional total.",
    ctaPrimary: "Solicitar Acceso Anticipado",
    ctaSecondary: "Ver Demo de la Plataforma"
  },
  pt: {
    eyebrow: "Plataforma de Gêmeo Digital Industrial",
    headline1: "Veja Sua",
    headline2: "Infraestrutura.",
    headline3: "Em Tempo Real.",
    subheadline: "GIS Insight conecta bilhões de sinais MQTT de seus sensores, PLCs e dispositivos edge renderizados ao vivo em mapas geoespaciais. Uma plataforma. Cada ativo. Clareza operacional total.",
    ctaPrimary: "Solicitar Acesso Antecipado",
    ctaSecondary: "Assistir Demo da Plataforma"
  },
  ja: {
    eyebrow: "産業用デジタルツインプラットフォーム",
    headline1: "インフラを",
    headline2: "可視化。",
    headline3: "リアルタイムで。",
    subheadline: "GIS Insightは、センサー、PLC、エッジデバイスからの数十億のMQTT信号を地理空間マップ上でライブレンダリングします。1つのプラットフォーム。すべての資産。完全な運用の明確性。",
    ctaPrimary: "早期アクセスをリクエスト",
    ctaSecondary: "プラットフォームデモを見る"
  },
  fr: {
    eyebrow: "Plateforme de Jumeau Numérique Industriel",
    headline1: "Visualisez Votre",
    headline2: "Infrastructure.",
    headline3: "En Temps Réel.",
    subheadline: "GIS Insight connecte des milliards de signaux MQTT de vos capteurs, automates et appareils edge rendus en direct sur des cartes géospatiales. Une plateforme. Chaque actif. Clarté opérationnelle totale.",
    ctaPrimary: "Demander un Accès Anticipé",
    ctaSecondary: "Voir la Démo de la Plateforme"
  },
  de: {
    eyebrow: "Industrielle Digital Twin Plattform",
    headline1: "Sehen Sie Ihre",
    headline2: "Infrastruktur.",
    headline3: "In Echtzeit.",
    subheadline: "GIS Insight verbindet Milliarden von MQTT-Signalen von Ihren Sensoren, SPSen und Edge-Geräten, die live auf Geokarten dargestellt werden. Eine Plattform. Jedes Asset. Vollständige operative Klarheit.",
    ctaPrimary: "Frühzugang Anfordern",
    ctaSecondary: "Plattform-Demo Ansehen"
  }
};


// Traducciones del hero section
export const old_heroTranslations: Record<Language, {
  title: string;
  subtitle: string;
  subtitleHighlight: string;
  getStarted: string;
  viewPricing: string;
  features: {
    ai: { title: string; description: string };
    fast: { title: string; description: string };
    secure: { title: string; description: string };
    multilingual: { title: string; description: string };
  };
}> = {
  en: {
    title: "PDF Analyzer",
    subtitle: "Transform lengthy documents into intelligent summaries with advanced AI",
    subtitleHighlight: "intelligent summaries",
    getStarted: "Get Started",
    viewPricing: "View Pricing",
    features: {
      ai: {
        title: "AI-Powered",
        description: "Advanced algorithms for precise analysis"
      },
      fast: {
        title: "Lightning Fast",
        description: "Process documents in seconds"
      },
      secure: {
        title: "Secure & Private",
        description: "Your documents are always protected"
      },
      multilingual: {
        title: "Multi-language",
        description: "Support for 50+ languages"
      }
    }
  },
  es: {
    title: "Analizador de PDF",
    subtitle: "Transforma documentos extensos en resúmenes inteligentes con IA avanzada",
    subtitleHighlight: "resúmenes inteligentes",
    getStarted: "Comenzar",
    viewPricing: "Ver Precios",
    features: {
      ai: {
        title: "Impulsado por IA",
        description: "Algoritmos avanzados para análisis preciso"
      },
      fast: {
        title: "Súper Rápido",
        description: "Procesa documentos en segundos"
      },
      secure: {
        title: "Seguro y Privado",
        description: "Tus documentos siempre protegidos"
      },
      multilingual: {
        title: "Multiidioma",
        description: "Soporte para más de 50 idiomas"
      }
    }
  },
  pt: {
    title: "Analisador de PDF",
    subtitle: "Transforme documentos longos em resumos inteligentes com IA avançada",
    subtitleHighlight: "resumos inteligentes",
    getStarted: "Começar",
    viewPricing: "Ver Preços",
    features: {
      ai: {
        title: "Powered by IA",
        description: "Algoritmos avançados para análise precisa"
      },
      fast: {
        title: "Super Rápido",
        description: "Processa documentos em segundos"
      },
      secure: {
        title: "Seguro e Privado",
        description: "Seus documentos sempre protegidos"
      },
      multilingual: {
        title: "Multilíngue",
        description: "Suporte para mais de 50 idiomas"
      }
    }
  },
  ja: {
    title: "PDF アナライザー",
    subtitle: "高度なAIで長い文書をインテリジェントな要約に変換",
    subtitleHighlight: "インテリジェントな要約",
    getStarted: "始める",
    viewPricing: "料金を見る",
    features: {
      ai: {
        title: "AI駆動",
        description: "精密な分析のための高度なアルゴリズム"
      },
      fast: {
        title: "超高速",
        description: "数秒で文書を処理"
      },
      secure: {
        title: "安全・プライベート",
        description: "あなたの文書は常に保護されています"
      },
      multilingual: {
        title: "多言語対応",
        description: "50以上の言語をサポート"
      }
    }
  },
  fr: {
    title: "Analyseur PDF",
    subtitle: "Transformez de longs documents en résumés intelligents avec une IA avancée",
    subtitleHighlight: "résumés intelligents",
    getStarted: "Commencer",
    viewPricing: "Voir les Prix",
    features: {
      ai: {
        title: "Alimenté par IA",
        description: "Algorithmes avancés pour une analyse précise"
      },
      fast: {
        title: "Ultra Rapide",
        description: "Traite les documents en quelques secondes"
      },
      secure: {
        title: "Sécurisé et Privé",
        description: "Vos documents sont toujours protégés"
      },
      multilingual: {
        title: "Multilingue",
        description: "Support de plus de 50 langues"
      }
    }
  },
  de: {
    title: "PDF Analyzer",
    subtitle: "Verwandeln Sie lange Dokumente mit fortschrittlicher KI in intelligente Zusammenfassungen",
    subtitleHighlight: "intelligente Zusammenfassungen",
    getStarted: "Loslegen",
    viewPricing: "Preise Ansehen",
    features: {
      ai: {
        title: "KI-Powered",
        description: "Erweiterte Algorithmen für präzise Analyse"
      },
      fast: {
        title: "Blitzschnell",
        description: "Verarbeitet Dokumente in Sekunden"
      },
      secure: {
        title: "Sicher & Privat",
        description: "Ihre Dokumente sind immer geschützt"
      },
      multilingual: {
        title: "Mehrsprachig",
        description: "Unterstützung für über 50 Sprachen"
      }
    }
  }
};

// Traducciones para la vista pública de factura
export const publicInvoiceTranslations: Record<Language, {
  title: string;
  invoiceTitle: string;
  issuedOn: string;
  dueDate: string;
  amount: string;
  status: string;
  fromLabel: string;
  toLabel: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
  subtotal: string;
  tax: string;
  discount: string;
  finalAmount: string;
  footerText: string;
  paid: string;
  pending: string;
  overdue: string;
  cancelled: string;
  downloadPdf: string;
  printInvoice: string;
  contactInfo: string;
  items: string;
  language: string;
}> = {
  en: {
    title: "Public Invoice View",
    invoiceTitle: "Invoice",
    issuedOn: "Issued on",
    dueDate: "Due date",
    amount: "Amount",
    status: "Status",
    fromLabel: "From",
    toLabel: "To",
    description: "Description",
    quantity: "Qty",
    unitPrice: "Unit Price",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Tax",
    discount: "Discount", 
    finalAmount: "Final Amount",
    footerText: "This is a public view of the invoice. For questions, please contact the issuer.",
    paid: "Paid",
    pending: "Pending",
    overdue: "Overdue",
    cancelled: "Cancelled",
    downloadPdf: "Download PDF",
    printInvoice: "Print Invoice",
    contactInfo: "Contact Information",
    items: "Items",
    language: "Language"
  },
  es: {
    title: "Vista Pública de Factura",
    invoiceTitle: "Factura",
    issuedOn: "Emitida el",
    dueDate: "Fecha de vencimiento",
    amount: "Importe",
    status: "Estado",
    fromLabel: "De",
    toLabel: "Para",
    description: "Descripción",
    quantity: "Cant.",
    unitPrice: "Precio Unit.",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Impuestos",
    discount: "Descuento",
    finalAmount: "Importe Final",
    footerText: "Esta es una vista pública de la factura. Para consultas, contacte al emisor.",
    paid: "Pagada",
    pending: "Pendiente",
    overdue: "Vencida",
    cancelled: "Cancelada",
    downloadPdf: "Descargar PDF",
    printInvoice: "Imprimir Factura",
    contactInfo: "Información de Contacto",
    items: "Elementos",
    language: "Idioma"
  },
  pt: {
    title: "Visualização Pública da Fatura",
    invoiceTitle: "Fatura",
    issuedOn: "Emitida em",
    dueDate: "Data de vencimento",
    amount: "Valor",
    status: "Status",
    fromLabel: "De",
    toLabel: "Para",
    description: "Descrição",
    quantity: "Qtd.",
    unitPrice: "Preço Unit.",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Impostos",
    discount: "Desconto",
    finalAmount: "Valor Final",
    footerText: "Esta é uma visualização pública da fatura. Para dúvidas, entre em contato com o emissor.",
    paid: "Paga",
    pending: "Pendente",
    overdue: "Vencida",
    cancelled: "Cancelada",
    downloadPdf: "Baixar PDF",
    printInvoice: "Imprimir Fatura",
    contactInfo: "Informações de Contato",
    items: "Itens",
    language: "Idioma"
  },
  ja: {
    title: "請求書公開ビュー",
    invoiceTitle: "請求書",
    issuedOn: "発行日",
    dueDate: "支払期限",
    amount: "金額",
    status: "ステータス",
    fromLabel: "発行者",
    toLabel: "宛先",
    description: "説明",
    quantity: "数量",
    unitPrice: "単価",
    total: "合計",
    subtotal: "小計",
    tax: "税金",
    discount: "割引",
    finalAmount: "最終金額",
    footerText: "これは請求書の公開ビューです。ご質問は発行者にお問い合わせください。",
    paid: "支払済み",
    pending: "支払待ち",
    overdue: "期限切れ",
    cancelled: "キャンセル",
    downloadPdf: "PDF ダウンロード",
    printInvoice: "請求書を印刷",
    contactInfo: "連絡先情報",
    items: "項目",
    language: "言語"
  },
  fr: {
    title: "Vue Publique de la Facture",
    invoiceTitle: "Facture",
    issuedOn: "Émise le",
    dueDate: "Date d'échéance",
    amount: "Montant",
    status: "Statut",
    fromLabel: "De",
    toLabel: "À",
    description: "Description",
    quantity: "Qté",
    unitPrice: "Prix Unit.",
    total: "Total",
    subtotal: "Sous-total",
    tax: "Taxe",
    discount: "Remise",
    finalAmount: "Montant Final",
    footerText: "Il s'agit d'une vue publique de la facture. Pour toute question, contactez l'émetteur.",
    paid: "Payée",
    pending: "En attente",
    overdue: "En retard",
    cancelled: "Annulée",
    downloadPdf: "Télécharger PDF",
    printInvoice: "Imprimer Facture",
    contactInfo: "Informations de Contact",
    items: "Articles",
    language: "Langue"
  },
  de: {
    title: "Öffentliche Rechnungsansicht",
    invoiceTitle: "Rechnung",
    issuedOn: "Ausgestellt am",
    dueDate: "Fälligkeitsdatum",
    amount: "Betrag",
    status: "Status",
    fromLabel: "Von",
    toLabel: "An",
    description: "Beschreibung",
    quantity: "Anz.",
    unitPrice: "Einzelpreis",
    total: "Gesamt",
    subtotal: "Zwischensumme",
    tax: "Steuer",
    discount: "Rabatt",
    finalAmount: "Endbetrag",
    footerText: "Dies ist eine öffentliche Ansicht der Rechnung. Bei Fragen wenden Sie sich an den Aussteller.",
    paid: "Bezahlt",
    pending: "Ausstehend",
    overdue: "Überfällig",
    cancelled: "Storniert",
    downloadPdf: "PDF Herunterladen",
    printInvoice: "Rechnung Drucken",
    contactInfo: "Kontaktinformationen",
    items: "Artikel",
    language: "Sprache"
  }
};

// **NUEVAS TRADUCCIONES PARA PROMPT USAGE DISPLAY**
export const promptUsageTranslations: Record<Language, {
  title: string;
  available: string;
  limitReached: string;
  progress: string;
  remainingPrompts: string;
  nextReset: string;
  limitReachedMessage: string;
  lowUsageWarning: string;
  error: string;
}> = {
  en: {
    title: "Monthly Prompt Usage",
    available: "Available",
    limitReached: "Limit reached",
    progress: "Progress",
    remainingPrompts: "Remaining Prompts",
    nextReset: "Next Reset",
    limitReachedMessage: "You've reached your monthly prompt limit. Your quota will reset on",
    lowUsageWarning: "You're running low on prompts this month. Consider upgrading your plan for more access.",
    error: "Error"
  },
  es: {
    title: "Uso Mensual de Prompts",
    available: "Disponible",
    limitReached: "Límite alcanzado",
    progress: "Progreso",
    remainingPrompts: "Prompts Restantes",
    nextReset: "Próximo Reinicio",
    limitReachedMessage: "Has alcanzado tu límite mensual de prompts. Tu cuota se reiniciará el",
    lowUsageWarning: "Te quedan pocos prompts este mes. Considera actualizar tu plan para más acceso.",
    error: "Error"
  },
  pt: {
    title: "Uso Mensal de Prompts",
    available: "Disponível",
    limitReached: "Limite atingido",
    progress: "Progresso",
    remainingPrompts: "Prompts Restantes",
    nextReset: "Próximo Reset",
    limitReachedMessage: "Você atingiu seu limite mensal de prompts. Sua cota será reiniciada em",
    lowUsageWarning: "Você está ficando com poucos prompts este mês. Considere fazer upgrade do seu plano para mais acesso.",
    error: "Erro"
  },
  ja: {
    title: "月間プロンプト使用量",
    available: "利用可能",
    limitReached: "制限に達しました",
    progress: "進行状況",
    remainingPrompts: "残りプロンプト",
    nextReset: "次回リセット",
    limitReachedMessage: "月間プロンプト制限に達しました。クォータは次の日にリセットされます：",
    lowUsageWarning: "今月のプロンプトが不足しています。より多くのアクセスのためにプランのアップグレードを検討してください。",
    error: "エラー"
  },
  fr: {
    title: "Usage Mensuel des Prompts",
    available: "Disponible",
    limitReached: "Limite atteinte",
    progress: "Progression",
    remainingPrompts: "Prompts Restants",
    nextReset: "Prochaine Réinitialisation",
    limitReachedMessage: "Vous avez atteint votre limite mensuelle de prompts. Votre quota sera réinitialisé le",
    lowUsageWarning: "Il vous reste peu de prompts ce mois-ci. Envisagez de mettre à niveau votre plan pour plus d'accès.",
    error: "Erreur"
  },
  de: {
    title: "Monatliche Prompt-Nutzung",
    available: "Verfügbar",
    limitReached: "Limit erreicht",
    progress: "Fortschritt",
    remainingPrompts: "Verbleibende Prompts",
    nextReset: "Nächster Reset",
    limitReachedMessage: "Sie haben Ihr monatliches Prompt-Limit erreicht. Ihr Kontingent wird zurückgesetzt am",
    lowUsageWarning: "Ihnen gehen die Prompts in diesem Monat aus. Erwägen Sie ein Upgrade Ihres Plans für mehr Zugang.",
    error: "Fehler"
  }
};

// Utilidades para detectar idioma
export const detectBrowserLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.split('-')[0];
  const supportedLanguages: Language[] = ['en', 'es', 'pt', 'ja', 'fr', 'de'];
  
  return supportedLanguages.includes(browserLang as Language) 
    ? (browserLang as Language) 
    : 'en';
};

export const getStoredLanguage = (): Language | null => {
  if (typeof window === 'undefined') return null;
  
  const stored = localStorage.getItem('preferred-language');
  const supportedLanguages: Language[] = ['en', 'es', 'pt', 'ja', 'fr', 'de'];
  
  return stored && supportedLanguages.includes(stored as Language) 
    ? (stored as Language) 
    : null;
};

export const setStoredLanguage = (language: Language): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('preferred-language', language);
};

// Traducciones para la página de pricing
export const pricingTranslations: Record<Language, {
  title: string;
  back: string;
  popularBadge: string;
  activeBadge: string;
  plan: {
    title: string;
    subtitle: string;
    price: string;
    period: string;
    mainFeatures: {
      invoicesTitle: string;
      invoicesSubtitle: string;
      promptsTitle: string;
      promptsSubtitle: string;
      earlyAccessTitle: string;
      earlyAccessSubtitle: string;
    };
    button: {
      subscribe: string;
      manageSubscription: string;
      signInToSubscribe: string;
    };
    securityText: string;
    toggleDetails: {
      show: string;
      hide: string;
    };
    extendedStorage: {
      title: string;
      description: string;
      subtitle: string;
    };
    premiumFeatures: {
      title: string;
      emailSend: {
        title: string;
        subtitle: string;
      };
      prioritySupport: {
        title: string;
        subtitle: string;
      };
    };
    comingSoon: {
      title: string;
      qrTemplates: {
        title: string;
        subtitle: string;
      };
      stripePayment: {
        title: string;
        subtitle: string;
      };
    };
    betaAccess: {
      title: string;
      api: {
        title: string;
        subtitle: string;
      };
      betaTesting: {
        title: string;
        subtitle: string;
      };
      exclusiveTemplates: {
        title: string;
        subtitle: string;
      };
    };
  };
}> = {
  en: {
    title: "Subscription Plan",
    back: "Back",
    popularBadge: "Most Popular Plan",
    activeBadge: "Active",
    plan: {
      title: "Invoice Generator Pro",
      subtitle: "Complete plan for professionals and small businesses",
      price: "$19.99",
      period: "/month",
      mainFeatures: {
        invoicesTitle: "100 invoices per month",
        invoicesSubtitle: "vs 5 in free plan - 20x more capacity",
        promptsTitle: "100 AI prompts per month", 
        promptsSubtitle: "vs 10 in free plan - Total automation",
        earlyAccessTitle: "Early Access",
        earlyAccessSubtitle: "New features before anyone else"
      },
      button: {
        subscribe: "🚀 Upgrade to Pro - $19.99/month",
        manageSubscription: "Manage Subscription",
        signInToSubscribe: "Sign In to Subscribe"
      },
      securityText: "✅ Cancel anytime • 💳 Secure payment with Stripe",
      toggleDetails: {
        show: "See all benefits",
        hide: "Hide details"
      },
      extendedStorage: {
        title: "Extended Storage",
        description: "2-year storage",
        subtitle: "vs 30 days in free plan"
      },
      premiumFeatures: {
        title: "Premium Features",
        emailSend: {
          title: "Email sending",
          subtitle: "Share invoices directly"
        },
        prioritySupport: {
          title: "Priority support",
          subtitle: "24h response guaranteed"
        }
      },
      comingSoon: {
        title: "Coming Soon",
        qrTemplates: {
          title: "QR templates",
          subtitle: "Automatic QR codes"
        },
        stripePayment: {
          title: "Stripe payment button",
          subtitle: "Integrated collections"
        }
      },
      betaAccess: {
        title: "Early Access Beta",
        api: {
          title: "MCP API",
          subtitle: "Advanced automation"
        },
        betaTesting: {
          title: "Beta testing",
          subtitle: "Features first"
        },
        exclusiveTemplates: {
          title: "Exclusive templates",
          subtitle: "Unique designs"
        }
      }
    }
  },
  es: {
    title: "Plan de Suscripción",
    back: "Atrás",
    popularBadge: "Plan Más Popular",
    activeBadge: "Activo",
    plan: {
      title: "Invoice Generator Pro",
      subtitle: "Plan completo para profesionales y pequeños negocios",
      price: "€19.99",
      period: "/mes",
      mainFeatures: {
        invoicesTitle: "100 facturas por mes",
        invoicesSubtitle: "vs 5 en plan gratuito - 20x más capacidad",
        promptsTitle: "100 prompts de IA por mes",
        promptsSubtitle: "vs 10 en plan gratuito - Automatización total",
        earlyAccessTitle: "Acceso Anticipado",
        earlyAccessSubtitle: "Nuevas funciones antes que nadie"
      },
      button: {
        subscribe: "🚀 Actualizar a Pro - €19.99/mes",
        manageSubscription: "Gestionar Suscripción",
        signInToSubscribe: "Iniciar Sesión para Suscribirse"
      },
      securityText: "✅ Cancela cuando quieras • 💳 Pago seguro con Stripe",
      toggleDetails: {
        show: "Ver todos los beneficios",
        hide: "Ocultar detalles"
      },
      extendedStorage: {
        title: "Almacenamiento Extendido",
        description: "Almacenamiento 2 años",
        subtitle: "vs 30 días en plan gratuito"
      },
      premiumFeatures: {
        title: "Características Premium",
        emailSend: {
          title: "Envío por email",
          subtitle: "Comparte facturas directamente"
        },
        prioritySupport: {
          title: "Soporte prioritario",
          subtitle: "Respuesta en 24h garantizada"
        }
      },
      comingSoon: {
        title: "Próximamente Disponible",
        qrTemplates: {
          title: "Plantillas con QR",
          subtitle: "Códigos QR automáticos"
        },
        stripePayment: {
          title: "Botón de pago Stripe",
          subtitle: "Cobros integrados"
        }
      },
      betaAccess: {
        title: "Acceso Anticipado Beta",
        api: {
          title: "API MCP",
          subtitle: "Automatización avanzada"
        },
        betaTesting: {
          title: "Beta testing",
          subtitle: "Funciones primero"
        },
        exclusiveTemplates: {
          title: "Plantillas exclusivas",
          subtitle: "Diseños únicos"
        }
      }
    }
  },
  pt: {
    title: "Plano de Assinatura",
    back: "Voltar",
    popularBadge: "Plano Mais Popular",
    activeBadge: "Ativo",
    plan: {
      title: "Invoice Generator Pro",
      subtitle: "Plano completo para profissionais e pequenas empresas",
      price: "$19.99",
      period: "/mês",
      mainFeatures: {
        invoicesTitle: "100 faturas por mês",
        invoicesSubtitle: "vs 5 no plano gratuito - 20x mais capacidade",
        promptsTitle: "100 prompts de IA por mês",
        promptsSubtitle: "vs 10 no plano gratuito - Automação total",
        earlyAccessTitle: "Acesso Antecipado",
        earlyAccessSubtitle: "Novos recursos antes de todos"
      },
      button: {
        subscribe: "🚀 Atualizar para Pro - $19.99/mês",
        manageSubscription: "Gerenciar Assinatura",
        signInToSubscribe: "Entrar para Assinar"
      },
      securityText: "✅ Cancele a qualquer momento • 💳 Pagamento seguro com Stripe",
      toggleDetails: {
        show: "Ver todos os benefícios",
        hide: "Ocultar detalhes"
      },
      extendedStorage: {
        title: "Armazenamento Estendido",
        description: "Armazenamento de 2 anos",
        subtitle: "vs 30 dias no plano gratuito"
      },
      premiumFeatures: {
        title: "Recursos Premium",
        emailSend: {
          title: "Envio por email",
          subtitle: "Compartilhe faturas diretamente"
        },
        prioritySupport: {
          title: "Suporte prioritário",
          subtitle: "Resposta em 24h garantida"
        }
      },
      comingSoon: {
        title: "Em Breve",
        qrTemplates: {
          title: "Modelos com QR",
          subtitle: "Códigos QR automáticos"
        },
        stripePayment: {
          title: "Botão de pagamento Stripe",
          subtitle: "Cobranças integradas"
        }
      },
      betaAccess: {
        title: "Acesso Beta Antecipado",
        api: {
          title: "API MCP",
          subtitle: "Automação avançada"
        },
        betaTesting: {
          title: "Testes beta",
          subtitle: "Recursos primeiro"
        },
        exclusiveTemplates: {
          title: "Modelos exclusivos",
          subtitle: "Designs únicos"
        }
      }
    }
  },
  ja: {
    title: "サブスクリプションプラン",
    back: "戻る",
    popularBadge: "最も人気のプラン",
    activeBadge: "アクティブ",
    plan: {
      title: "Invoice Generator Pro",
      subtitle: "プロフェッショナルと小規模企業向けの完全プラン",
      price: "$19.99",
      period: "/月",
      mainFeatures: {
        invoicesTitle: "月100枚の請求書",
        invoicesSubtitle: "無料プランの5枚と比較 - 20倍の容量",
        promptsTitle: "月100回のAIプロンプト",
        promptsSubtitle: "無料プランの10回と比較 - 完全自動化",
        earlyAccessTitle: "早期アクセス",
        earlyAccessSubtitle: "誰よりも先に新機能を"
      },
      button: {
        subscribe: "🚀 Proにアップグレード - $19.99/月",
        manageSubscription: "サブスクリプション管理",
        signInToSubscribe: "ログインして登録"
      },
      securityText: "✅ いつでもキャンセル可能 • 💳 Stripeによる安全な支払い",
      toggleDetails: {
        show: "すべてのメリットを見る",
        hide: "詳細を隠す"
      },
      extendedStorage: {
        title: "拡張ストレージ",
        description: "2年間のストレージ",
        subtitle: "無料プランの30日と比較"
      },
      premiumFeatures: {
        title: "プレミアム機能",
        emailSend: {
          title: "メール送信",
          subtitle: "請求書を直接共有"
        },
        prioritySupport: {
          title: "優先サポート",
          subtitle: "24時間以内の回答を保証"
        }
      },
      comingSoon: {
        title: "近日公開",
        qrTemplates: {
          title: "QRテンプレート",
          subtitle: "自動QRコード"
        },
        stripePayment: {
          title: "Stripe支払いボタン",
          subtitle: "統合された請求"
        }
      },
      betaAccess: {
        title: "早期アクセスベータ",
        api: {
          title: "MCP API",
          subtitle: "高度な自動化"
        },
        betaTesting: {
          title: "ベータテスト",
          subtitle: "機能を最初に"
        },
        exclusiveTemplates: {
          title: "限定テンプレート",
          subtitle: "ユニークなデザイン"
        }
      }
    }
  },
  fr: {
    title: "Plan d'Abonnement",
    back: "Retour",
    popularBadge: "Plan le Plus Populaire",
    activeBadge: "Actif",
    plan: {
      title: "Invoice Generator Pro",
      subtitle: "Plan complet pour professionnels et petites entreprises",
      price: "$19.99",
      period: "/mois",
      mainFeatures: {
        invoicesTitle: "100 factures par mois",
        invoicesSubtitle: "vs 5 dans le plan gratuit - 20x plus de capacité",
        promptsTitle: "100 prompts IA par mois",
        promptsSubtitle: "vs 10 dans le plan gratuit - Automatisation totale",
        earlyAccessTitle: "Accès Anticipé",
        earlyAccessSubtitle: "Nouvelles fonctionnalités en premier"
      },
      button: {
        subscribe: "🚀 Passer à Pro - $19.99/mois",
        manageSubscription: "Gérer l'Abonnement",
        signInToSubscribe: "Se Connecter pour S'abonner"
      },
      securityText: "✅ Annulez quand vous voulez • 💳 Paiement sécurisé avec Stripe",
      toggleDetails: {
        show: "Voir tous les avantages",
        hide: "Masquer les détails"
      },
      extendedStorage: {
        title: "Stockage Étendu",
        description: "Stockage 2 ans",
        subtitle: "vs 30 jours dans le plan gratuit"
      },
      premiumFeatures: {
        title: "Fonctionnalités Premium",
        emailSend: {
          title: "Envoi par email",
          subtitle: "Partagez les factures directement"
        },
        prioritySupport: {
          title: "Support prioritaire",
          subtitle: "Réponse en 24h garantie"
        }
      },
      comingSoon: {
        title: "Bientôt Disponible",
        qrTemplates: {
          title: "Modèles avec QR",
          subtitle: "Codes QR automatiques"
        },
        stripePayment: {
          title: "Bouton de paiement Stripe",
          subtitle: "Collections intégrées"
        }
      },
      betaAccess: {
        title: "Accès Bêta Anticipé",
        api: {
          title: "API MCP",
          subtitle: "Automatisation avancée"
        },
        betaTesting: {
          title: "Tests bêta",
          subtitle: "Fonctionnalités en premier"
        },
        exclusiveTemplates: {
          title: "Modèles exclusifs",
          subtitle: "Designs uniques"
        }
      }
    }
  },
  de: {
    title: "Abonnement-Plan",
    back: "Zurück",
    popularBadge: "Beliebtester Plan",
    activeBadge: "Aktiv",
    plan: {
      title: "Invoice Generator Pro",
      subtitle: "Kompletter Plan für Profis und kleine Unternehmen",
      price: "$19.99",
      period: "/Monat",
      mainFeatures: {
        invoicesTitle: "100 Rechnungen pro Monat",
        invoicesSubtitle: "vs 5 im kostenlosen Plan - 20x mehr Kapazität",
        promptsTitle: "100 KI-Prompts pro Monat",
        promptsSubtitle: "vs 10 im kostenlosen Plan - Vollautomatisierung",
        earlyAccessTitle: "Früher Zugang",
        earlyAccessSubtitle: "Neue Funktionen vor allen anderen"
      },
      button: {
        subscribe: "🚀 Auf Pro upgraden - $19.99/Monat",
        manageSubscription: "Abonnement Verwalten",
        signInToSubscribe: "Anmelden zum Abonnieren"
      },
      securityText: "✅ Jederzeit kündbar • 💳 Sichere Zahlung mit Stripe",
      toggleDetails: {
        show: "Alle Vorteile ansehen",
        hide: "Details ausblenden"
      },
      extendedStorage: {
        title: "Erweiterte Speicherung",
        description: "2-Jahres-Speicherung",
        subtitle: "vs 30 Tage im kostenlosen Plan"
      },
      premiumFeatures: {
        title: "Premium-Funktionen",
        emailSend: {
          title: "E-Mail-Versand",
          subtitle: "Rechnungen direkt teilen"
        },
        prioritySupport: {
          title: "Prioritätssupport",
          subtitle: "24h Antwort garantiert"
        }
      },
      comingSoon: {
        title: "Demnächst Verfügbar",
        qrTemplates: {
          title: "QR-Vorlagen",
          subtitle: "Automatische QR-Codes"
        },
        stripePayment: {
          title: "Stripe-Zahlungsbutton",
          subtitle: "Integrierte Zahlungen"
        }
      },
      betaAccess: {
        title: "Früher Beta-Zugang",
        api: {
          title: "MCP API",
          subtitle: "Erweiterte Automatisierung"
        },
        betaTesting: {
          title: "Beta-Tests",
          subtitle: "Funktionen zuerst"
        },
        exclusiveTemplates: {
          title: "Exklusive Vorlagen",
          subtitle: "Einzigartige Designs"
        }
      }
    }
  }
};

// Evento personalizado para comunicación entre componentes
export const LANGUAGE_CHANGE_EVENT = 'languageChange';

export const dispatchLanguageChange = (language: Language): void => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGE_EVENT, { detail: language }));
};

// Función helper para obtener traducciones
export const getNavTranslation = (language: Language) => {
  return navTranslations[language] || navTranslations.en;
};

export const getHeroTranslation = (language: Language) => {
  return heroTranslations[language] || heroTranslations.en;
};

export const getPublicInvoiceTranslation = (language: Language) => {
  return publicInvoiceTranslations[language] || publicInvoiceTranslations.en;
};

// **NUEVA FUNCIÓN HELPER PARA PROMPT USAGE**
export const getPromptUsageTranslation = (language: Language) => {
  return promptUsageTranslations[language] || promptUsageTranslations.en;
};

// Función helper para obtener traducciones de pricing
export const getPricingTranslation = (language: Language) => {
  return pricingTranslations[language] || pricingTranslations.en;
};

export const invoiceGeneratorTranslations: Record<Language, {
  // Títulos principales
  mainTitle: string;
  loading: string;
  
  // Sección de IA
  aiSection: {
    title: string;
    placeholder: string;
    generating: string;
    generate: string;
    errorPrefix: string;
  };
  
  // Vista previa
  preview: {
    show: string;
    hide: string;
    title: string;
  };
  
  // Información de factura
  invoiceInfo: {
    title: string;
    number: string;
    date: string;
    dueDate: string;
  };
  
  // Información de empresa
  company: {
    title: string;
    name: string;
    email: string;
    phone: string;
    taxId: string;
    address: string;
  };
  
  // Información de cliente
  client: {
    title: string;
    name: string;
    email: string;
    phone: string;
    address: string;
  };

  // Moneda
  currency: {
    title: string;
    selector: string;
    current: string;
    change: string;
    updateError: string;
    updateSuccess: string;
  };
  
  // Items de factura
  items: {
    title: string;
    add: string;
    clear: string;
    description: string;
    quantity: string;
    price: string;
    total: string;
    taxRate: string;
    defaultDescription: string;
  };
  
  // Notas
  notes: {
    title: string;
    placeholder: string;
    previewTitle: string;
  };
  
  // Acciones
  actions: {
    downloadPdf: string;
    newInvoice: string;
    pdfComingSoon: string;
  };
  
  // Mensajes de error y API
  api: {
    networkError: string;
    serverError: string;
    unknownError: string;
    simulatingResponse: string;
    generatingError: string;
  };
  
  // Datos de ejemplo para simulación
  simulation: {
    clientName: string;
    clientEmail: string;
    serviceDescription: string;
    invoiceNotes: string;
  };

  // Gestión de facturas guardadas
  savedInvoices: {
    title: string;
    editing: string;
    save: string;
    update: string;
    saving: string;
    updating: string;
    cancel: string;
    view: string;
    hide: string;
    load: string;
    edit: string;
    duplicate: string;
    delete: string;
    confirmDelete: string;
    confirmDuplicate: string;
    cancelAndNew: string;
    limitReached: string;
    limitMessage: string;
    subscribeMessage: string;
    noInvoices: string;
    loadingInvoices: string;
    publicLink: string;
    generateLink: string;
    copyLink: string;
    removeLink: string;
    confirmRemoveLink: string;
    openLink: string;
  };

  // Validación
  validation: {
    invoiceNumberRequired: string;
    clientNameRequired: string;
    itemDescriptionRequired: string;
  };

  invoicesCount: string;
  editingStatus: string;
  activeStatus: string;
  public: string;
  updated: string;
  confirmDeleteInvoice: string;
  confirmDuplicateInvoice: string;
  confirmRemovePublicLink: string;
  generatingPdf: string;
  invoicesLimit: string;
  subscriptionLimit: string;
  subscriptionMessage: string;
  freeLimit: string;
  validationErrors: string;
  noInvoicesMessage: string;
  loadingInvoicesMessage: string;
  showDetails: string;
  hideDetails: string;
  manageInvoices: string;
  invoicesList: string;
  createdAt: string;
  publicLinkUrl: string;
  tooltips: {
    load: string;
    edit: string;
    duplicate: string;
    delete: string;
    generatePublicLink: string;
    copyPublicLink: string;
    openPublicLink: string;
    removePublicLink: string;
  };

}> = {
  en: {
    mainTitle: "Rapid Invoice",
    loading: "Loading...",
    
    aiSection: {
      title: "Generate Invoice with AI",
      placeholder: "Describe your invoice details (e.g., Invoice for John Doe for web design services, 3 hours at $50/hour)",
      generating: "Generating...",
      generate: "Generate",
      errorPrefix: "Error: "
    },
    
    preview: {
      show: "Show Preview",
      hide: "Hide Preview",
      title: "Preview"
    },
    
    invoiceInfo: {
      title: "Invoice Information",
      number: "Invoice Number",
      date: "Date",
      dueDate: "Due Date"
    },
    
    company: {
      title: "Your Company",
      name: "Company name",
      email: "email@company.com",
      phone: "Phone",
      taxId: "Tax ID",
      address: "Complete address"
    },
    
    client: {
      title: "Client",
      name: "Client name",
      email: "email@client.com",
      phone: "Phone",
      address: "Client address"
    },

    currency: {
      title: "Currency",
      selector: "Select Currency",
      current: "Current Currency",
      change: "Change Currency",
      updateError: "Error updating currency",
      updateSuccess: "Currency updated successfully"
    },
    
    items: {
      title: "Services/Products",
      add: "Add",
      clear: "Clear",
      description: "Service/product description",
      quantity: "Qty.",
      price: "Price",
      total: "Total",
      taxRate: "VAT (%)",
      defaultDescription: "Product/Service"
    },
    
    notes: {
      title: "Additional Notes",
      placeholder: "Payment terms, additional information, etc.",
      previewTitle: "Notes:"
    },
    
    actions: {
      downloadPdf: "Download Invoice PDF",
      newInvoice: "New Invoice",
      pdfComingSoon: "PDF export function - Coming soon"
    },
    
    api: {
      networkError: "Network error",
      serverError: "Server error",
      unknownError: "Unknown error",
      simulatingResponse: "Simulating API response for prompt:",
      generatingError: "Error generating invoice with AI:"
    },
    
    simulation: {
      clientName: "Example Client",
      clientEmail: "client@example.com",
      serviceDescription: "Consulting service",
      invoiceNotes: "Invoice generated with AI"
    },

    savedInvoices: {
      title: "Saved Invoices",
      editing: "Editing",
      save: "Save Invoice",
      update: "Update Invoice",
      saving: "Saving...",
      updating: "Updating...",
      cancel: "Cancel Edit",
      view: "View",
      hide: "Hide",
      load: "Load invoice to view",
      edit: "Edit invoice",
      duplicate: "Duplicate invoice",
      delete: "Delete invoice",
      confirmDelete: "Are you sure you want to delete invoice",
      confirmDuplicate: "Duplicate invoice",
      cancelAndNew: "Cancel and New Invoice",
      limitReached: "Limit reached",
      limitMessage: "You have reached the limit of",
      subscribeMessage: "Subscribe to get up to 100 monthly invoices.",
      noInvoices: "You have no saved invoices",
      loadingInvoices: "Loading invoices...",
      publicLink: "Public",
      generateLink: "Generate public link",
      copyLink: "Copy public link",
      removeLink: "Remove public link",
      confirmRemoveLink: "Remove public link from invoice",
      openLink: "Open public link"
    },

    validation: {
      invoiceNumberRequired: "Invoice number is required",
      clientNameRequired: "Client name is required",
      itemDescriptionRequired: "All items must have description"
    },
    invoicesCount: "invoices",
    editingStatus: "Editing",
    activeStatus: "Active", 
    public: "Public",
    updated: "Updated:",
    
    confirmDeleteInvoice: "Are you sure you want to delete invoice",
    confirmDuplicateInvoice: "Duplicate invoice",
    confirmRemovePublicLink: "Remove public link from invoice",
    
    generatingPdf: "Generating PDF...",
    
    invoicesLimit: "invoices",
    subscriptionLimit: "You have reached the limit of",
    subscriptionMessage: "Subscribe to get up to 100 monthly invoices.",
    freeLimit: "Delete some or edit an existing one.",
    
    validationErrors: "Validation errors:",
    
    noInvoicesMessage: "You have no saved invoices",
    loadingInvoicesMessage: "Loading invoices...",
    
    showDetails: "See all benefits", 
    hideDetails: "Hide details",
    manageInvoices: "Saved Invoices Management",
    invoicesList: "Saved Invoices List",
    
    createdAt: "Created:",
    publicLinkUrl: "🔗",
    
    tooltips: {
      load: "Load invoice to view",
      edit: "Edit invoice",
      duplicate: "Duplicate invoice", 
      delete: "Delete invoice",
      generatePublicLink: "Generate public link",
      copyPublicLink: "Copy public link",
      openPublicLink: "Open public link",
      removePublicLink: "Remove public link"
    }
  },
  es: {
    mainTitle: "Generador de Facturas",
    loading: "Cargando...",
    
    aiSection: {
      title: "Generar Factura con IA",
      placeholder: "Describe los detalles de tu factura (ej: Factura para Juan Pérez por servicios de diseño web, 3 horas a 50€/hora)",
      generating: "Generando...",
      generate: "Generar",
      errorPrefix: "Error: "
    },
    
    preview: {
      show: "Mostrar Vista Previa",
      hide: "Ocultar Vista Previa",
      title: "Vista Previa"
    },
    
    invoiceInfo: {
      title: "Información de la Factura",
      number: "Número de Factura",
      date: "Fecha",
      dueDate: "Fecha de Vencimiento"
    },
    
    company: {
      title: "Tu Empresa",
      name: "Nombre de la empresa",
      email: "email@empresa.com",
      phone: "Teléfono",
      taxId: "NIF/CIF",
      address: "Dirección completa"
    },
    
    client: {
      title: "Cliente",
      name: "Nombre del cliente",
      email: "email@cliente.com",
      phone: "Teléfono",
      address: "Dirección del cliente"
    },

    currency: {
      title: "Moneda",
      selector: "Seleccionar Moneda",
      current: "Moneda Actual",
      change: "Cambiar Moneda",
      updateError: "Error al actualizar la moneda",
      updateSuccess: "Moneda actualizada correctamente"
    },
    
    items: {
      title: "Servicios/Productos",
      add: "Añadir",
      clear: "Limpiar",
      description: "Descripción del servicio/producto",
      quantity: "Cant.",
      price: "Precio",
      total: "Total",
      taxRate: "IVA (%)",
      defaultDescription: "Producto/Servicio"
    },
    
    notes: {
      title: "Notas Adicionales",
      placeholder: "Términos de pago, información adicional, etc.",
      previewTitle: "Notas:"
    },
    
    actions: {
      downloadPdf: "Descargar Factura PDF",
      newInvoice: "Nueva Factura",
      pdfComingSoon: "Función de exportación a PDF - Próximamente disponible"
    },
    
    api: {
      networkError: "Error de conexión",
      serverError: "Error del servidor",
      unknownError: "Error desconocido",
      simulatingResponse: "Simulando respuesta de API para prompt:",
      generatingError: "Error generating invoice with AI:"
    },
    
    simulation: {
      clientName: "Cliente Ejemplo",
      clientEmail: "cliente@ejemplo.com",
      serviceDescription: "Servicio de consultoría",
      invoiceNotes: "Factura generada con IA"
    },

    savedInvoices: {
      title: "Facturas Guardadas",
      editing: "Editando",
      save: "Guardar Factura",
      update: "Actualizar Factura",
      saving: "Guardando...",
      updating: "Actualizando...",
      cancel: "Cancelar Edición",
      view: "Ver",
      hide: "Ocultar",
      load: "Cargar factura para ver",
      edit: "Editar factura",
      duplicate: "Duplicar factura",
      delete: "Eliminar factura",
      confirmDelete: "¿Estás seguro de que quieres eliminar la factura",
      confirmDuplicate: "¿Duplicar la factura",
      cancelAndNew: "Cancelar y Nueva Factura",
      limitReached: "Límite alcanzado",
      limitMessage: "Has alcanzado el límite de",
      subscribeMessage: "Suscríbete para obtener hasta 100 facturas mensuales.",
      noInvoices: "No tienes facturas guardadas",
      loadingInvoices: "Cargando facturas...",
      publicLink: "Público",
      generateLink: "Generar enlace público",
      copyLink: "Copiar enlace público",
      removeLink: "Eliminar enlace público",
      confirmRemoveLink: "¿Eliminar el enlace público de la factura",
      openLink: "Abrir enlace público"
    },

    validation: {
      invoiceNumberRequired: "Número de factura es requerido",
      clientNameRequired: "Nombre del cliente es requerido",
      itemDescriptionRequired: "Todos los items deben tener descripción"
    },

    invoicesCount: "facturas",
    editingStatus: "Editando",
    activeStatus: "Activo",
    public: "Público",
    updated: "Actualizada:",
    
    // Mensajes de confirmación
    confirmDeleteInvoice: "¿Estás seguro de que quieres eliminar la factura",
    confirmDuplicateInvoice: "¿Duplicar la factura",
    confirmRemovePublicLink: "¿Eliminar el enlace público de la factura",
    
    // Estados de carga
    generatingPdf: "Generando PDF...",
    
    // Límites y suscripciones
    invoicesLimit: "facturas",
    subscriptionLimit: "Has alcanzado el límite de",
    subscriptionMessage: "Suscríbete para obtener hasta 100 facturas mensuales.",
    freeLimit: "Elimina alguna o edita una existente.",
    
    // Errores de validación
    validationErrors: "Errores de validación:",
    
    // Estados de las facturas guardadas
    noInvoicesMessage: "No tienes facturas guardadas",
    loadingInvoicesMessage: "Cargando facturas...",
    
    // Botones y acciones
    showDetails: "Ver todos los beneficios",
    hideDetails: "Ocultar detalles",
    manageInvoices: "Gestión de Facturas Guardadas",
    invoicesList: "Lista de Facturas Guardadas",
    
    // Fechas
    createdAt: "Creada:",
    
    // Enlaces públicos
    publicLinkUrl: "🔗",
    
    // Tooltips
    tooltips: {
      load: "Cargar factura para ver",
      edit: "Editar factura", 
      duplicate: "Duplicar factura",
      delete: "Eliminar factura",
      generatePublicLink: "Generar enlace público",
      copyPublicLink: "Copiar enlace público",
      openPublicLink: "Abrir enlace público",
      removePublicLink: "Eliminar enlace público"
    }
  },
  pt: {
    mainTitle: "Gerador de Faturas",
    loading: "Carregando...",

    aiSection: {
      title: "Gerar Fatura com IA",
      placeholder: "Descreva os detalhes da sua fatura (ex: Fatura para João Silva por serviços de design web, 3 horas a 50€/hora)",
      generating: "Gerando...",
      generate: "Gerar",
      errorPrefix: "Erro: "
    },

    preview: {
      show: "Mostrar Pré-visualização",
      hide: "Ocultar Pré-visualização",
      title: "Pré-visualização"
    },

    invoiceInfo: {
      title: "Informações da Fatura",
      number: "Número da Fatura",
      date: "Data",
      dueDate: "Data de Vencimento"
    },

    company: {
      title: "Sua Empresa",
      name: "Nome da empresa",
      email: "email@empresa.com",
      phone: "Telefone",
      taxId: "NIF",
      address: "Endereço completo"
    },

    client: {
      title: "Cliente",
      name: "Nome do cliente",
      email: "email@cliente.com",
      phone: "Telefone",
      address: "Endereço do cliente"
    },

    currency: {
      title: "Moeda",
      selector: "Selecionar Moeda",
      current: "Moeda Atual",
      change: "Alterar Moeda",
      updateError: "Erro ao atualizar a moeda",
      updateSuccess: "Moeda atualizada com sucesso"
    },

    items: {
      title: "Serviços/Produtos",
      add: "Adicionar",
      clear: "Limpar",
      description: "Descrição do serviço/produto",
      quantity: "Qtd.",
      price: "Preço",
      total: "Total",
      taxRate: "IVA (%)",
      defaultDescription: "Produto/Serviço"
    },

    notes: {
      title: "Notas Adicionais",
      placeholder: "Condições de pagamento, informações adicionais, etc.",
      previewTitle: "Notas:"
    },

    actions: {
      downloadPdf: "Baixar Fatura PDF",
      newInvoice: "Nova Fatura",
      pdfComingSoon: "Função de exportação PDF - Em breve"
    },

    api: {
      networkError: "Erro de rede",
      serverError: "Erro do servidor",
      unknownError: "Erro desconhecido",
      simulatingResponse: "Simulando resposta da API para prompt:",
      generatingError: "Erro ao gerar fatura com IA:"
    },

    simulation: {
      clientName: "Cliente Exemplo",
      clientEmail: "cliente@exemplo.com",
      serviceDescription: "Serviço de consultoria",
      invoiceNotes: "Fatura gerada com IA"
    },

    savedInvoices: {
      title: "Faturas Salvas",
      editing: "Editando",
      save: "Salvar Fatura",
      update: "Atualizar Fatura",
      saving: "Salvando...",
      updating: "Atualizando...",
      cancel: "Cancelar Edição",
      view: "Ver",
      hide: "Ocultar",
      load: "Carregar fatura para ver",
      edit: "Editar fatura",
      duplicate: "Duplicar fatura",
      delete: "Excluir fatura",
      confirmDelete: "Tem certeza que deseja excluir a fatura",
      confirmDuplicate: "Duplicar fatura",
      cancelAndNew: "Cancelar e Nova Fatura",
      limitReached: "Limite atingido",
      limitMessage: "Você atingiu o limite de",
      subscribeMessage: "Assine para gerar até 100 faturas mensais.",
      noInvoices: "Você não tem faturas salvas",
      loadingInvoices: "Carregando faturas...",
      publicLink: "Público",
      generateLink: "Gerar link público",
      copyLink: "Copiar link público",
      removeLink: "Remover link público",
      confirmRemoveLink: "Remover link público da fatura",
      openLink: "Abrir link público"
    },

    validation: {
      invoiceNumberRequired: "Número da fatura é obrigatório",
      clientNameRequired: "Nome do cliente é obrigatório",
      itemDescriptionRequired: "Todos os itens devem ter descrição"
    },
    invoicesCount: "faturas",
    editingStatus: "Editando",
    activeStatus: "Ativo",
    public: "Público",
    updated: "Atualizada:",
    confirmDeleteInvoice: "Tem certeza que deseja excluir a fatura",
    confirmDuplicateInvoice: "Duplicar fatura",
    confirmRemovePublicLink: "Remover link público da fatura",
    generatingPdf: "Gerando PDF...",
    invoicesLimit: "faturas",
    subscriptionLimit: "Você atingiu o limite de",
    subscriptionMessage: "Assine para gerar até 100 faturas mensais.",
    freeLimit: "Exclua algumas ou edite uma existente.",
    validationErrors: "Erros de validação:",
    noInvoicesMessage: "Você não tem faturas salvas",
    loadingInvoicesMessage: "Carregando faturas...",
    showDetails: "Ver todos os benefícios",
    hideDetails: "Ocultar detalhes",
    manageInvoices: "Gestão de Faturas Salvas",
    invoicesList: "Lista de Faturas Salvas",
    createdAt: "Criada:",
    publicLinkUrl: "🔗",

    tooltips: {
      load: "Carregar fatura para ver",
      edit: "Editar fatura",
      duplicate: "Duplicar fatura",
      delete: "Excluir fatura",
      generatePublicLink: "Gerar link público",
      copyPublicLink: "Copiar link público",
      openPublicLink: "Abrir link público",
      removePublicLink: "Remover link público"
    }
  },
  ja: {
    mainTitle: "請求書ジェネレーター",
    loading: "読み込み中...",

    aiSection: {
      title: "AIで請求書を作成",
      placeholder: "請求書の詳細を入力してください（例: 山田太郎へのWebデザインサービスの請求書、3時間、1時間あたり¥5000）",
      generating: "生成中...",
      generate: "生成",
      errorPrefix: "エラー: "
    },

    preview: {
      show: "プレビューを表示",
      hide: "プレビューを非表示",
      title: "プレビュー"
    },

    invoiceInfo: {
      title: "請求書情報",
      number: "請求書番号",
      date: "日付",
      dueDate: "支払期限"
    },

    company: {
      title: "あなたの会社",
      name: "会社名",
      email: "email@company.com",
      phone: "電話番号",
      taxId: "法人番号",
      address: "住所"
    },

    client: {
      title: "顧客",
      name: "顧客名",
      email: "email@client.com",
      phone: "電話番号",
      address: "顧客の住所"
    },

    currency: {
      title: "通貨",
      selector: "通貨を選択",
      current: "現在の通貨",
      change: "通貨を変更",
      updateError: "通貨の更新に失敗しました",
      updateSuccess: "通貨が正常に更新されました"
    },

    items: {
      title: "サービス/商品",
      add: "追加",
      clear: "クリア",
      description: "サービス/商品の説明",
      quantity: "数量",
      price: "価格",
      total: "合計",
      taxRate: "消費税 (%)",
      defaultDescription: "商品/サービス"
    },

    notes: {
      title: "追加のメモ",
      placeholder: "支払条件、追加情報など",
      previewTitle: "メモ:"
    },

    actions: {
      downloadPdf: "請求書PDFをダウンロード",
      newInvoice: "新しい請求書",
      pdfComingSoon: "PDFエクスポート機能 - 近日公開"
    },

    api: {
      networkError: "ネットワークエラー",
      serverError: "サーバーエラー",
      unknownError: "不明なエラー",
      simulatingResponse: "APIレスポンスをシミュレーション中:",
      generatingError: "AIによる請求書生成エラー:"
    },

    simulation: {
      clientName: "サンプル顧客",
      clientEmail: "client@example.com",
      serviceDescription: "コンサルティングサービス",
      invoiceNotes: "AIで生成された請求書"
    },

    savedInvoices: {
      title: "保存された請求書",
      editing: "編集中",
      save: "請求書を保存",
      update: "請求書を更新",
      saving: "保存中...",
      updating: "更新中...",
      cancel: "編集をキャンセル",
      view: "表示",
      hide: "非表示",
      load: "請求書を読み込む",
      edit: "請求書を編集",
      duplicate: "請求書を複製",
      delete: "請求書を削除",
      confirmDelete: "請求書を削除してもよろしいですか",
      confirmDuplicate: "請求書を複製しますか",
      cancelAndNew: "キャンセルして新しい請求書",
      limitReached: "上限に達しました",
      limitMessage: "上限に達しました:",
      subscribeMessage: "月100件まで請求書を作成するには購読してください。",
      noInvoices: "保存された請求書はありません",
      loadingInvoices: "請求書を読み込み中...",
      publicLink: "公開リンク",
      generateLink: "公開リンクを生成",
      copyLink: "公開リンクをコピー",
      removeLink: "公開リンクを削除",
      confirmRemoveLink: "請求書から公開リンクを削除しますか",
      openLink: "公開リンクを開く"
    },

    validation: {
      invoiceNumberRequired: "請求書番号は必須です",
      clientNameRequired: "顧客名は必須です",
      itemDescriptionRequired: "すべての項目に説明が必要です"
    },
    invoicesCount: "件の請求書",
    editingStatus: "編集中",
    activeStatus: "アクティブ",
    public: "公開",
    updated: "更新日:",
    confirmDeleteInvoice: "請求書を削除してもよろしいですか",
    confirmDuplicateInvoice: "請求書を複製しますか",
    confirmRemovePublicLink: "請求書から公開リンクを削除しますか",
    generatingPdf: "PDFを生成中...",
    invoicesLimit: "件の請求書",
    subscriptionLimit: "上限に達しました:",
    subscriptionMessage: "月100件まで請求書を作成するには購読してください。",
    freeLimit: "一部を削除するか、既存のものを編集してください。",
    validationErrors: "検証エラー:",
    noInvoicesMessage: "保存された請求書はありません",
    loadingInvoicesMessage: "請求書を読み込み中...",
    showDetails: "すべての利点を表示",
    hideDetails: "詳細を非表示",
    manageInvoices: "保存された請求書の管理",
    invoicesList: "保存された請求書リスト",
    createdAt: "作成日:",
    publicLinkUrl: "🔗",

    tooltips: {
      load: "請求書を読み込む",
      edit: "請求書を編集",
      duplicate: "請求書を複製",
      delete: "請求書を削除",
      generatePublicLink: "公開リンクを生成",
      copyPublicLink: "公開リンクをコピー",
      openPublicLink: "公開リンクを開く",
      removePublicLink: "公開リンクを削除"
    }
  },
  fr: {
    mainTitle: "Générateur de Factures",
    loading: "Chargement...",

    aiSection: {
      title: "Générer une facture avec l'IA",
      placeholder: "Décrivez les détails de votre facture (ex: Facture pour Jean Dupont pour des services de conception web, 3 heures à 50€/heure)",
      generating: "Génération...",
      generate: "Générer",
      errorPrefix: "Erreur: "
    },

    preview: {
      show: "Afficher l’Aperçu",
      hide: "Masquer l’Aperçu",
      title: "Aperçu"
    },

    invoiceInfo: {
      title: "Informations de la Facture",
      number: "Numéro de Facture",
      date: "Date",
      dueDate: "Date d’Échéance"
    },

    company: {
      title: "Votre Entreprise",
      name: "Nom de l’entreprise",
      email: "email@entreprise.com",
      phone: "Téléphone",
      taxId: "Numéro TVA",
      address: "Adresse complète"
    },

    client: {
      title: "Client",
      name: "Nom du client",
      email: "email@client.com",
      phone: "Téléphone",
      address: "Adresse du client"
    },

    currency: {
      title: "Devise",
      selector: "Sélectionner la Devise",
      current: "Devise Actuelle",
      change: "Changer de Devise",
      updateError: "Erreur lors de la mise à jour de la devise",
      updateSuccess: "Devise mise à jour avec succès"
    },

    items: {
      title: "Services/Produits",
      add: "Ajouter",
      clear: "Effacer",
      description: "Description du service/produit",
      quantity: "Qté.",
      price: "Prix",
      total: "Total",
      taxRate: "TVA (%)",
      defaultDescription: "Produit/Service"
    },

    notes: {
      title: "Notes Supplémentaires",
      placeholder: "Conditions de paiement, informations supplémentaires, etc.",
      previewTitle: "Notes:"
    },

    actions: {
      downloadPdf: "Télécharger la Facture PDF",
      newInvoice: "Nouvelle Facture",
      pdfComingSoon: "Fonction d’export PDF - Bientôt disponible"
    },

    api: {
      networkError: "Erreur réseau",
      serverError: "Erreur serveur",
      unknownError: "Erreur inconnue",
      simulatingResponse: "Simulation de la réponse API pour prompt:",
      generatingError: "Erreur lors de la génération de la facture avec l’IA:"
    },

    simulation: {
      clientName: "Client Exemple",
      clientEmail: "client@exemple.com",
      serviceDescription: "Service de conseil",
      invoiceNotes: "Facture générée avec IA"
    },

    savedInvoices: {
      title: "Factures Enregistrées",
      editing: "En cours d’édition",
      save: "Enregistrer la Facture",
      update: "Mettre à jour la Facture",
      saving: "Enregistrement...",
      updating: "Mise à jour...",
      cancel: "Annuler l’édition",
      view: "Voir",
      hide: "Masquer",
      load: "Charger la facture pour voir",
      edit: "Modifier la facture",
      duplicate: "Dupliquer la facture",
      delete: "Supprimer la facture",
      confirmDelete: "Êtes-vous sûr de vouloir supprimer la facture",
      confirmDuplicate: "Dupliquer la facture",
      cancelAndNew: "Annuler et Nouvelle Facture",
      limitReached: "Limite atteinte",
      limitMessage: "Vous avez atteint la limite de",
      subscribeMessage: "Abonnez-vous pour générer jusqu’à 100 factures mensuelles.",
      noInvoices: "Vous n’avez aucune facture enregistrée",
      loadingInvoices: "Chargement des factures...",
      publicLink: "Lien public",
      generateLink: "Générer un lien public",
      copyLink: "Copier le lien public",
      removeLink: "Supprimer le lien public",
      confirmRemoveLink: "Supprimer le lien public de la facture",
      openLink: "Ouvrir le lien public"
    },

    validation: {
      invoiceNumberRequired: "Le numéro de facture est requis",
      clientNameRequired: "Le nom du client est requis",
      itemDescriptionRequired: "Tous les articles doivent avoir une description"
    },
    invoicesCount: "factures",
    editingStatus: "En cours d'édition",
    activeStatus: "Actif",
    public: "Public",
    updated: "Mise à jour:",
    confirmDeleteInvoice: "Êtes-vous sûr de vouloir supprimer la facture",
    confirmDuplicateInvoice: "Dupliquer la facture",
    confirmRemovePublicLink: "Supprimer le lien public de la facture",
    generatingPdf: "Génération du PDF...",
    invoicesLimit: "factures",
    subscriptionLimit: "Vous avez atteint la limite de",
    subscriptionMessage: "Abonnez-vous pour générer jusqu'à 100 factures mensuelles.",
    freeLimit: "Supprimez-en quelques-unes ou modifiez une existante.",
    validationErrors: "Erreurs de validation:",
    noInvoicesMessage: "Vous n'avez aucune facture enregistrée",
    loadingInvoicesMessage: "Chargement des factures...",
    showDetails: "Voir tous les avantages",
    hideDetails: "Masquer les détails",
    manageInvoices: "Gestion des Factures Enregistrées",
    invoicesList: "Liste des Factures Enregistrées",
    createdAt: "Créée:",
    publicLinkUrl: "🔗",

    tooltips: {
      load: "Charger la facture pour voir",
      edit: "Modifier la facture",
      duplicate: "Dupliquer la facture",
      delete: "Supprimer la facture",
      generatePublicLink: "Générer un lien public",
      copyPublicLink: "Copier le lien public",
      openPublicLink: "Ouvrir le lien public",
      removePublicLink: "Supprimer le lien public"
    }
  },
  de: {
    mainTitle: "Rechnungsgenerator",
    loading: "Wird geladen...",

    aiSection: {
      title: "Rechnung mit KI erstellen",
      placeholder: "Beschreiben Sie die Details Ihrer Rechnung (z. B. Rechnung für Max Mustermann für Webdesign-Dienstleistungen, 3 Stunden à 50€/Stunde)",
      generating: "Wird generiert...",
      generate: "Generieren",
      errorPrefix: "Fehler: "
    },

    preview: {
      show: "Vorschau anzeigen",
      hide: "Vorschau ausblenden",
      title: "Vorschau"
    },

    invoiceInfo: {
      title: "Rechnungsinformationen",
      number: "Rechnungsnummer",
      date: "Datum",
      dueDate: "Fälligkeitsdatum"
    },

    company: {
      title: "Ihr Unternehmen",
      name: "Firmenname",
      email: "email@unternehmen.com",
      phone: "Telefon",
      taxId: "Steuernummer",
      address: "Vollständige Adresse"
    },

    client: {
      title: "Kunde",
      name: "Kundenname",
      email: "email@kunde.com",
      phone: "Telefon",
      address: "Kundenadresse"
    },

    currency: {
      title: "Währung",
      selector: "Währung auswählen",
      current: "Aktuelle Währung",
      change: "Währung ändern",
      updateError: "Fehler beim Aktualisieren der Währung",
      updateSuccess: "Währung erfolgreich aktualisiert"
    },

    items: {
      title: "Dienstleistungen/Produkte",
      add: "Hinzufügen",
      clear: "Löschen",
      description: "Beschreibung der Dienstleistung/des Produkts",
      quantity: "Menge",
      price: "Preis",
      total: "Gesamt",
      taxRate: "MwSt (%)",
      defaultDescription: "Produkt/Dienstleistung"
    },

    notes: {
      title: "Zusätzliche Notizen",
      placeholder: "Zahlungsbedingungen, zusätzliche Informationen usw.",
      previewTitle: "Notizen:"
    },

    actions: {
      downloadPdf: "Rechnung als PDF herunterladen",
      newInvoice: "Neue Rechnung",
      pdfComingSoon: "PDF-Exportfunktion - Demnächst verfügbar"
    },

    api: {
      networkError: "Netzwerkfehler",
      serverError: "Serverfehler",
      unknownError: "Unbekannter Fehler",
      simulatingResponse: "Simulation der API-Antwort für Eingabe:",
      generatingError: "Fehler beim Generieren der Rechnung mit KI:"
    },

    simulation: {
      clientName: "Beispielkunde",
      clientEmail: "kunde@beispiel.com",
      serviceDescription: "Beratungsdienstleistung",
      invoiceNotes: "Mit KI generierte Rechnung"
    },

    savedInvoices: {
      title: "Gespeicherte Rechnungen",
      editing: "Bearbeitung",
      save: "Rechnung speichern",
      update: "Rechnung aktualisieren",
      saving: "Wird gespeichert...",
      updating: "Wird aktualisiert...",
      cancel: "Bearbeitung abbrechen",
      view: "Ansehen",
      hide: "Ausblenden",
      load: "Rechnung laden",
      edit: "Rechnung bearbeiten",
      duplicate: "Rechnung duplizieren",
      delete: "Rechnung löschen",
      confirmDelete: "Möchten Sie die Rechnung wirklich löschen",
      confirmDuplicate: "Rechnung duplizieren",
      cancelAndNew: "Abbrechen und neue Rechnung",
      limitReached: "Limit erreicht",
      limitMessage: "Sie haben das Limit von",
      subscribeMessage: "Abonnieren Sie, um bis zu 100 Rechnungen pro Monat zu erstellen.",
      noInvoices: "Sie haben keine gespeicherten Rechnungen",
      loadingInvoices: "Rechnungen werden geladen...",
      publicLink: "Öffentlich",
      generateLink: "Öffentlichen Link generieren",
      copyLink: "Öffentlichen Link kopieren",
      removeLink: "Öffentlichen Link entfernen",
      confirmRemoveLink: "Öffentlichen Link aus der Rechnung entfernen",
      openLink: "Öffentlichen Link öffnen"
    },

    validation: {
      invoiceNumberRequired: "Rechnungsnummer ist erforderlich",
      clientNameRequired: "Kundenname ist erforderlich",
      itemDescriptionRequired: "Alle Positionen müssen eine Beschreibung haben"
    },
    invoicesCount: "Rechnungen",
    editingStatus: "Bearbeitung",
    activeStatus: "Aktiv",
    public: "Öffentlich",
    updated: "Aktualisiert:",
    confirmDeleteInvoice: "Möchten Sie die Rechnung wirklich löschen",
    confirmDuplicateInvoice: "Rechnung duplizieren",
    confirmRemovePublicLink: "Öffentlichen Link aus der Rechnung entfernen",
    generatingPdf: "PDF wird generiert...",
    invoicesLimit: "Rechnungen",
    subscriptionLimit: "Sie haben das Limit von",
    subscriptionMessage: "Abonnieren Sie, um bis zu 100 Rechnungen pro Monat zu erstellen.",
    freeLimit: "Löschen Sie einige oder bearbeiten Sie eine vorhandene.",
    validationErrors: "Validierungsfehler:",
    noInvoicesMessage: "Sie haben keine gespeicherten Rechnungen",
    loadingInvoicesMessage: "Rechnungen werden geladen...",
    showDetails: "Alle Vorteile anzeigen",
    hideDetails: "Details ausblenden",
    manageInvoices: "Verwaltung gespeicherter Rechnungen",
    invoicesList: "Liste gespeicherter Rechnungen",
    createdAt: "Erstellt:",
    publicLinkUrl: "🔗",

    tooltips: {
      load: "Rechnung laden zum Anzeigen",
      edit: "Rechnung bearbeiten",
      duplicate: "Rechnung duplizieren",
      delete: "Rechnung löschen",
      generatePublicLink: "Öffentlichen Link generieren",
      copyPublicLink: "Öffentlichen Link kopieren",
      openPublicLink: "Öffentlichen Link öffnen",
      removePublicLink: "Öffentlichen Link entfernen"
    }
  }
};

export const invoiceLanguageSelectorTranslations: Record<Language, {
  title: string;
  compactTitle: string;
  currentLanguage: string;
  updating: string;
  error: string;
  selectLanguage: string;
}> = {
  en: {
    title: "Invoice Language",
    compactTitle: "Invoice language",
    currentLanguage: "Invoice in:",
    updating: "Updating...",
    error: "Error",
    selectLanguage: "Select invoice language"
  },
  es: {
    title: "Idioma Factura",
    compactTitle: "Idioma de la factura",
    currentLanguage: "Factura en:",
    updating: "Actualizando...",
    error: "Error",
    selectLanguage: "Seleccionar idioma de factura"
  },
  pt: {
    title: "Idioma Fatura",
    compactTitle: "Idioma da fatura",
    currentLanguage: "Fatura em:",
    updating: "Atualizando...",
    error: "Erro",
    selectLanguage: "Selecionar idioma da fatura"
  },
  ja: {
    title: "請求書言語",
    compactTitle: "請求書の言語",
    currentLanguage: "請求書:",
    updating: "更新中...",
    error: "エラー",
    selectLanguage: "請求書の言語を選択"
  },
  fr: {
    title: "Langue Facture",
    compactTitle: "Langue de la facture",
    currentLanguage: "Facture en:",
    updating: "Mise à jour...",
    error: "Erreur",
    selectLanguage: "Sélectionner la langue de la facture"
  },
  de: {
    title: "Rechnungssprache",
    compactTitle: "Sprache der Rechnung",
    currentLanguage: "Rechnung in:",
    updating: "Wird aktualisiert...",
    error: "Fehler",
    selectLanguage: "Rechnungssprache auswählen"
  }
};


// Helper function
export const getInvoiceGeneratorTranslation = (language: Language) => {
  return invoiceGeneratorTranslations[language] || invoiceGeneratorTranslations.en;
};

export const getInvoiceLanguageSelectorTranslation = (language: Language) => {
  return invoiceLanguageSelectorTranslations[language] || invoiceLanguageSelectorTranslations.en;
};

export const landingTranslations: Record<Language, {
  // Social proof section
  socialProof: {
    trustedBy: string;
  };
  
  // Hero section
  hero: {
    title: string;
    titleHighlight: string;
    subtitle: string;
    generateButton: string;
  };
  
  // Features
  features: {
    aiPowered: string;
    multiLanguage: string;
    instantSharing: string;
    pdfReady: string;
  };
  
  // Floating cards
  floatingCards: {
    generatedIn: string;
    currencies: string;
    languages: string;
  };
  
  // Phone screens
  phoneScreens: {
    aiGenerator: string;
    placeholder: string;
    generating: string;
    generate: string;
    invoiceTitle: string;
    from: string;
    to: string;
    yourCompany: string;
    clientName: string;
    webDesignProject: string;
    total: string;
    shareLink: string;
    downloadPdf: string;
    invoiceSent: string;
    generatedInTime: string;
  };
}> = {
  en: {
    socialProof: {
      trustedBy: "Trusted by growing businesses"
    },
    hero: {
      title: "Generate Professional\nInvoices in",
      titleHighlight: "Seconds",
      subtitle: "AI-powered invoice generation for freelancers and SMBs. Create, customize, and share invoices instantly with multi-language and multi-currency support.",
      generateButton: "Generate Invoice Free"
    },
    features: {
      aiPowered: "AI-powered generation",
      multiLanguage: "Multi-language support", 
      instantSharing: "Instant web sharing",
      pdfReady: "PDF export ready"
    },
    floatingCards: {
      generatedIn: "Generated in 2.3s",
      currencies: "25+ Currencies",
      languages: "12 Languages"
    },
    phoneScreens: {
      aiGenerator: "AI Invoice Generator",
      placeholder: "Create invoice for web design project, $2,500, due in 30 days",
      generating: "Generating...",
      generate: "Generate",
      invoiceTitle: "INVOICE #001",
      from: "From:",
      to: "To:",
      yourCompany: "Your Company",
      clientName: "Client Name",
      webDesignProject: "Web Design Project",
      total: "Total",
      shareLink: "Share Link",
      downloadPdf: "Download PDF", 
      invoiceSent: "Invoice sent to client!",
      generatedInTime: "Generated in 2.3s"
    }
  },
  es: {
    socialProof: {
      trustedBy: "Confiado por empresas en crecimiento"
    },
    hero: {
      title: "Genera Facturas\nProfesionales en",
      titleHighlight: "Segundos", 
      subtitle: "Generación de facturas con IA para freelancers y PyMEs. Crea, personaliza y comparte facturas al instante con soporte multi-idioma y multi-moneda.",
      generateButton: "Generar Factura Gratis"
    },
    features: {
      aiPowered: "Generación con IA",
      multiLanguage: "Soporte multi-idioma",
      instantSharing: "Compartir web instantáneo", 
      pdfReady: "Exportación PDF lista"
    },
    floatingCards: {
      generatedIn: "Generada en 2.3s",
      currencies: "25+ Monedas",
      languages: "12 Idiomas"
    },
    phoneScreens: {
      aiGenerator: "Generador de Facturas IA",
      placeholder: "Crear factura para proyecto diseño web, €2,290, vence en 30 días",
      generating: "Generando...",
      generate: "Generar",
      invoiceTitle: "FACTURA #001",
      from: "De:",
      to: "Para:",
      yourCompany: "Tu Empresa",
      clientName: "Nombre Cliente",
      webDesignProject: "Proyecto Diseño Web",
      total: "Total",
      shareLink: "Compartir Enlace",
      downloadPdf: "Descargar PDF",
      invoiceSent: "¡Factura enviada al cliente!",
      generatedInTime: "Generada en 2.3s"
    }
  },
  pt: {
    socialProof: {
      trustedBy: "Confiado por empresas em crescimento"
    },
    hero: {
      title: "Gere Faturas\nProfissionais em",
      titleHighlight: "Segundos",
      subtitle: "Geração de faturas com IA para freelancers e PMEs. Crie, personalize e compartilhe faturas instantaneamente com suporte multi-idioma e multi-moeda.",
      generateButton: "Gerar Fatura Grátis"
    },
    features: {
      aiPowered: "Geração com IA",
      multiLanguage: "Suporte multi-idioma",
      instantSharing: "Compartilhamento web instantâneo",
      pdfReady: "Exportação PDF pronta"
    },
    floatingCards: {
      generatedIn: "Gerada em 2.3s",
      currencies: "25+ Moedas",
      languages: "12 Idiomas"
    },
    phoneScreens: {
      aiGenerator: "Gerador de Faturas IA",
      placeholder: "Criar fatura para projeto design web, $2,500, vence em 30 dias",
      generating: "Gerando...",
      generate: "Gerar",
      invoiceTitle: "FATURA #001",
      from: "De:",
      to: "Para:",
      yourCompany: "Sua Empresa",
      clientName: "Nome Cliente",
      webDesignProject: "Projeto Design Web",
      total: "Total",
      shareLink: "Compartilhar Link",
      downloadPdf: "Baixar PDF",
      invoiceSent: "Fatura enviada ao cliente!",
      generatedInTime: "Gerada em 2.3s"
    }
  },
  ja: {
    socialProof: {
      trustedBy: "成長企業に信頼されています"
    },
    hero: {
      title: "プロフェッショナルな\n請求書を",
      titleHighlight: "秒で",
      subtitle: "フリーランサーと中小企業のためのAI搭載請求書生成。多言語・多通貨対応で請求書を瞬時に作成、カスタマイズ、共有。",
      generateButton: "無料で請求書を生成"
    },
    features: {
      aiPowered: "AI搭載生成",
      multiLanguage: "多言語サポート",
      instantSharing: "即座のWeb共有",
      pdfReady: "PDF出力対応"
    },
    floatingCards: {
      generatedIn: "2.3秒で生成",
      currencies: "25以上の通貨",
      languages: "12言語"
    },
    phoneScreens: {
      aiGenerator: "AI請求書ジェネレーター",
      placeholder: "Webデザインプロジェクトの請求書を作成、¥250,000、30日後期限",
      generating: "生成中...",
      generate: "生成",
      invoiceTitle: "請求書 #001",
      from: "差出人:",
      to: "宛先:",
      yourCompany: "あなたの会社",
      clientName: "クライアント名",
      webDesignProject: "Webデザインプロジェクト",
      total: "合計",
      shareLink: "リンク共有",
      downloadPdf: "PDF ダウンロード",
      invoiceSent: "請求書がクライアントに送信されました！",
      generatedInTime: "2.3秒で生成"
    }
  },
  fr: {
    socialProof: {
      trustedBy: "Approuvé par les entreprises en croissance"
    },
    hero: {
      title: "Générez des Factures\nProfessionnelles en",
      titleHighlight: "Secondes",
      subtitle: "Génération de factures alimentée par l'IA pour freelancers et PME. Créez, personnalisez et partagez des factures instantanément avec support multi-langues et multi-devises.",
      generateButton: "Générer Facture Gratuite"
    },
    features: {
      aiPowered: "Génération IA",
      multiLanguage: "Support multi-langues",
      instantSharing: "Partage web instantané",
      pdfReady: "Export PDF prêt"
    },
    floatingCards: {
      generatedIn: "Généré en 2.3s",
      currencies: "25+ Devises",
      languages: "12 Langues"
    },
    phoneScreens: {
      aiGenerator: "Générateur de Factures IA",
      placeholder: "Créer facture pour projet design web, €2,290, échéance 30 jours",
      generating: "Génération...",
      generate: "Générer",
      invoiceTitle: "FACTURE #001",
      from: "De:",
      to: "À:",
      yourCompany: "Votre Entreprise",
      clientName: "Nom Client",
      webDesignProject: "Projet Design Web",
      total: "Total",
      shareLink: "Partager Lien",
      downloadPdf: "Télécharger PDF",
      invoiceSent: "Facture envoyée au client!",
      generatedInTime: "Généré en 2.3s"
    }
  },
  de: {
    socialProof: {
      trustedBy: "Vertraut von wachsenden Unternehmen"
    },
    hero: {
      title: "Erstellen Sie professionelle\nRechnungen in",
      titleHighlight: "Sekunden",
      subtitle: "KI-gestützte Rechnungserstellung für Freelancer und KMUs. Erstellen, anpassen und teilen Sie Rechnungen sofort mit Multi-Sprach- und Multi-Währungsunterstützung.",
      generateButton: "Rechnung Kostenlos Erstellen"
    },
    features: {
      aiPowered: "KI-gestützte Erstellung",
      multiLanguage: "Multi-Sprach-Support",
      instantSharing: "Sofortiges Web-Sharing",
      pdfReady: "PDF-Export bereit"
    },
    floatingCards: {
      generatedIn: "Erstellt in 2.3s",
      currencies: "25+ Währungen",
      languages: "12 Sprachen"
    },
    phoneScreens: {
      aiGenerator: "KI Rechnungs-Generator",
      placeholder: "Rechnung für Webdesign-Projekt erstellen, €2,290, fällig in 30 Tagen",
      generating: "Wird erstellt...",
      generate: "Erstellen",
      invoiceTitle: "RECHNUNG #001",
      from: "Von:",
      to: "An:",
      yourCompany: "Ihr Unternehmen",
      clientName: "Kundenname",
      webDesignProject: "Webdesign-Projekt",
      total: "Gesamt",
      shareLink: "Link Teilen",
      downloadPdf: "PDF Herunterladen",
      invoiceSent: "Rechnung an Kunden gesendet!",
      generatedInTime: "Erstellt in 2.3s"
    }
  }
};

// Traducciones de capabilities
export const capabilitiesTranslations: Record<Language, {
  title: string;
  subtitle: string;
  features: Array<{
    number: string;
    text: string;
  }>;
}> = {
  en: {
    title: "Capabilities",
    subtitle: "/ Core features",
    features: [
      {
        number: "01",
        text: "Connects to MQTT brokers and ingests live telemetry streams"
      },
      {
        number: "02",
        text: "Displays asset positions and state changes on a 3D map in real time"
      },
      {
        number: "03",
        text: "Supports user-defined layers, rules, and conditional visualization logic"
      }
    ]
  },
  es: {
    title: "Capacidades",
    subtitle: "/ Características principales",
    features: [
      {
        number: "01",
        text: "Se conecta a brokers MQTT e ingiere flujos de telemetría en vivo"
      },
      {
        number: "02",
        text: "Muestra posiciones de activos y cambios de estado en un mapa 3D en tiempo real"
      },
      {
        number: "03",
        text: "Soporta capas, reglas y lógica de visualización condicional definidas por el usuario"
      }
    ]
  },
  pt: {
    title: "Capacidades",
    subtitle: "/ Recursos principais",
    features: [
      {
        number: "01",
        text: "Conecta-se a brokers MQTT e ingere fluxos de telemetria ao vivo"
      },
      {
        number: "02",
        text: "Exibe posições de ativos e mudanças de estado em um mapa 3D em tempo real"
      },
      {
        number: "03",
        text: "Suporta camadas, regras e lógica de visualização condicional definidas pelo usuário"
      }
    ]
  },
  ja: {
    title: "機能",
    subtitle: "/ コア機能",
    features: [
      {
        number: "01",
        text: "MQTTブローカーに接続し、ライブテレメトリストリームを取り込みます"
      },
      {
        number: "02",
        text: "3Dマップ上で資産の位置と状態変化をリアルタイムで表示します"
      },
      {
        number: "03",
        text: "ユーザー定義のレイヤー、ルール、条件付き視覚化ロジックをサポートします"
      }
    ]
  },
  fr: {
    title: "Capacités",
    subtitle: "/ Fonctionnalités principales",
    features: [
      {
        number: "01",
        text: "Se connecte aux brokers MQTT et ingère des flux de télémétrie en direct"
      },
      {
        number: "02",
        text: "Affiche les positions des actifs et les changements d'état sur une carte 3D en temps réel"
      },
      {
        number: "03",
        text: "Prend en charge les couches, règles et logique de visualisation conditionnelle définies par l'utilisateur"
      }
    ]
  },
  de: {
    title: "Funktionen",
    subtitle: "/ Kernfunktionen",
    features: [
      {
        number: "01",
        text: "Verbindet sich mit MQTT-Brokern und nimmt Live-Telemetrieströme auf"
      },
      {
        number: "02",
        text: "Zeigt Asset-Positionen und Zustandsänderungen in Echtzeit auf einer 3D-Karte an"
      },
      {
        number: "03",
        text: "Unterstützt benutzerdefinierte Ebenen, Regeln und bedingte Visualisierungslogik"
      }
    ]
  }
};


// Traducciones de RealTwinWhyItMatters
export const realTwinWhyItMattersTranslations: Record<Language, {
  title: string;
  subtitle: string;
  paragraph1: string;
  paragraph2: string;
  cards: Array<{
    label: string;
    value: string;
  }>;
}> = {
  en: {
    title: "Why It Matters",
    subtitle: "/ Operational context",
    paragraph1: "Traditional GIS stacks capture static state, while MQTT streams capture live behavior. They rarely converge into a single operational surface that decision‑makers can trust in real time.",
    paragraph2: "By binding telemetry to geospatial context under explicit rules, RealTwin exposes a shared, live picture of the system. Operations, engineering, and field teams reason from the same ground truth instead of fragmented dashboards, screenshots, and log traces.",
    cards: [
      {
        label: "Decision latency",
        value: "Reduced"
      },
      {
        label: "Incident detection",
        value: "Visual & rules‑driven"
      },
      {
        label: "Cross‑team alignment",
        value: "Single live map"
      }
    ]
  },
  es: {
    title: "Por Qué Importa",
    subtitle: "/ Contexto operacional",
    paragraph1: "Los stacks GIS tradicionales capturan estado estático, mientras que los flujos MQTT capturan comportamiento en vivo. Raramente convergen en una única superficie operacional en la que los tomadores de decisiones puedan confiar en tiempo real.",
    paragraph2: "Al vincular telemetría al contexto geoespacial bajo reglas explícitas, RealTwin expone una imagen compartida y en vivo del sistema. Los equipos de operaciones, ingeniería y campo razonan desde la misma fuente de verdad en lugar de dashboards fragmentados, capturas de pantalla y trazas de registro.",
    cards: [
      {
        label: "Latencia de decisión",
        value: "Reducida"
      },
      {
        label: "Detección de incidentes",
        value: "Visual y por reglas"
      },
      {
        label: "Alineación entre equipos",
        value: "Un solo mapa en vivo"
      }
    ]
  },
  pt: {
    title: "Por Que Importa",
    subtitle: "/ Contexto operacional",
    paragraph1: "Stacks GIS tradicionais capturam estado estático, enquanto fluxos MQTT capturam comportamento ao vivo. Raramente convergem em uma única superfície operacional na qual os tomadores de decisão possam confiar em tempo real.",
    paragraph2: "Ao vincular telemetria ao contexto geoespacial sob regras explícitas, RealTwin expõe uma imagem compartilhada e ao vivo do sistema. Equipes de operações, engenharia e campo raciocinam a partir da mesma fonte de verdade em vez de dashboards fragmentados, capturas de tela e rastreamentos de log.",
    cards: [
      {
        label: "Latência de decisão",
        value: "Reduzida"
      },
      {
        label: "Detecção de incidentes",
        value: "Visual e por regras"
      },
      {
        label: "Alinhamento entre equipes",
        value: "Um único mapa ao vivo"
      }
    ]
  },
  ja: {
    title: "重要性",
    subtitle: "/ 運用コンテキスト",
    paragraph1: "従来のGISスタックは静的な状態をキャプチャし、MQTTストリームはライブ動作をキャプチャします。意思決定者がリアルタイムで信頼できる単一の運用サーフェスに収束することはめったにありません。",
    paragraph2: "明示的なルールの下でテレメトリを地理空間コンテキストにバインドすることで、RealTwinはシステムの共有されたライブ画像を公開します。運用、エンジニアリング、フィールドチームは、断片化されたダッシュボード、スクリーンショット、ログトレースではなく、同じ真実のソースから推論します。",
    cards: [
      {
        label: "意思決定の遅延",
        value: "削減"
      },
      {
        label: "インシデント検出",
        value: "ビジュアルとルール駆動"
      },
      {
        label: "チーム間の調整",
        value: "単一のライブマップ"
      }
    ]
  },
  fr: {
    title: "Pourquoi C'est Important",
    subtitle: "/ Contexte opérationnel",
    paragraph1: "Les stacks GIS traditionnels capturent l'état statique, tandis que les flux MQTT capturent le comportement en direct. Ils convergent rarement vers une surface opérationnelle unique sur laquelle les décideurs peuvent compter en temps réel.",
    paragraph2: "En liant la télémétrie au contexte géospatial sous des règles explicites, RealTwin expose une image partagée et en direct du système. Les équipes d'exploitation, d'ingénierie et de terrain raisonnent à partir de la même source de vérité au lieu de tableaux de bord fragmentés, de captures d'écran et de traces de journaux.",
    cards: [
      {
        label: "Latence de décision",
        value: "Réduite"
      },
      {
        label: "Détection d'incidents",
        value: "Visuelle et par règles"
      },
      {
        label: "Alignement inter-équipes",
        value: "Carte unique en direct"
      }
    ]
  },
  de: {
    title: "Warum Es Wichtig Ist",
    subtitle: "/ Operativer Kontext",
    paragraph1: "Traditionelle GIS-Stacks erfassen statische Zustände, während MQTT-Streams Live-Verhalten erfassen. Sie konvergieren selten zu einer einzigen operativen Oberfläche, der Entscheidungsträger in Echtzeit vertrauen können.",
    paragraph2: "Durch die Bindung von Telemetrie an den geospatialen Kontext unter expliziten Regeln legt RealTwin ein gemeinsames Live-Bild des Systems offen. Betriebs-, Engineering- und Feldteams argumentieren von derselben Quelle der Wahrheit aus, anstatt fragmentierte Dashboards, Screenshots und Log-Traces zu verwenden.",
    cards: [
      {
        label: "Entscheidungslatenz",
        value: "Reduziert"
      },
      {
        label: "Vorfallserkennung",
        value: "Visuell und regelbasiert"
      },
      {
        label: "Teamübergreifende Ausrichtung",
        value: "Einzelne Live-Karte"
      }
    ]
  }
};

// Traducciones de EarlyAccessCTA
export const earlyAccessCTATranslations: Record<Language, {
  badge: string;
  title: string;
  paragraph1: string;
  paragraph2: string;
  form: {
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    organizationLabel: string;
    organizationPlaceholder: string;
    submitButton: string;
    submitting: string;
    submitted: string;
    privacyNote: string;
  };
}> = {
  en: {
    badge: "EARLY ACCESS",
    title: "Join the beta cohort",
    paragraph1: "Intended for teams operating live MQTT streams where map-level visibility affects operations: NOCs, control rooms, fleet, utilities, industrial systems.",
    paragraph2: "If you need real-time spatial awareness from existing MQTT infrastructure and are willing to trial a pre-launch tool, leave your details below.",
    form: {
      nameLabel: "Name",
      namePlaceholder: "Enter your name",
      emailLabel: "Email",
      emailPlaceholder: "Enter your email",
      organizationLabel: "Organization",
      organizationPlaceholder: "Enter your organization",
      submitButton: "GET EARLY ACCESS",
      submitting: "SENDING...",
      submitted: "SUBMITTED",
      privacyNote: "Submissions are reviewed manually. Used only to evaluate fit and coordinate contact."
    }
  },
  es: {
    badge: "ACCESO ANTICIPADO",
    title: "Únete al grupo beta",
    paragraph1: "Dirigido a equipos que operan flujos MQTT en vivo donde la visibilidad a nivel de mapa afecta las operaciones: NOCs, salas de control, flotas, servicios públicos, sistemas industriales.",
    paragraph2: "Si necesitas conciencia espacial en tiempo real desde tu infraestructura MQTT existente y estás dispuesto a probar una herramienta pre-lanzamiento, deja tus datos a continuación.",
    form: {
      nameLabel: "Nombre",
      namePlaceholder: "Ingresa tu nombre",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "Ingresa tu correo electrónico",
      organizationLabel: "Organización",
      organizationPlaceholder: "Ingresa tu organización",
      submitButton: "OBTENER ACCESO ANTICIPADO",
      submitting: "ENVIANDO...",
      submitted: "ENVIADO",
      privacyNote: "Las solicitudes se revisan manualmente. Utilizadas solo para evaluar idoneidad y coordinar contacto."
    }
  },
  pt: {
    badge: "ACESSO ANTECIPADO",
    title: "Junte-se à cohort beta",
    paragraph1: "Destinado a equipes que operam fluxos MQTT ao vivo onde a visibilidade em nível de mapa afeta as operações: NOCs, salas de controle, frotas, utilidades, sistemas industriais.",
    paragraph2: "Se você precisa de consciência espacial em tempo real da infraestrutura MQTT existente e está disposto a testar uma ferramenta pré-lançamento, deixe seus dados abaixo.",
    form: {
      nameLabel: "Nome",
      namePlaceholder: "Digite seu nome",
      emailLabel: "E-mail",
      emailPlaceholder: "Digite seu e-mail",
      organizationLabel: "Organização",
      organizationPlaceholder: "Digite sua organização",
      submitButton: "OBTER ACESSO ANTECIPADO",
      submitting: "ENVIANDO...",
      submitted: "ENVIADO",
      privacyNote: "As submissões são revisadas manualmente. Usadas apenas para avaliar adequação e coordenar contato."
    }
  },
  ja: {
    badge: "早期アクセス",
    title: "ベータコホートに参加",
    paragraph1: "マップレベルの可視性が運用に影響を与えるライブMQTTストリームを運用するチーム向け：NOC、制御室、フリート、ユーティリティ、産業システム。",
    paragraph2: "既存のMQTTインフラストラクチャからリアルタイムの空間認識が必要で、プレローンチツールを試用する意思がある場合は、以下に詳細を残してください。",
    form: {
      nameLabel: "名前",
      namePlaceholder: "名前を入力してください",
      emailLabel: "メール",
      emailPlaceholder: "メールアドレスを入力してください",
      organizationLabel: "組織",
      organizationPlaceholder: "組織を入力してください",
      submitButton: "早期アクセスを取得",
      submitting: "送信中...",
      submitted: "送信完了",
      privacyNote: "提出は手動でレビューされます。適合性の評価と連絡の調整にのみ使用されます。"
    }
  },
  fr: {
    badge: "ACCÈS ANTICIPÉ",
    title: "Rejoignez la cohorte bêta",
    paragraph1: "Destiné aux équipes exploitant des flux MQTT en direct où la visibilité au niveau de la carte affecte les opérations : NOC, salles de contrôle, flottes, services publics, systèmes industriels.",
    paragraph2: "Si vous avez besoin d'une conscience spatiale en temps réel à partir de l'infrastructure MQTT existante et êtes prêt à tester un outil de pré-lancement, laissez vos coordonnées ci-dessous.",
    form: {
      nameLabel: "Nom",
      namePlaceholder: "Entrez votre nom",
      emailLabel: "E-mail",
      emailPlaceholder: "Entrez votre e-mail",
      organizationLabel: "Organisation",
      organizationPlaceholder: "Entrez votre organisation",
      submitButton: "OBTENIR L'ACCÈS ANTICIPÉ",
      submitting: "ENVOI EN COURS...",
      submitted: "ENVOYÉ",
      privacyNote: "Les soumissions sont examinées manuellement. Utilisées uniquement pour évaluer l'adéquation et coordonner le contact."
    }
  },
  de: {
    badge: "FRÜHER ZUGANG",
    title: "Treten Sie der Beta-Kohorte bei",
    paragraph1: "Für Teams, die Live-MQTT-Streams betreiben, bei denen die Sichtbarkeit auf Kartenebene die Operationen beeinflusst: NOCs, Kontrollräume, Flotten, Versorgungsunternehmen, Industriesysteme.",
    paragraph2: "Wenn Sie Echtzeit-Raumbewusstsein von bestehender MQTT-Infrastruktur benötigen und bereit sind, ein Pre-Launch-Tool zu testen, hinterlassen Sie unten Ihre Daten.",
    form: {
      nameLabel: "Name",
      namePlaceholder: "Geben Sie Ihren Namen ein",
      emailLabel: "E-Mail",
      emailPlaceholder: "Geben Sie Ihre E-Mail ein",
      organizationLabel: "Organisation",
      organizationPlaceholder: "Geben Sie Ihre Organisation ein",
      submitButton: "FRÜHEN ZUGANG ERHALTEN",
      submitting: "WIRD GESENDET...",
      submitted: "GESENDET",
      privacyNote: "Einreichungen werden manuell überprüft. Nur zur Bewertung der Eignung und Koordinierung des Kontakts verwendet."
    }
  }
};


// Traducciones del footer
export const footerTranslations: Record<Language, {
  brandName: string;
  description: string;
  connectTitle: string;
  linkedIn: string;
  founderSite: string;
  statusTitle: string;
  statusText: string;
  copyright: string;
  privacy: string;
  terms: string;
}> = {
  en: {
    brandName: "GIS Insight",
    description: "Real-time operational visibility for distributed systems. Connecting MQTT streams to live 3D maps.",
    connectTitle: "Connect",
    linkedIn: "LinkedIn",
    founderSite: "Founder's Site",
    statusTitle: "Status",
    statusText: "Early Access",
    copyright: "GIS Insight. All rights reserved.",
    privacy: "Privacy",
    terms: "Terms"
  },
  es: {
    brandName: "GIS Insight",
    description: "Visibilidad operacional en tiempo real para sistemas distribuidos. Conectando flujos MQTT a mapas 3D en vivo.",
    connectTitle: "Conectar",
    linkedIn: "LinkedIn",
    founderSite: "Sitio del Fundador",
    statusTitle: "Estado",
    statusText: "Acceso Anticipado",
    copyright: "GIS Insight. Todos los derechos reservados.",
    privacy: "Privacidad",
    terms: "Términos"
  },
  pt: {
    brandName: "GIS Insight",
    description: "Visibilidade operacional em tempo real para sistemas distribuídos. Conectando fluxos MQTT a mapas 3D ao vivo.",
    connectTitle: "Conectar",
    linkedIn: "LinkedIn",
    founderSite: "Site do Fundador",
    statusTitle: "Status",
    statusText: "Acesso Antecipado",
    copyright: "GIS Insight. Todos os direitos reservados.",
    privacy: "Privacidade",
    terms: "Termos"
  },
  ja: {
    brandName: "GIS Insight",
    description: "分散システムのリアルタイム運用可視性。MQTTストリームをライブ3Dマップに接続。",
    connectTitle: "接続",
    linkedIn: "LinkedIn",
    founderSite: "創設者のサイト",
    statusTitle: "ステータス",
    statusText: "早期アクセス",
    copyright: "GIS Insight. 無断複写・転載を禁じます。",
    privacy: "プライバシー",
    terms: "利用規約"
  },
  fr: {
    brandName: "GIS Insight",
    description: "Visibilité opérationnelle en temps réel pour les systèmes distribués. Connexion des flux MQTT aux cartes 3D en direct.",
    connectTitle: "Connecter",
    linkedIn: "LinkedIn",
    founderSite: "Site du Fondateur",
    statusTitle: "Statut",
    statusText: "Accès Anticipé",
    copyright: "GIS Insight. Tous droits réservés.",
    privacy: "Confidentialité",
    terms: "Conditions"
  },
  de: {
    brandName: "GIS Insight",
    description: "Echtzeit-Betriebssichtbarkeit für verteilte Systeme. Verbindung von MQTT-Streams mit Live-3D-Karten.",
    connectTitle: "Verbinden",
    linkedIn: "LinkedIn",
    founderSite: "Website des Gründers",
    statusTitle: "Status",
    statusText: "Früher Zugang",
    copyright: "GIS Insight. Alle Rechte vorbehalten.",
    privacy: "Datenschutz",
    terms: "Bedingungen"
  }
};

// Helper function to get landing translations
export const getLandingTranslation = (language: Language) => {
  return landingTranslations[language] || landingTranslations.en;
};
export const getCapabilitiesTranslation = (language: Language) => {
  return capabilitiesTranslations[language] || capabilitiesTranslations.en;
}

export const getRealTwinWhyItMattersTranslation = (language: Language) => {
  return realTwinWhyItMattersTranslations[language] || realTwinWhyItMattersTranslations.en;
}

export const getEarlyAccessCTATranslation = (language: Language) => {
  return earlyAccessCTATranslations[language] || earlyAccessCTATranslations.en;
}

export const getFooterTranslation = (language: Language) => {
  return footerTranslations[language] || footerTranslations.en;
}

export const getHeaderTermsTranslations = (language: Language) => {
  return headerTermsTranslations[language] || headerTermsTranslations.en;
}

export const getHeaderPrivacyTranslations = (language: Language) => {
  return headerTermsPrivacyTranslations[language] || headerTermsPrivacyTranslations.en;
}

export const getTermsTranslationsTranslations = (language: Language) => {
  return termsTranslations[language] || termsTranslations.en;
}

export const getPrivacyTranslations = (language: Language) => {
  return privacyTranslations[language] || privacyTranslations.en;
}