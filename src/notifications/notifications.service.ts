import { Inject, Injectable } from '@nestjs/common';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { NotificationDto } from 'src/types/notifications';

export type Notification = {
  readonly _id: string;
  userId: string;
  message: string;
  status: string;
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

  async changeNotificationStatus(
    notificationId: string,
    status: 'READ' | 'UNREAD',
  ): Promise<UpdateWriteOpResult> {
    return this.notificationModal.updateOne(
      { _id: notificationId, status: 'UNREAD' },
      { status },
    );
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
}
