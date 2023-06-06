import { Injectable } from '@nestjs/common';

import { MessagesRepository } from './message.repository';

// mark for registration with the DI Container
@Injectable()
export class MessagesService {
  /////! use dependency injection instead!
  constructor(public messagesRepo: MessagesRepository) {}

  findOne(id: string) {
    return this.messagesRepo.findOne(id);
  }

  findAll() {
    return this.messagesRepo.findAll();
  }

  create(content: string) {
    return this.messagesRepo.create(content);
  }
}
