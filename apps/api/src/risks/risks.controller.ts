import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RisksService } from './risks.service';
import { CreateRiskDto, UpdateRiskDto } from './dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth-user';

@Controller('risks')
export class RisksController {
  constructor(private readonly risks: RisksService) {}

  @Get()
  list() {
    return this.risks.list();
  }

  @Post()
  create(@Body() dto: CreateRiskDto, @CurrentUser() user: AuthUser) {
    return this.risks.create(dto, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRiskDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.risks.update(id, dto, user);
  }
}
