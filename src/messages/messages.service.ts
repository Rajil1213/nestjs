import { MessagesRepository } from './message.repository';

export class MessagesService {
  protected messagesRepo: MessagesRepository;

  //! use dependency injection instead!
  constructor() {
    this.messagesRepo = new MessagesRepository();
  }

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
