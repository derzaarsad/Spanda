export type Success = {
  kind: "success";
};

export type Failure = {
  kind: "failure";
  error: Error;
};

export type Status = Success | Failure;
