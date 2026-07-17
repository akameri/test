import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ControlsService } from './controls.service';
import { UpdateControlDto } from './dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth-user';

@Controller('controls')
export class ControlsController {
  constructor(private readonly controls: ControlsService) {}

  @Get()
  list() {
    return this.controls.listGroupedByArea();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateControlDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.controls.update(id, dto, user);
  }
}
