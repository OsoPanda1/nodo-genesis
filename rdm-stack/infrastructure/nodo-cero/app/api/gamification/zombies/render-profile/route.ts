/* ================================================================== */
/* API GAMIFICATION — Render profile de zombie                         */
/* ================================================================== */
/* Diseña el perfil visual (cosmético) de un zombie para la Arena 3D.  */
/* Vive bajo /api/gamification/* porque su resultado participa en la   */
/* arena y debe pasar por las políticas de sesión y juego del dominio. */
/* Unity conserva la autoridad sobre prefabs, NavMesh, Animator, daño, */
/* oleadas y ciclo de vida; este endpoint solo produce apariencia.     */
/* ================================================================== */

import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { designZombieVisual } from '@/lib/gamification/zombies/zombie-visual-designer';
import { zombieRenderRequestSchema, type ZombieRenderRequest } from '@/lib/core/contracts/zombie-render';
import { internalErrorJson } from '@/lib/core/contracts';

export const runtime = 'nodejs';

export const POST = guardedRoute<ZombieRenderRequest>(
  {
    route: 'api:gamification:zombies:render-profile',
    methods: ['POST'],
    rateLimit: 20,
    schema: zombieRenderRequestSchema,
  },
  async ({ body, traceId }) => {
    const startedAt = performance.now();

    try {
      const profile = await designZombieVisual({
        ...body,
        traceId,
      });

      return NextResponse.json(
        {
          success: true,
          data: profile,
          meta: {
            traceId,
            executionMs: Math.round(performance.now() - startedAt),
            runtime: 'nodejs',
            cell: 'ZombieVisualDesign',
            version: '1.0.0',
          },
        },
        {
          status: 200,
          headers: {
            'X-Cell-Type': 'ZombieVisualDesign',
            'X-Cell-Version': '1.0.0',
          },
        },
      );
    } catch {
      return internalErrorJson('No fue posible generar el perfil visual del zombie.');
    }
  },
);
