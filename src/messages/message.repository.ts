import { readFile, writeFile } from 'fs/promises';

import { Injectable } from '@nestjs/common';

// mark for registration with the DI Container
@Injectable()
export class MessagesRepository {
  async findOne(id: string) {
    const contents = await readFile('messages.json', 'utf-8');
    const messages = JSON.parse(contents);

    return messages[id];
  }

  async findAll() {
    const contents = await readFile('messages.json', 'utf-8');
    const messages = JSON.parse(contents);
    return messages;
  }

  async create(content: string) {
    const contents = await readFile('messages.json', 'utf-8');
    const messages = JSON.parse(contents);

    const id = Math.floor(Math.random() * 999);

    const newMessage = {
      id,
      content,
    };

    messages[`${id}`] = newMessage;
    await writeFile('messages.json', JSON.stringify(messages));

    return newMessage;
  }
}
