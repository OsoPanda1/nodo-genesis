export const config = {
  runtime: 'edge',
};

export async function parseEdgeRequest(request: Request): Promise<{ prompt: string; rawBody: any; error?: string }> {
  if (request.method !== 'POST') {
    return { prompt: '', rawBody: null, error: 'Método no permitido. Solo se aceptan peticiones POST.' };
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { prompt: '', rawBody: null, error: 'Cabecera Content-Type inválida. Se requiere "application/json".' };
    }

    const clonedRequest = request.clone();
    const bodyText = await clonedRequest.text();

    if (!bodyText.trim()) {
      return { prompt: '', rawBody: null, error: 'El cuerpo de la petición se encuentra vacío.' };
    }

    const payload = JSON.parse(bodyText);

    return {
      prompt: typeof payload.prompt === 'string' ? payload.prompt.trim() : '',
      rawBody: payload
    };

  } catch (err: any) {
    return {
      prompt: '',
      rawBody: null,
      error: `Error al decodificar la petición en Edge: ${err.message}`
    };
  }
}

export function createEdgeResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': 'https://www.visitarealdelmonte.online',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
