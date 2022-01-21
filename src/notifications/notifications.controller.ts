import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserNotifications(@Query('userId') userId: string) {
    return this.notificationsService.getUserNotifications(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async changeNotificationStatus(
    @Query('notificationId') notificationId: string,
    @Body() status: { status: 'READ' | 'UNREAD' },
  ) {
    return this.notificationsService.changeNotificationStatus(
      notificationId,
      status.status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  async deleteNotification(@Query('notificationId') notificationId: string) {
    return this.notificationsService.deleteNotification(notificationId);
  }
}
