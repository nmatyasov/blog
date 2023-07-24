import { Logger, NotFoundException } from '@nestjs/common';
import {
  FilterQuery,
  Model,
  Types,
  UpdateQuery,
  SaveOptions,
  Connection,
  QueryOptions,
  PopulateOptions,
} from 'mongoose';
import { AbstractDocument } from './abstract.schema';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection
  ) {}

  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (
      await createdDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }

  async findOne(
    filterQuery: FilterQuery<TDocument>,
    populateOnFind: PopulateOptions[] = []
  ): Promise<TDocument> {
    const document = await this.model
      .findOne(filterQuery, {}, { lean: true })
      .populate(populateOnFind);

    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found.');
    }

    return document as unknown as TDocument;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>
  ) {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true,
    });

    if (!document) {
      this.logger.warn(`Document not found with filterQuery:`, filterQuery);
      throw new NotFoundException('Document not found.');
    }

    return document;
  }

  async upsert(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>
  ) {
    return this.model.findOneAndUpdate(filterQuery, document, {
      lean: true,
      upsert: true,
      new: true,
    });
  }

  async find(
    filterQuery: FilterQuery<TDocument>,
    queryOptions: QueryOptions,
    populateOnFind: PopulateOptions[] = []
  ): Promise<TDocument[]> {
    return this.model
      .find(filterQuery, {}, { lean: true })
      .populate(populateOnFind)
      .limit(queryOptions.limit || 10)
      .skip(queryOptions.skip || 0);
  }

  async startTransaction() {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }

  async deleteOne(filterQuery: FilterQuery<TDocument>): Promise<number> {
    const deleteResult = await this.model.deleteOne(filterQuery);
    if (!deleteResult.deletedCount) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found.');
    }
    return deleteResult.deletedCount;
  }

  async deleteMany(filterQuery: FilterQuery<TDocument>): Promise<number> {
    const deleteResult = await this.model.deleteMany(filterQuery);
    if (!deleteResult.deletedCount) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found.');
    }
    return deleteResult.deletedCount;
  }
}
