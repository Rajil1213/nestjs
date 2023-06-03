/// <reference types="@types/google.maps" />
import { Company } from "./Company";
import { CustomMap } from "./CustomMap";
import { User } from "./user";

const user = new User();
console.log(user);

const company = new Company();
console.log(company);

new CustomMap("map");
