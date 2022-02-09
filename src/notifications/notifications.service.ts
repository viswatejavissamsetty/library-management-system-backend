import { Inject, Injectable } from '@nestjs/common';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { NotificationDto } from 'src/types/notifications';
import { Cron, CronExpression } from '@nestjs/schedule';

const notificationsCheckTime = 60 * 60 * 24 * 15; // sec * min * hours * days -> here calculation indicates that is was 2 days.

export type Notification = {
  readonly _id: string;
  userId: string;
  message: string;
  status: string;
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  readonly createdAt: Date;
};

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('NOTIFICATIONS_MODEL')
    private notificationModal: Model<Notification>,
  ) {}

  async getUserNotifications(userId: string): Promise<NotificationDto[]> {
    return this.notificationModal.find({ userId });
  }

  async getAllUserUnreadNotificationsCount(userId: string): Promise<number> {
    const notifications = await this.notificationModal.find({
      userId,
      status: 'UNREAD',
    });
    return notifications.length;
  }

  async createNewNotification(
    userId: string,
    message: string,
    level: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM',
  ): Promise<NotificationDto> {
    const newNotification = new this.notificationModal({
      userId,
      message,
      level,
    });
    const data = await newNotification.save();
    return data;
  }

  async changeNotificationStatus(
    notificationId: string,
    status: 'READ' | 'UNREAD',
  ): Promise<UpdateWriteOpResult> {
    return this.notificationModal
      .updateOne({ _id: notificationId }, { status })
      .exec();
  }

  async deleteNotification(notificationId: string): Promise<any> {
    const data = await this.notificationModal.deleteOne({
      _id: notificationId,
    });
    if (data.deletedCount > 0) {
      return { status: 'success' };
    } else {
      return { status: 'failed' };
    }
  }

  // TODO: need to change this 5 minutes to every day at mid night.
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleCron() {
    const notifications = await this.notificationModal.find({
      status: 'READ',
    });
    notifications.forEach((notification) => {
      const date1 = new Date(notification.createdAt).getTime();
      const date2 = new Date().getTime();
      if (date2 - date1 >= notificationsCheckTime) {
        this.notificationModal.deleteOne({ _id: notification._id });
      }
    });
  }
}
