import { en, Faker } from "@faker-js/faker";

import { Mappable } from "./CustomMap";

export class User implements Mappable {
  name: string;
  location: {
    lat: number; // latitude
    lng: number; // longitude
  };

  constructor() {
    const faker = new Faker({ locale: [en] });
    this.name = faker.person.firstName();
    this.location = {
      lat: faker.location.latitude(),
      lng: faker.location.longitude()
    };
  }

  markerContent(): string {
    return `
    <div>
      <h1>User: ${this.name}</h1>
    </div>
    `;
  }
}
