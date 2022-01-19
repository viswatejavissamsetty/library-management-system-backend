import { Connection } from 'mongoose';
import { NotificationsSchema } from 'src/schemas/notifications.schema';

export const notificationsProvider = [
  {
    provide: 'NOTIFICATIONS_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('Notifications', NotificationsSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
