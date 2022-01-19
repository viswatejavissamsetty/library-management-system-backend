import {
  Body,
  Delete,
  Get,
  Module,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { DatabaseModule } from 'src/database/database.module';
import { notificationsProvider } from './notifications.providers';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, ...notificationsProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {
  constructor(private readonly notificationService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/all-notifications')
  async getAllNotifications(@Param('userId') userId: string) {
    return this.notificationService.getUserNotifications(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/change-notification-status')
  async changeNotificationStatus(
    @Body() status: { notificationId: string; status: 'READ' | 'UNREAD' },
  ) {
    return this.notificationService.changeNotificationStatus(
      status.notificationId,
      status.status,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/notification')
  async deleteNotification(@Query('notificationId') notificationId: string) {
    return this.notificationService.deleteNotification(notificationId);
  }
}
