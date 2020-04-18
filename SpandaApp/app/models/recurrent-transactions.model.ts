import {JsonObject, JsonProperty} from "json2typescript";
import { TransactionFrequency } from "dinodime-sharedmodel";

@JsonObject("RecurrentTransaction")
export class RecurrentTransaction {

    @JsonProperty("Id", Number)
    Id: number = undefined;

    @JsonProperty("AccountId", Number)
    AccountId: number = undefined;

    @JsonProperty("AbsAmount", Number)
    AbsAmount: number = undefined;

    @JsonProperty("IsExpense", Boolean)
    IsExpense: boolean = undefined;

    @JsonProperty("IsConfirmed", Boolean)
    IsConfirmed: boolean = undefined;

    @JsonProperty("Frequency", TransactionFrequency)
    Frequency: TransactionFrequency = undefined;

    @JsonProperty("CounterPartName", String)
    CounterPartName: string = undefined;
  }