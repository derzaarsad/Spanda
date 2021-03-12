import unittest

from datetime import timedelta, date
from dinodime import daterange, dailyPayEntityFactory

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

    def test_dailyPayEntityFactory(self):
        with self.assertRaises(ValueError):
            dailyPayEntityFactory(-10.0,date(2013,4,5),date(2013,4,4))
        
        cash_activities = dailyPayEntityFactory(-10.0,date(2013,4,5),date(2013,4,8))
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

if __name__ == '__main__':
    unittest.main()