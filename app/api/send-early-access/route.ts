import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

// Schema de validación con Zod
const earlyAccessSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Nombre demasiado largo'),
  email: z.string().email('Email inválido'),
  organization: z.string().max(200, 'Organización demasiado larga').optional(),
  context: z.string().max(1000, 'Contexto demasiado largo').optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validar datos con Zod
    const validationResult = earlyAccessSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return NextResponse.json(
        { error: 'Datos inválidos', details: errors },
        { status: 400 }
      );
    }

    const { name, email, organization, context } = validationResult.data;

    // Enviar email a TU email (el que está verificado en Resend)
    const { data, error } = await resend.emails.send({
      from: 'Early Access <onboarding@resend.dev>',
      to: ['joelbenitezdonari@gmail.com'],
      subject: `Nueva solicitud de Early Access - ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="color: #fff; margin: 0; font-size: 24px; font-weight: 300;">Nueva Solicitud de Early Access</h1>
          </div>
          
          <div style="background: #fff; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 12px 12px;">
            <div style="margin-bottom: 20px;">
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Nombre</p>
              <p style="margin: 0; font-size: 16px; color: #000;">${name}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
              <p style="margin: 0; font-size: 16px; color: #000;">
                <a href="mailto:${email}" style="color: #0066cc; text-decoration: none;">${email}</a>
              </p>
            </div>
            
            ${organization ? `
            <div style="margin-bottom: 20px;">
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Organización</p>
              <p style="margin: 0; font-size: 16px; color: #000;">${organization}</p>
            </div>
            ` : ''}
            
            ${context ? `
            <div style="margin-bottom: 20px;">
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px;">Contexto</p>
              <p style="margin: 0; font-size: 16px; color: #000; line-height: 1.6;">${context}</p>
            </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                📅 ${new Date().toLocaleString('es-ES', { 
                  dateStyle: 'full', 
                  timeStyle: 'short' 
                })}
              </p>
            </div>
          </div>
        </div>
      `,
      replyTo: email,
    });

    if (error) {
      console.error('Error de Resend:', error);
      return NextResponse.json(
        { error: 'Error al enviar el email', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Solicitud enviada correctamente',
        data 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}