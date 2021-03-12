import unittest

from datetime import timedelta, date
from dinodime import CashActivity, daterange, reccurentCashActivitiesFactory, create8HoursSalary, monthlySalaryFactory, calculateBalanceDiff

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
        self.assertEqual(len(cash_activities),31)
        for i in range(31):
            self.assertEqual(cash_activities[i].execution_date,date(2021,8,i+1))
            if i == 29:
                self.assertEqual(cash_activities[i].cash_amount,1500.0)
            else:
                self.assertEqual(cash_activities[i].cash_amount,0.0)
            if date(2021,8,i+1).weekday() > 4:
                self.assertEqual(cash_activities[i].work_effort,timedelta(0,0,0,0,0,0,0))
            else:
                self.assertEqual(cash_activities[i].work_effort,timedelta(0,0,0,0,0,8,0))
        
        cash_activities = monthlySalaryFactory(1500.0,8,10,2021,2021)
        self.assertEqual(len(cash_activities),92)
        self.assertEqual(cash_activities[29].cash_amount,1500.0)
        self.assertEqual(cash_activities[58].cash_amount,1500.0)
        self.assertEqual(cash_activities[88].cash_amount,1500.0)
    
    def test_calculateBalanceDiff(self):
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
    
    def test_create8HoursSalary(self):
        with self.assertRaises(ValueError):
            create8HoursSalary(-1200.0,date(2021,5,27),date(2021,6,2))
        
        cash_activities = create8HoursSalary(1200.0,date(2021,5,27),date(2021,6,2))
        self.assertEqual(len(cash_activities),7)
        self.assertEqual(cash_activities[0].execution_date,date(2021,5,27))
        self.assertEqual(cash_activities[1].execution_date,date(2021,5,28))
        self.assertEqual(cash_activities[2].execution_date,date(2021,5,29))
        self.assertEqual(cash_activities[3].execution_date,date(2021,5,30))
        self.assertEqual(cash_activities[4].execution_date,date(2021,5,31))
        self.assertEqual(cash_activities[5].execution_date,date(2021,6,1))
        self.assertEqual(cash_activities[6].execution_date,date(2021,6,2))

        self.assertEqual(cash_activities[0].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[1].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[2].work_effort,timedelta(0,0,0,0,0,0,0))
        self.assertEqual(cash_activities[3].work_effort,timedelta(0,0,0,0,0,0,0))
        self.assertEqual(cash_activities[4].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[5].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[6].work_effort,timedelta(0,0,0,0,0,8,0))

        self.assertEqual(cash_activities[0].cash_amount,0.0)
        self.assertEqual(cash_activities[1].cash_amount,1200.0)
        self.assertEqual(cash_activities[2].cash_amount,0.0)
        self.assertEqual(cash_activities[3].cash_amount,0.0)
        self.assertEqual(cash_activities[4].cash_amount,0.0)
        self.assertEqual(cash_activities[5].cash_amount,0.0)
        self.assertEqual(cash_activities[6].cash_amount,0.0)

        cash_activities = create8HoursSalary(1200.0,date(2021,8,27),date(2021,9,2))
        self.assertEqual(len(cash_activities),7)
        self.assertEqual(cash_activities[0].execution_date,date(2021,8,27))
        self.assertEqual(cash_activities[1].execution_date,date(2021,8,28))
        self.assertEqual(cash_activities[2].execution_date,date(2021,8,29))
        self.assertEqual(cash_activities[3].execution_date,date(2021,8,30))
        self.assertEqual(cash_activities[4].execution_date,date(2021,8,31))
        self.assertEqual(cash_activities[5].execution_date,date(2021,9,1))
        self.assertEqual(cash_activities[6].execution_date,date(2021,9,2))

        self.assertEqual(cash_activities[0].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[1].work_effort,timedelta(0,0,0,0,0,0,0))
        self.assertEqual(cash_activities[2].work_effort,timedelta(0,0,0,0,0,0,0))
        self.assertEqual(cash_activities[3].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[4].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[5].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[6].work_effort,timedelta(0,0,0,0,0,8,0))

        self.assertEqual(cash_activities[0].cash_amount,0.0)
        self.assertEqual(cash_activities[1].cash_amount,0.0)
        self.assertEqual(cash_activities[2].cash_amount,0.0)
        self.assertEqual(cash_activities[3].cash_amount,1200.0)
        self.assertEqual(cash_activities[4].cash_amount,0.0)
        self.assertEqual(cash_activities[5].cash_amount,0.0)
        self.assertEqual(cash_activities[6].cash_amount,0.0)

        cash_activities = create8HoursSalary(1200.0,date(2021,3,27),date(2021,4,2))
        self.assertEqual(len(cash_activities),7)
        self.assertEqual(cash_activities[0].execution_date,date(2021,3,27))
        self.assertEqual(cash_activities[1].execution_date,date(2021,3,28))
        self.assertEqual(cash_activities[2].execution_date,date(2021,3,29))
        self.assertEqual(cash_activities[3].execution_date,date(2021,3,30))
        self.assertEqual(cash_activities[4].execution_date,date(2021,3,31))
        self.assertEqual(cash_activities[5].execution_date,date(2021,4,1))
        self.assertEqual(cash_activities[6].execution_date,date(2021,4,2))

        self.assertEqual(cash_activities[0].work_effort,timedelta(0,0,0,0,0,0,0))
        self.assertEqual(cash_activities[1].work_effort,timedelta(0,0,0,0,0,0,0))
        self.assertEqual(cash_activities[2].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[3].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[4].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[5].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[6].work_effort,timedelta(0,0,0,0,0,8,0))

        self.assertEqual(cash_activities[0].cash_amount,0.0)
        self.assertEqual(cash_activities[1].cash_amount,0.0)
        self.assertEqual(cash_activities[2].cash_amount,1200.0)
        self.assertEqual(cash_activities[3].cash_amount,0.0)
        self.assertEqual(cash_activities[4].cash_amount,0.0)
        self.assertEqual(cash_activities[5].cash_amount,0.0)
        self.assertEqual(cash_activities[6].cash_amount,0.0)

        cash_activities = create8HoursSalary(1200.0,date(2021,6,27),date(2021,7,3))
        self.assertEqual(len(cash_activities),7)
        self.assertEqual(cash_activities[0].execution_date,date(2021,6,27))
        self.assertEqual(cash_activities[1].execution_date,date(2021,6,28))
        self.assertEqual(cash_activities[2].execution_date,date(2021,6,29))
        self.assertEqual(cash_activities[3].execution_date,date(2021,6,30))
        self.assertEqual(cash_activities[4].execution_date,date(2021,7,1))
        self.assertEqual(cash_activities[5].execution_date,date(2021,7,2))
        self.assertEqual(cash_activities[6].execution_date,date(2021,7,3))

        self.assertEqual(cash_activities[0].work_effort,timedelta(0,0,0,0,0,0,0))
        self.assertEqual(cash_activities[1].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[2].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[3].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[4].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[5].work_effort,timedelta(0,0,0,0,0,8,0))
        self.assertEqual(cash_activities[6].work_effort,timedelta(0,0,0,0,0,0,0))

        self.assertEqual(cash_activities[0].cash_amount,0.0)
        self.assertEqual(cash_activities[1].cash_amount,1200.0)
        self.assertEqual(cash_activities[2].cash_amount,0.0)
        self.assertEqual(cash_activities[3].cash_amount,0.0)
        self.assertEqual(cash_activities[4].cash_amount,0.0)
        self.assertEqual(cash_activities[5].cash_amount,0.0)
        self.assertEqual(cash_activities[6].cash_amount,0.0)

if __name__ == '__main__':
    unittest.main()