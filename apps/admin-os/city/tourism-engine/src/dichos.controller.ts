import { Controller, Get, Query } from "@nestjs/common";
import { DichosService } from "./dichos.service";

@Controller("dichos")
export class DichosController {
  constructor(private readonly service: DichosService) {}

  @Get()
  list(@Query("q") q?: string, @Query("tag") tag?: string) {
    return this.service.search({ q, tag });
  }
}
