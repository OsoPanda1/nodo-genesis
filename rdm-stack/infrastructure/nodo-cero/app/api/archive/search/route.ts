import { NextResponse } from 'next/server';
import { guardedRoute } from '@/app/api/_shared/route-guard';
import { archiveSearchSchema, type ArchiveSearchInput } from '@/lib/core/contracts/archive';
import { searchPublishedItems } from '@/lib/archive/archive-search';
import { listItems, listCollections, findCollectionById } from '@/lib/archive/archive-repository';
import { itemWithFiles } from '@/lib/archive/archive-service';

export const runtime = 'nodejs';

/* ------------------------------------------------------------------ */
/* GET /api/archive/search — búsqueda full-text y filtros              */
/* ------------------------------------------------------------------ */
export const GET = guardedRoute(
  {
    route: 'api:archive:search',
    methods: ['GET'],
    rateLimit: 40,
    json: false,
  },
  async ({ req }) => {
    const raw: Record<string, unknown> = {};
    for (const [key, value] of req.nextUrl.searchParams.entries()) raw[key] = value;

    const parsed = archiveSearchSchema.safeParse(raw);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { ok: false, error: `Filtro inválido: ${first.path.join('.')} — ${first.message}` },
        { status: 400 },
      );
    }

    const input = parsed.data as ArchiveSearchInput;
    const collections = listCollections(true);
    let collectionId = input.collection;
    if (input.collection) {
      collectionId = resolveCollectionIdFromSlug(input.collection, collections);
      if (!collectionId) {
        return NextResponse.json({ ok: true, total: 0, items: [], page: 1, pageSize: input.pageSize, totalPages: 1 });
      }
    }

    const result = searchPublishedItems(listItems(), { ...input, collection: collectionId });
    return NextResponse.json({
      ok: true,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      items: result.items.map(i => ({
        ...itemWithFiles(i),
        collection: findCollectionById(i.collectionId),
      })),
    });
  },
);

function resolveCollectionIdFromSlug(slug: string, collections: Array<{ id: string; slug: string }>): string | undefined {
  return collections.find(c => c.slug === slug)?.id;
}
