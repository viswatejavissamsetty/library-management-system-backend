import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { BooksService } from 'src/books/books.service';
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
    newData.planedDate = new Date();
    newData.takenDate = new Date(0);
    newData.returnedDate = new Date(0);
    newData.status = 'PLANNED';
    newData.fine = bookDetails.fine;
    const createNewBookData = new this.bookOrderModel(newData);
    const data = await createNewBookData.save();
    await this.bookService.updateBookCount(newData.bookId, -1);
    return data;
  }

  async returnBook(
    trackingId: string,
    librarianId: string,
  ): Promise<UpdateWriteOpResult> {
    const issuerDetails = await this.userService.findOne(librarianId);
    const bookDetails = await this.bookOrderModel.findById(trackingId);
    if (issuerDetails.isLibrarian) {
      const data = await this.bookService.updateBookCount(
        bookDetails.bookId,
        1,
      );
      if (data) {
        return await this.bookOrderModel.updateOne(
          { _id: trackingId },
          { status: 'RETURNED' },
        );
      }
    } else {
      throw new HttpException('Invalid User', HttpStatus.FORBIDDEN);
    }
  }

  async takeABook(librarianId: string, tracingId: string) {
    const user = await this.userService.findOne(librarianId);
    if (user && user.isLibrarian) {
      const date = new Date();
      date.setDate(date.getDate() + 15);
      return this.bookOrderModel.updateOne(
        { _id: tracingId },
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

  async cancelBook(id: string) {
    const bookDetails = await this.bookOrderModel.findById(id);
    await this.bookService.updateBookCount(bookDetails.bookId, 1);
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

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    console.log('Runnning Cron Job');
    const plannedBooks = await this.getAllUserPlannedBooksCronProcess();
    plannedBooks.forEach((book) => {
      const date1 = new Date(book.planedDate);
      const date2 = new Date();
      if (date2.getTime() - date1.getTime() >= booksCheckTime) {
        this.cancelBook(book._id);
      }
    });
  }
}
