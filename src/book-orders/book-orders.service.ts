import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { BooksService } from 'src/books/books.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CreateBookOrderDto as BookOrderDto } from 'src/types/create-book-order';
import { UsersService } from 'src/users/users.service';

// All default constants
const booksCheckTime = {
  days: 0,
  hours: 0,
  minutes: 1,
  seconds: 0,
};
const returnTime = {
  days: 0,
  hours: 0,
  minutes: 5,
  seconds: 0,
};
const fineIntervalUnits: 'days' | 'hours' | 'minutes' | 'seconds' = 'minutes';

export type BookOrder = {
  readonly _id: string;
  userId: string;
  bookId: string;
  bookName: string;
  planedDate: Date;
  takenDate: Date | string;
  returnedDate: Date | string;
  status: string;
  fine: number;
  issuer: string;
  issuerName: string;
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
      const data = await this.bookOrderModel.find({ status: 'TAKEN' });
      return data.map((takenBook) => {
        const dateDiff = moment().diff(moment(takenBook.returnedDate), 'days');
        let fine = 0;
        if (dateDiff > 0) {
          fine = takenBook.fine * dateDiff;
        }
        takenBook.fine = fine;
        return takenBook;
      });
    } else {
      throw new HttpException('Invalid User', HttpStatus.FORBIDDEN);
    }
  }

  async getAllUserTakenBooks(userId: string): Promise<BookOrderDto[]> {
    const data = await this.bookOrderModel.find({ userId, status: 'TAKEN' });
    return data.map((takenBook) => {
      const dateDiff = moment().diff(moment(takenBook.returnedDate), 'days');
      let fine = 0;
      if (dateDiff > 0) {
        fine = takenBook.fine * dateDiff;
      }
      takenBook.fine = fine;
      return takenBook;
    });
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
    const userDetails = await this.userService.findOne(newData.userId);

    if (!userDetails) {
      throw new HttpException(
        `Invalid user ${newData.userId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (bookOrderDetailsCount == 0) {
      newData.planedDate = moment().toDate();
      newData.takenDate = new Date(0);
      newData.returnedDate = new Date(0);
      newData.status = 'PLANNED';
      newData.fine = bookDetails.fine;
      newData.bookName = bookDetails.bookTitle;
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
        const updateData = await this.bookOrderModel.updateOne(
          { _id: trackingId, status: 'TAKEN' },
          { status: 'RETURNED' },
        );
        if (updateData.modifiedCount == 0) {
          await this.bookService.updateBookCount(bookOrderDetails.bookId, -1);
        }
        return updateData;
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
      const returnDate = moment();
      returnDate.add(returnTime);
      await this.notificationsService.createNewNotification(
        bookOrderDetails.userId,
        `Your book ${bookDetails.bookTitle} has been Taken from library by ${
          user.nickName || user.firstName + user.lastName
        }`,
      );
      return this.bookOrderModel.updateOne(
        { _id: trackingId, status: 'PLANNED' },
        {
          takenDate: new Date(),
          returnedDate: returnDate,
          status: 'TAKEN',
          issuer: librarianId,
          issuerName: user.nickName || user.firstName + user.lastName,
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
        ? `Your book ${bookDetails.bookTitle} has been cancelled`
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
    return this.bookOrderModel.find({ status: 'TAKEN' });
  }

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCronJobForPlannedBooks() {
    const plannedBooks = await this.getAllUserPlannedBooksCronProcess();
    plannedBooks.forEach(async (book) => {
      const date1 = moment(book.planedDate);
      const date2 = moment();
      if (
        date2.diff(date1, 'seconds') >=
        moment.duration(booksCheckTime).asSeconds()
      ) {
        this.cancelBook(book._id, false);
      }
    });
  }

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  // @Cron(CronExpression.EVERY_MINUTE)
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCronJobForTakenBookWarning() {
    const takenBooks = await this.getAllUserTakenBooksCronProcess();
    takenBooks.forEach(async (book) => {
      const returnDate = moment(book.returnedDate);
      if (returnDate.isBefore()) {
        const bookDetails = await this.bookService.getBook(book.bookId);
        this.notificationsService.createNewNotification(
          book.userId,
          `You have due for book ${bookDetails.bookTitle} since ${
            book.returnedDate
          } and your fine is ${
            book.fine * moment(returnDate).diff(moment(), fineIntervalUnits)
          }`,
          'HIGH',
        );
      }
    });
  }
}
