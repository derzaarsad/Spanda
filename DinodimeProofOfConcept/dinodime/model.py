from datetime import timedelta, date

class CashActivity:
    def __init__(self, cash_amount, work_effort, execution_date):
        assert isinstance(cash_amount, float)
        assert isinstance(work_effort, timedelta)
        assert isinstance(execution_date, date)
        self.cash_amount = cash_amount
        self.work_effort = work_effort
        self.execution_date = execution_date
    
    def __str__(self):
        return str(self.cash_amount) + " " + str(self.work_effort) + " " + str(self.execution_date.strftime("%Y-%m-%d"))

class Income:
    def __init__(self, return_days, work_effort):
        assert isinstance(return_days,int)
        assert isinstance(work_effort, timedelta)
        if return_days < 0:
            raise ValueError("The profit cannot be received in the past!")
        self.return_days = return_days
        self.work_effort = work_effort

    def __createDividendActivity__(self,investment,investment_date,return_date):
        raise ValueError("This method must be overriden!")

    def __profitModel__(self,investment):
        raise ValueError("This method must be overriden!")

    def createCashActivities(self,investment,investment_date):
        return_date = investment_date + timedelta(days=self.return_days)
        return self.__createDividendActivity__(investment,investment_date,return_date) + [CashActivity(self.__profitModel__(investment),self.work_effort,return_date)]

class SellGoods(Income):
    def __init__(self,sell_price,sell_days):
        Income.__init__(self, sell_days, timedelta(0,0,0,0,0,0,0))
        self.sell_price = sell_price

    def __profitModel__(self,investment):
        return self.sell_price

    def __createDividendActivity__(self,investment,investment_date,return_date):
        return []

class StockInvestment(Income):
    def __init__(self, return_days):
        Income.__init__(self, return_days, timedelta(0,0,0,0,0,0,0))

    def __profitModel__(self,investment):
        raise ValueError("This method must be overriden!")

    def __createDividendActivity__(self,investment,investment_date,return_date):
        raise ValueError("This method must be overriden!")