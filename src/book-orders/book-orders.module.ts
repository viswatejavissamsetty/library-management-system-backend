import { Module } from '@nestjs/common';
import { booksProvider } from 'src/books/books.providers';
import { BooksService } from 'src/books/books.service';
import { DatabaseModule } from 'src/database/database.module';
import { notificationsProvider } from 'src/notifications/notifications.providers';
import { NotificationsService } from 'src/notifications/notifications.service';
import { usersProviders } from 'src/users/users.providers';
import { UsersService } from 'src/users/users.service';
import { BookOrdersController } from './book-orders.controller';
import { bookOrdersProvider } from './book-orders.providers';
import { BookOrdersService } from './book-orders.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BookOrdersController],
  providers: [
    BookOrdersService,
    ...bookOrdersProvider,
    ...usersProviders,
    ...booksProvider,
    ...notificationsProvider,
    UsersService,
    BooksService,
    NotificationsService,
  ],
  exports: [BookOrdersService],
})
export class BookOrdersModule {}
