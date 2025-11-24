// src/app/api/ocr/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ninguna imagen' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    // Obtener credenciales desde variable de entorno (base64)
    const credentialsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!credentialsBase64) {
      return NextResponse.json(
        { error: 'Credenciales de Google no configuradas' },
        { status: 500 }
      );
    }

    const credentialsJson = Buffer.from(credentialsBase64, 'base64').toString('utf-8');
    const credentials = JSON.parse(credentialsJson);

    // Autenticar con Google
    const auth = new GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const authClient = await auth.getClient();

    // Llamar a Vision API
    const accessToken = await authClient.getAccessToken();
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
            },
          ],
        }),
      }
    );

    const visionData = await visionResponse.json();

    if (!visionData.responses?.[0]) {
      return NextResponse.json(
        { error: 'No se pudo extraer texto de la imagen' },
        { status: 400 }
      );
    }

    const text = visionData.responses[0].textAnnotations?.[0]?.description?.trim() || '';
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('[OCR ERROR]', error);
    return NextResponse.json(
      { error: 'Error al procesar la imagen' },
      { status: 500 }
    );
  }
}