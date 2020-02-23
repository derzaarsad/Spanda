export type PublishSuccess = {
  kind: "success";
};

export type PublishFailure = {
  kind: "failure";
  error: any;
};

export type PublishStatus = PublishSuccess | PublishFailure;
