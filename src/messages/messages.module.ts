import { Module } from '@nestjs/common';

import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesRepository } from './message.repository';

@Module({
  controllers: [MessagesController],
  // dependencies for other classes; only one instance of these will be created
  providers: [MessagesService, MessagesRepository],
})
export class MessagesModule {}
