import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SearchParams {
  q?: string;
  tag?: string;
}

@Injectable()
export class DichosService {
  async search(params: SearchParams) {
    const where: Record<string, unknown> = {};

    if (params.q) {
      where.OR = [
        { texto: { contains: params.q, mode: "insensitive" } },
        { significado: { contains: params.q, mode: "insensitive" } },
      ];
    }

    if (params.tag) {
      where.tags = { has: params.tag };
    }

    const dichos = await prisma.dicho.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return { total: dichos.length, items: dichos };
  }
}
