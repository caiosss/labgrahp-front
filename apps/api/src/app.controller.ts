import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get("health")
  health() {
    return {
      service: "project-service",
      status: "ok",
    };
  }
}
