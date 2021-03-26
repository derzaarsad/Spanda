import unittest

from datetime import timedelta, date
from dinodime import CashActivity, daterange, reccurentCashActivitiesFactory, create8HoursSalary, monthlySalaryFactory, calculateBalanceDiff, calculateEndBalance, getAllowance, investmentAllowance, getWorkingDay, StockInvestment, SellGoods, Income

class TestProfitModel(Income):
    def __init__(self,return_days):
        Income.__init__(self,return_days,timedelta(0,0,0,0,0,0,0))

    def __profitModel__(self,investment):
        return 1.1 * investment

class TestNoProfitModel(Income):
    def __init__(self,return_days):
        Income.__init__(self,return_days,timedelta(0,0,0,0,0,0,0))

    def __profitModel__(self,investment):
        return investment

class TestLossModel(Income):
    def __init__(self,return_days):
        Income.__init__(self,return_days,timedelta(0,0,0,0,0,0,0))

    def __profitModel__(self,investment):
        return 0.99 * investment

class TestStockInvestment(StockInvestment):
    def __init__(self, return_days):
        StockInvestment.__init__(self, return_days)

    def __profitModel__(self,investment):
        return investment * 2.1

    def __createDividendActivity__(self,investment,investment_date,return_date):
        dividend_activities = []
        current_date = investment_date + timedelta(weeks=12)
        while current_date < return_date:
            dividend_activities.append(CashActivity(0.04 * investment, timedelta(0,0,0,0,0,0,0), current_date))
            current_date += timedelta(weeks=12)
        return dividend_activities

class TestDinodimeMethods(unittest.TestCase):

    def test_daterange(self):
        with self.assertRaises(ValueError):
            daterange(date(2012,3,4),date(2012,3,1))
        
        dates = daterange(date(2012,3,4),date(2012,3,7))
        self.assertEqual(len(dates),4)
        self.assertEqual(dates[0],date(2012,3,4))
        self.assertEqual(dates[1],date(2012,3,5))
        self.assertEqual(dates[2],date(2012,3,6))
        self.assertEqual(dates[3],date(2012,3,7))

        dates = daterange(date(2012,3,4),date(2012,3,4))
        self.assertEqual(len(dates),1)
        self.assertEqual(dates[0],date(2012,3,4))

    def test_reccurentCashActivitiesFactory(self):
        with self.assertRaises(ValueError):
            reccurentCashActivitiesFactory(-10.0,date(2013,4,5),date(2013,4,4))
        
        cash_activities = reccurentCashActivitiesFactory(-10.0,date(2013,4,5),date(2013,4,8))
        self.assertEqual(len(cash_activities),4)
        self.assertEqual(cash_activities[0].execution_date,date(2013,4,5))
        self.assertEqual(cash_activities[1].execution_date,date(2013,4,6))
        self.assertEqual(cash_activities[2].execution_date,date(2013,4,7))
        self.assertEqual(cash_activities[3].execution_date,date(2013,4,8))

        self.assertEqual(cash_activities[0].work_effort,timedelta(0,0,0,0,0,0,0))
        self.assertEqual(cash_activities[1].work_effort,timedelta(0,0,0,0,0,0,0))
        self.assertEqual(cash_activities[2].work_effort,timedelta(0,0,0,0,0,0,0))
        self.assertEqual(cash_activities[3].work_effort,timedelta(0,0,0,0,0,0,0))

        self.assertEqual(cash_activities[0].cash_amount,-10.0)
        self.assertEqual(cash_activities[1].cash_amount,-10.0)
        self.assertEqual(cash_activities[2].cash_amount,-10.0)
        self.assertEqual(cash_activities[3].cash_amount,-10.0)
    
    def test_monthlySalaryFactory(self):
        with self.assertRaises(ValueError):
            monthlySalaryFactory(1500.0,1,1,2010,2009)
        
        cash_activities = monthlySalaryFactory(1500.0,8,8,2021,2021)
        self.assertEqual(len(cash_activities),22)
        dates = [2,3,4,5,6,9,10,11,12,13,16,17,18,19,20,23,24,25,26,27,30,31]
        for i in range(22):
            self.assertEqual(cash_activities[i].execution_date,date(2021,8,dates[i]))
            if i == 20: # 30th August 2021
                self.assertEqual(cash_activities[i].cash_amount,1500.0)
            else:
                self.assertEqual(cash_activities[i].cash_amount,0.0)
            self.assertEqual(cash_activities[i].work_effort,timedelta(0,0,0,0,0,8,0))
        
        cash_activities = monthlySalaryFactory(1500.0,8,10,2021,2021)
        self.assertEqual(len(cash_activities),65)
        self.assertEqual(cash_activities[20].cash_amount,1500.0) # 30th August 2021
        self.assertEqual(cash_activities[41].cash_amount,1500.0) # 28th September 2021
        self.assertEqual(cash_activities[63].cash_amount,1500.0) # 28th October 2021
    
    def test_calculateBalanceDiff(self):
        # Only consider activities from the relevant date
        cash_activities = [
            CashActivity(11.0,timedelta(0,0,0,0,0,45,0),date(2013,9,20)),
            CashActivity(-9.0,timedelta(0,0,0,0,0,13,0),date(2013,9,20))
        ]
        daily_balance, daily_work_duration = calculateBalanceDiff(date(2013,9,21), cash_activities)
        self.assertEqual(daily_balance,0.0)
        self.assertEqual(daily_work_duration,timedelta(0,0,0,0,0,0,0))

        cash_activities = [
            CashActivity(11.0,timedelta(0,0,0,0,0,45,0),date(2013,9,20)),
            CashActivity(-9.0,timedelta(0,0,0,0,0,13,0),date(2013,9,20)),
            CashActivity(110.0,timedelta(0,0,0,0,0,450,0),date(2013,9,21)),
            CashActivity(-90.0,timedelta(0,0,0,0,0,130,0),date(2013,9,21)),
            CashActivity(1100.0,timedelta(0,0,0,0,0,4500,0),date(2013,9,22)),
            CashActivity(-900.0,timedelta(0,0,0,0,0,1300,0),date(2013,9,22))
        ]
        daily_balance, daily_work_duration = calculateBalanceDiff(date(2013,9,21), cash_activities)
        self.assertEqual(daily_balance,20.0)
        self.assertEqual(daily_work_duration,timedelta(0,0,0,0,0,580,0))
    
    def test_calculateEndBalance(self):
        # Maximum work duration must be less than 1 day
        with self.assertRaises(ValueError):
            calculateEndBalance(99.0,timedelta(0,0,0,0,0,24,0),date(2012,1,2),date(2012,1,5),[])
        
        # Total work effort in one day must not exceed the maximum allowed
        with self.assertRaises(ValueError):
            calculateEndBalance(99.0,timedelta(0,0,0,0,0,1,0),date(2012,1,2),date(2012,1,5),[CashActivity(20.0,timedelta(0,0,0,0,0,2,0),date(2012,1,4))])
        
        # Balance must not be zero
        with self.assertRaises(ValueError):
            calculateEndBalance(99.0,timedelta(0,0,0,0,0,10,0),date(2012,1,2),date(2012,1,5),[CashActivity(-100.0,timedelta(0,0,0,0,0,0,0),date(2012,1,4))])
        
        # Calculation range starts earlier and ends later than cash activities
        cash_activities = [
            CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,3)),
            CashActivity(100.0,timedelta(0,0,0,0,0,0,0),date(2012,1,4))
        ]

        end_balance, balance_at_minimum, date_with_minimum_balance = calculateEndBalance(99.0,timedelta(0,0,0,0,0,0,0),date(2012,1,2),date(2012,1,5),cash_activities)
        self.assertEqual(end_balance,189.0)
        self.assertEqual(balance_at_minimum,89.0)
        self.assertEqual(date_with_minimum_balance,date(2012,1,3))

        # Calculation range starts later and ends earlier than cash activities
        cash_activities = [
            CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,2)),
            CashActivity(0.0,timedelta(0,0,0,0,0,0,0),date(2012,1,3)),
            CashActivity(0.0,timedelta(0,0,0,0,0,0,0),date(2012,1,4)),
            CashActivity(100.0,timedelta(0,0,0,0,0,0,0),date(2012,1,5))
        ]

        end_balance, balance_at_minimum, date_with_minimum_balance = calculateEndBalance(99.0,timedelta(0,0,0,0,0,0,0),date(2012,1,3),date(2012,1,4),cash_activities)
        self.assertEqual(end_balance,99.0)
        self.assertEqual(balance_at_minimum,99.0)
        self.assertEqual(date_with_minimum_balance,date(2012,1,3))

        # Calculation range starts earlier and ends earlier than cash activities
        cash_activities = [
            CashActivity(10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,2)),
            CashActivity(100.0,timedelta(0,0,0,0,0,0,0),date(2012,1,3)),
            CashActivity(1000.0,timedelta(0,0,0,0,0,0,0),date(2012,1,4)),
            CashActivity(10000.0,timedelta(0,0,0,0,0,0,0),date(2012,1,5))
        ]

        end_balance, balance_at_minimum, date_with_minimum_balance = calculateEndBalance(99.0,timedelta(0,0,0,0,0,0,0),date(2012,1,1),date(2012,1,4),cash_activities)
        self.assertEqual(end_balance,1209.0)
        self.assertEqual(balance_at_minimum,99.0)
        self.assertEqual(date_with_minimum_balance,date(2012,1,1))

        # Calculation range starts later and ends later than cash activities
        cash_activities = [
            CashActivity(10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,2)),
            CashActivity(100.0,timedelta(0,0,0,0,0,0,0),date(2012,1,3)),
            CashActivity(1000.0,timedelta(0,0,0,0,0,0,0),date(2012,1,4)),
            CashActivity(10000.0,timedelta(0,0,0,0,0,0,0),date(2012,1,5))
        ]

        end_balance, balance_at_minimum, date_with_minimum_balance = calculateEndBalance(99.0,timedelta(0,0,0,0,0,0,0),date(2012,1,3),date(2012,1,6),cash_activities)
        self.assertEqual(end_balance,11199.0)
        self.assertEqual(balance_at_minimum,199.0)
        self.assertEqual(date_with_minimum_balance,date(2012,1,3))

        # Only considers cash activities in the evaluation range
        cash_activities = [
            CashActivity(9.0,timedelta(0,0,0,0,0,0,0),date(2012,1,2)),
            CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,3)),
            CashActivity(100.0,timedelta(0,0,0,0,0,0,0),date(2012,1,3)),
            CashActivity(7.0,timedelta(0,0,0,0,0,0,0),date(2012,1,4)),
            CashActivity(-13.0,timedelta(0,0,0,0,0,0,0),date(2012,1,4)),
            CashActivity(121.0,timedelta(0,0,0,0,0,0,0),date(2012,1,5))
        ]

        end_balance, balance_at_minimum, date_with_minimum_balance = calculateEndBalance(99.0,timedelta(0,0,0,0,0,0,0),date(2012,1,3),date(2012,1,4),cash_activities)
        self.assertEqual(end_balance,183.0)
        self.assertEqual(balance_at_minimum,183.0)
        self.assertEqual(date_with_minimum_balance,date(2012,1,4))
    
    def test_getAllowance(self):
        cash_activities = [
            CashActivity(-1.0,timedelta(0,0,0,0,0,0,0),date(2010,1,2)),
            CashActivity(998.0,timedelta(0,0,0,0,0,0,0),date(2010,1,3)),
            CashActivity(-990.0,timedelta(0,0,0,0,0,0,0),date(2010,1,4)),
            CashActivity(1.0,timedelta(0,0,0,0,0,0,0),date(2010,1,5)),
            CashActivity(-7.0,timedelta(0,0,0,0,0,0,0),date(2010,1,6)),
            CashActivity(495.0,timedelta(0,0,0,0,0,0,0),date(2010,1,7)),
            CashActivity(501.0,timedelta(0,0,0,0,0,0,0),date(2010,1,8))
        ]

        # The 1st day
        allowance, diff_to_balance = getAllowance(3.0,timedelta(0,0,0,0,0,10,0),date(2010,1,1),date(2010,1,9),cash_activities,400.0)
        self.assertEqual(allowance,1.0)
        self.assertEqual(diff_to_balance,600.0)

        # The 2nd day
        allowance, diff_to_balance = getAllowance(2.0,timedelta(0,0,0,0,0,10,0),date(2010,1,2),date(2010,1,9),cash_activities,400.0)
        self.assertEqual(allowance,1.0)
        self.assertEqual(diff_to_balance,599.0)

        # The 3rd day
        allowance, diff_to_balance = getAllowance(0.0,timedelta(0,0,0,0,0,10,0),date(2010,1,3),date(2010,1,9),cash_activities,400.0)
        self.assertEqual(allowance,0.5)
        self.assertEqual(diff_to_balance,598.0)

        # The 4th day
        allowance, diff_to_balance = getAllowance(997.5,timedelta(0,0,0,0,0,10,0),date(2010,1,4),date(2010,1,9),cash_activities,400.0)
        self.assertEqual(allowance,0.5)
        self.assertEqual(diff_to_balance,597.5)

        # The 5th day
        allowance, diff_to_balance = getAllowance(7.0,timedelta(0,0,0,0,0,10,0),date(2010,1,5),date(2010,1,9),cash_activities,400.0)
        self.assertEqual(allowance,0.5)
        self.assertEqual(diff_to_balance,597.0)

        # The 6th day
        allowance, diff_to_balance = getAllowance(7.5,timedelta(0,0,0,0,0,10,0),date(2010,1,6),date(2010,1,9),cash_activities,400.0)
        self.assertEqual(allowance,0.5)
        self.assertEqual(diff_to_balance,596.5)

        # The 7th day
        allowance, diff_to_balance = getAllowance(0.0,timedelta(0,0,0,0,0,10,0),date(2010,1,7),date(2010,1,9),cash_activities,400.0)
        self.assertEqual(allowance,495.0)
        self.assertEqual(diff_to_balance,596.0)

        # The 8th day
        allowance, diff_to_balance = getAllowance(0.0,timedelta(0,0,0,0,0,10,0),date(2010,1,8),date(2010,1,9),cash_activities,400.0)
        self.assertEqual(allowance,101.0)
        self.assertEqual(diff_to_balance,101.0)

        # Zero allowance
        allowance, diff_to_balance = getAllowance(400.0,timedelta(0,0,0,0,0,10,0),date(2010,1,9),date(2010,1,9),cash_activities,400.0)
        self.assertEqual(allowance,0.0)
        self.assertEqual(diff_to_balance,0.0)

        # The cash flow is increasing and decreasing
        cash_activities += [CashActivity(-3.0,timedelta(0,0,0,0,0,0,0),date(2010,1,3))]

        # The 1st day
        allowance, diff_to_balance = getAllowance(6.0,timedelta(0,0,0,0,0,10,0),date(2010,1,1),date(2010,1,9),cash_activities,600.0)
        self.assertEqual(allowance,0.6666666666666666)
        self.assertEqual(diff_to_balance,400.0)

        # If the goal is bigger than the available end balance, gives zero allowance
        allowance, diff_to_balance = getAllowance(6.0,timedelta(0,0,0,0,0,10,0),date(2010,1,1),date(2010,1,9),cash_activities,1800.0)
        self.assertEqual(allowance,0.0)
        self.assertEqual(diff_to_balance,-800.0)

    def test_investmentAllowance(self):
        # If the return date is the same as the investment date, and assuming that the model gives profit, return the balance at that date
        investment_allowance = investmentAllowance(TestProfitModel(0),1200.0,timedelta(0,0,0,0,0,10,0),date(2012,1,1),date(2012,1,4),[CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,1))])
        self.assertEqual(investment_allowance,1190.0)

        # If the return date is the same as the investment date, and assuming that the model gives no profit, return 0
        investment_allowance = investmentAllowance(TestNoProfitModel(0),1200.0,timedelta(0,0,0,0,0,10,0),date(2012,1,1),date(2012,1,4),[CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,1))])
        self.assertEqual(investment_allowance,0.0)

        investment_allowance = investmentAllowance(TestLossModel(0),1200.0,timedelta(0,0,0,0,0,10,0),date(2012,1,1),date(2012,1,4),[CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,1))])
        self.assertEqual(investment_allowance,0.0)

        # If the return date is out of the end date scope, gives 0
        investment_allowance = investmentAllowance(TestProfitModel(4),1200.0,timedelta(0,0,0,0,0,10,0),date(2012,1,1),date(2012,1,4),[CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,1))])
        self.assertEqual(investment_allowance,0.0)

        # If the return date is on the minimum balance date, return the minimum of the previous date range
        investment_allowance = investmentAllowance(TestProfitModel(2),1200.0,timedelta(0,0,0,0,0,10,0),date(2012,1,1),date(2012,1,5),[
            CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,1)),
            CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,2)),
            CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,3)),
            CashActivity(10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,4)),
            CashActivity(10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,5))
            ])
        self.assertEqual(investment_allowance,1180.0)

        # And of course 0 if there is no profit
        investment_allowance = investmentAllowance(TestNoProfitModel(2),1200.0,timedelta(0,0,0,0,0,10,0),date(2012,1,1),date(2012,1,5),[
            CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,1)),
            CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,2)),
            CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,3)),
            CashActivity(10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,4)),
            CashActivity(10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,5))
            ])
        self.assertEqual(investment_allowance,0.0)

        # Even if the global minimum balance is after the return date, return the minimum balance on the previous date range
        investment_allowance = investmentAllowance(TestProfitModel(2),1200.0,timedelta(0,0,0,0,0,10,0),date(2012,1,1),date(2012,1,5),[
            CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,1)),
            CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,2)),
            CashActivity(10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,3)),
            CashActivity(-100.0,timedelta(0,0,0,0,0,0,0),date(2012,1,4)),
            CashActivity(10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,5))
            ])
        self.assertEqual(investment_allowance,1180.0)

        # And of course 0 if there is no profit
        investment_allowance = investmentAllowance(TestNoProfitModel(2),1200.0,timedelta(0,0,0,0,0,10,0),date(2012,1,1),date(2012,1,5),[
            CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,1)),
            CashActivity(-10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,2)),
            CashActivity(10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,3)),
            CashActivity(-100.0,timedelta(0,0,0,0,0,0,0),date(2012,1,4)),
            CashActivity(10.0,timedelta(0,0,0,0,0,0,0),date(2012,1,5))
            ])
        self.assertEqual(investment_allowance,0.0)

    def test_getWorkingDay(self):
        working_day = getWorkingDay(date(2021,3,15))
        self.assertEqual(working_day,date(2021,3,15))

        working_day = getWorkingDay(date(2021,3,16))
        self.assertEqual(working_day,date(2021,3,16))

        working_day = getWorkingDay(date(2021,3,17))
        self.assertEqual(working_day,date(2021,3,17))

        working_day = getWorkingDay(date(2021,3,18))
        self.assertEqual(working_day,date(2021,3,18))

        working_day = getWorkingDay(date(2021,3,19))
        self.assertEqual(working_day,date(2021,3,19))

        working_day = getWorkingDay(date(2021,3,20))
        self.assertEqual(working_day,date(2021,3,22))

        working_day = getWorkingDay(date(2021,3,21))
        self.assertEqual(working_day,date(2021,3,22))

    def test_create8HoursSalary(self):
        # Salary cannot be negative
        with self.assertRaises(ValueError):
            create8HoursSalary(-1200.0,date(2021,5,27),date(2021,6,2),28)

        # Pay date must be earlier than 29th
        with self.assertRaises(ValueError):
            create8HoursSalary(-1200.0,date(2021,5,27),date(2021,6,2),29)
        
        # Pay day on Friday
        cash_activities = create8HoursSalary(1200.0,date(2021,5,27),date(2021,6,2),28)
        self.assertEqual(len(cash_activities),5)
        self.assertEqual(cash_activities[0].execution_date,date(2021,5,27))
        self.assertEqual(cash_activities[1].execution_date,date(2021,5,28))
        self.assertEqual(cash_activities[2].execution_date,date(2021,5,31))
        self.assertEqual(cash_activities[3].execution_date,date(2021,6,1))
        self.assertEqual(cash_activities[4].execution_date,date(2021,6,2))

        self.assertEqual(cash_activities[0].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[1].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[2].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[3].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[4].work_effort,timedelta(0,0,0,0,0,8,0))

        self.assertEqual(cash_activities[0].cash_amount,0.0)
        self.assertEqual(cash_activities[1].cash_amount,1200.0)
        self.assertEqual(cash_activities[2].cash_amount,0.0)
        self.assertEqual(cash_activities[3].cash_amount,0.0)
        self.assertEqual(cash_activities[4].cash_amount,0.0)

        # Pay day on Saturday
        cash_activities = create8HoursSalary(1200.0,date(2021,8,27),date(2021,9,2),28)
        self.assertEqual(len(cash_activities),5)
        self.assertEqual(cash_activities[0].execution_date,date(2021,8,27))
        self.assertEqual(cash_activities[1].execution_date,date(2021,8,30))
        self.assertEqual(cash_activities[2].execution_date,date(2021,8,31))
        self.assertEqual(cash_activities[3].execution_date,date(2021,9,1))
        self.assertEqual(cash_activities[4].execution_date,date(2021,9,2))

        self.assertEqual(cash_activities[0].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[1].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[2].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[3].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[4].work_effort,timedelta(0,0,0,0,0,8,0))

        self.assertEqual(cash_activities[0].cash_amount,0.0)
        self.assertEqual(cash_activities[1].cash_amount,1200.0)
        self.assertEqual(cash_activities[2].cash_amount,0.0)
        self.assertEqual(cash_activities[3].cash_amount,0.0)
        self.assertEqual(cash_activities[4].cash_amount,0.0)

        # Pay day on Sunday
        cash_activities = create8HoursSalary(1200.0,date(2021,3,27),date(2021,4,2),28)
        self.assertEqual(len(cash_activities),5)
        self.assertEqual(cash_activities[0].execution_date,date(2021,3,29))
        self.assertEqual(cash_activities[1].execution_date,date(2021,3,30))
        self.assertEqual(cash_activities[2].execution_date,date(2021,3,31))
        self.assertEqual(cash_activities[3].execution_date,date(2021,4,1))
        self.assertEqual(cash_activities[4].execution_date,date(2021,4,2))

        self.assertEqual(cash_activities[0].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[1].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[2].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[3].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[4].work_effort,timedelta(0,0,0,0,0,8,0))

        self.assertEqual(cash_activities[0].cash_amount,1200.0)
        self.assertEqual(cash_activities[1].cash_amount,0.0)
        self.assertEqual(cash_activities[2].cash_amount,0.0)
        self.assertEqual(cash_activities[3].cash_amount,0.0)
        self.assertEqual(cash_activities[4].cash_amount,0.0)

        # Pay day on Monday
        cash_activities = create8HoursSalary(1200.0,date(2021,6,27),date(2021,7,3),28)
        self.assertEqual(len(cash_activities),5)
        self.assertEqual(cash_activities[0].execution_date,date(2021,6,28))
        self.assertEqual(cash_activities[1].execution_date,date(2021,6,29))
        self.assertEqual(cash_activities[2].execution_date,date(2021,6,30))
        self.assertEqual(cash_activities[3].execution_date,date(2021,7,1))
        self.assertEqual(cash_activities[4].execution_date,date(2021,7,2))

        self.assertEqual(cash_activities[0].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[1].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[2].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[3].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[4].work_effort,timedelta(0,0,0,0,0,8,0))

        self.assertEqual(cash_activities[0].cash_amount,1200.0)
        self.assertEqual(cash_activities[1].cash_amount,0.0)
        self.assertEqual(cash_activities[2].cash_amount,0.0)
        self.assertEqual(cash_activities[3].cash_amount,0.0)
        self.assertEqual(cash_activities[4].cash_amount,0.0)

    def test_StockInvestment(self):
        testStockInvestment = TestStockInvestment(365)
        cashActivities = testStockInvestment.createCashActivities(100.0,date(2021,1,1))

        self.assertEqual(len(cashActivities),5)
        self.assertEqual(cashActivities[0].execution_date,date(2021,3,26))
        self.assertEqual(cashActivities[1].execution_date,date(2021,6,18))
        self.assertEqual(cashActivities[2].execution_date,date(2021,9,10))
        self.assertEqual(cashActivities[3].execution_date,date(2021,12,3))
        self.assertEqual(cashActivities[4].execution_date,date(2022,1,1))

        self.assertEqual(cashActivities[0].cash_amount,4.0)
        self.assertEqual(cashActivities[1].cash_amount,4.0)
        self.assertEqual(cashActivities[2].cash_amount,4.0)
        self.assertEqual(cashActivities[3].cash_amount,4.0)
        self.assertEqual(cashActivities[4].cash_amount,210.0)

    def test_SellGoods(self):
        sellGoods = SellGoods(100.0,0)

        # The sale price is assumed to be independent from investment price
        cashActivities = sellGoods.createCashActivities(123.0,date(2021,1,1))

        self.assertEqual(len(cashActivities),1)
        self.assertEqual(cashActivities[0].execution_date,date(2021,1,1))
        self.assertEqual(cashActivities[0].cash_amount,100.0)

    def test_Income(self):
        # Return days cannot be negative
        with self.assertRaises(ValueError):
            income = Income(-1,timedelta(0,0,0,0,0,0,0))

if __name__ == '__main__':
    unittest.main()