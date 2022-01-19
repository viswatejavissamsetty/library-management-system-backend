import { Connection } from 'mongoose';
import { BookOrderSchema } from 'src/schemas/bookOrders.schema';

export const bookOrdersProvider = [
  {
    provide: 'BOOK_ORDER_MODEL',
    useFactory: (connection: Connection) =>
      connection.model('BookOrders', BookOrderSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];
