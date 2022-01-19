import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { DatabaseModule } from 'src/database/database.module';
import { notificationsProvider } from './notifications.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, ...notificationsProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
