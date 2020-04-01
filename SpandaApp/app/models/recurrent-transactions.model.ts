import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject("RecurrentTransaction")
export class RecurrentTransaction {

    @JsonProperty("Id", Number)
    Id: number = undefined;

    @JsonProperty("AccountId", Number)
    AccountId: number = undefined;

    @JsonProperty("IsExpense", Boolean)
    IsExpense: boolean = undefined;

    @JsonProperty("IsConfirmed", Boolean)
    IsConfirmed: boolean = undefined;

    @JsonProperty("Frequency", String)
    Frequency: string = undefined;

    @JsonProperty("CounterPartName", String)
    CounterPartName: string = undefined;
  }