export interface Schema<T> {
  tableName: string;
  attributes: string;
  columns: { [key: string]: string };
  asRow(t: T): Array<any>;
  asObject(row: Array<any>): T;
}
