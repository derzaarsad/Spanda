export type Success<T> = {
  kind: "success";
  result: T;
};

export type Failure = {
  kind: "failure";
  error: Error;
};

export type Status<T> = Success<T> | Failure;
