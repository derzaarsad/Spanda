export type Success = {
  kind: "success";
};

export type Failure = {
  kind: "failure";
  error: any;
};

export type Status = Success | Failure;
