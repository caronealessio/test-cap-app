namespace company;

entity Products {
  key ID: UUID;
  name: String;
  description: String;
  price: Decimal;
}