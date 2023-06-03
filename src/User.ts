import { es, Faker } from "@faker-js/faker";

export class User {
  name: string;
  location: {
    lat: number; // latitude
    lng: number; // longitude
  };

  constructor() {
    const faker = new Faker({ locale: [es] });
    this.name = faker.person.firstName();
    this.location = {
      lat: faker.location.latitude(),
      lng: faker.location.longitude()
    };
  }
}
