export interface ICustomErrorOptions extends ErrorOptions {
  name?: Optional<string>;
  code?: Optional<string>;
  statusCode?: Optional<number>;
  details?: Optional<unknown>;
}
