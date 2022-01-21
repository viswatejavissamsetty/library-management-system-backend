import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { BooksService } from 'src/books/books.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CreateBookOrderDto as BookOrderDto } from 'src/types/create-book-order';
import { UsersService } from 'src/users/users.service';

const booksCheckTime = 60 * 60 * 24 * 2; // sec * min * hours * days -> here calculation indicates that is was 2 days.

export type BookOrder = {
  readonly _id: string;
  userId: string;
  bookId: string;
  planedDate: Date;
  takenDate: Date | string;
  returnedDate: Date | string;
  status: string;
  fine: number;
  issuer: string;
};

@Injectable()
export class BookOrdersService {
  constructor(
    @Inject('BOOK_ORDER_MODEL') private bookOrderModel: Model<BookOrder>,
    private userService: UsersService,
    private bookService: BooksService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getAllPlannedBooks(id: string): Promise<BookOrderDto[]> {
    const user = await this.userService.findOne(id);
    if (user.isLibrarian) {
      return this.bookOrderModel.find({ status: 'PLANNED' });
    } else {
      throw new HttpException('Invalid User', HttpStatus.FORBIDDEN);
    }
  }

  async getAllUserPlannedBooks(userId: string): Promise<BookOrderDto[]> {
    return this.bookOrderModel.find({ userId, status: 'PLANNED' });
  }

  async getAllTakenBooks(id: string): Promise<BookOrderDto[]> {
    const user = await this.userService.findOne(id);
    if (user.isLibrarian) {
      return this.bookOrderModel.find({ status: 'TAKEN' });
    } else {
      throw new HttpException('Invalid User', HttpStatus.FORBIDDEN);
    }
  }

  async getAllUserTakenBooks(userId: string): Promise<BookOrderDto[]> {
    return this.bookOrderModel.find({ userId, status: 'TAKEN' });
  }

  async getAllReturnedBooks(): Promise<BookOrderDto[]> {
    return this.bookOrderModel.find({ status: 'RETURNED' });
  }

  async getAllUserReturnedBooks(userId: string): Promise<BookOrderDto[]> {
    return this.bookOrderModel.find({ userId, status: 'RETURNED' });
  }

  async planToTakeBook(newData: BookOrder) {
    const bookDetails = await this.bookService.getBook(newData.bookId);
    const bookOrderDetailsCount = await this.bookOrderModel.countDocuments({
      userId: newData.userId,
      bookId: newData.bookId,
      status: { $in: ['PLANNED', 'TAKEN'] },
    });

    if (bookOrderDetailsCount) {
      newData.planedDate = new Date();
      newData.takenDate = new Date(0);
      newData.returnedDate = new Date(0);
      newData.status = 'PLANNED';
      newData.fine = bookDetails.fine;
      const createNewBookData = new this.bookOrderModel(newData);
      const data = await createNewBookData.save();
      await this.notificationsService.createNewNotification(
        newData.userId,
        `Your book ${bookDetails.bookTitle} has been registered for Plan`,
      );
      await this.bookService.updateBookCount(newData.bookId, -1);
      return data;
    } else {
      throw new HttpException(
        `You have already taken or booked this book (${bookDetails.bookTitle}), you are unable to take another book until you return it.`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async returnBook(
    trackingId: string,
    librarianId: string,
  ): Promise<UpdateWriteOpResult> {
    const issuerDetails = await this.userService.findOne(librarianId);
    const bookOrderDetails = await this.bookOrderModel.findById(trackingId);
    const bookDetails = await this.bookService.getBook(bookOrderDetails.bookId);

    if (issuerDetails.isLibrarian) {
      const data = await this.bookService.updateBookCount(
        bookOrderDetails.bookId,
        1,
      );
      if (data) {
        await this.notificationsService.createNewNotification(
          bookOrderDetails.userId,
          `Your book ${bookDetails.bookTitle} has been returned to library`,
        );
        return await this.bookOrderModel.updateOne(
          { _id: trackingId },
          { status: 'RETURNED' },
        );
      }
    } else {
      throw new HttpException('Invalid User', HttpStatus.FORBIDDEN);
    }
  }

  async takeABook(librarianId: string, trackingId: string) {
    const user = await this.userService.findOne(librarianId);
    const bookOrderDetails = await this.bookOrderModel.findById(trackingId);
    const bookDetails = await this.bookService.getBook(bookOrderDetails.bookId);

    if (user && user.isLibrarian) {
      const date = new Date();
      date.setDate(date.getDate() + 15);
      await this.notificationsService.createNewNotification(
        bookOrderDetails.userId,
        `Your book ${bookDetails.bookTitle} has been Taken from library by ${
          user.nickName || user.firstName + user.lastName
        }`,
      );
      return this.bookOrderModel.updateOne(
        { _id: trackingId },
        {
          takenDate: new Date(),
          returnedDate: date,
          status: 'TAKEN',
          issuer: librarianId,
        },
      );
    } else {
      throw new HttpException('Invalid User', HttpStatus.FORBIDDEN);
    }
  }

  async cancelBook(id: string, flag = true) {
    const bookOrderDetails = await this.bookOrderModel.findById(id);
    const bookDetails = await this.bookService.getBook(bookOrderDetails.bookId);

    await this.bookService.updateBookCount(bookOrderDetails.bookId, 1);
    await this.notificationsService.createNewNotification(
      bookOrderDetails.userId,
      flag
        ? `Your book ${bookDetails.bookTitle} has been cancelled by you`
        : `Your book ${bookDetails.bookTitle} has been auto cancelled by system`,
    );
    const cancelBookStatus = await this.bookOrderModel.updateOne(
      {
        _id: id,
      },
      { status: 'CANCELLED' },
    );
    return cancelBookStatus;
  }

  private async getAllUserPlannedBooksCronProcess(): Promise<BookOrderDto[]> {
    return this.bookOrderModel.find({ status: 'PLANNED' });
  }

  private async getAllUserTakenBooksCronProcess(): Promise<BookOrderDto[]> {
    return this.bookOrderModel.find({ status: 'PLANNED' });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronJob1() {
    const plannedBooks = await this.getAllUserPlannedBooksCronProcess();
    plannedBooks.forEach((book) => {
      const date1 = new Date(book.planedDate);
      const date2 = new Date();
      if (date2.getTime() - date1.getTime() >= booksCheckTime) {
        this.cancelBook(book._id, false);
      }
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCronJob2() {
    const plannedBooks = await this.getAllUserTakenBooksCronProcess();
    const one_day = 60 * 60 * 24;
    plannedBooks.forEach(async (book) => {
      const currentDate = new Date();
      const returnDate = new Date(book.returnedDate);
      if (returnDate.getTime() >= currentDate.getTime()) {
        const bookDetails = await this.bookService.getBook(book.bookId);
        this.notificationsService.createNewNotification(
          book.userId,
          `You have due for book ${bookDetails.bookTitle} since ${
            book.returnedDate
          } and your fine is ${
            (book.fine *
              Math.round(currentDate.getTime() - returnDate.getTime())) /
            one_day
          }`,
          'HIGH',
        );
      }
    });
  }
}
