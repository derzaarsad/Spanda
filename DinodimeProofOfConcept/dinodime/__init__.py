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

# Includes date1 and date2
def daterange(date1, date2):
    assert isinstance(date1, date)
    assert isinstance(date2, date)
    if(date2 < date1):
        raise ValueError("The end date cannot be before the start date!")

    dates = []
    for n in range(int ((date2 - date1).days)+1):
        dates.append(date1 + timedelta(n))
    return dates

def create8HoursSalary(amount,start_date,end_date):
    if amount < 0:
        raise ValueError("Salary cannot be negative!")
    dates = daterange(start_date, end_date)
    cash_activities = []
    amount_to_be_applied = 0.0
    for dt in dates:
        if dt.day == 28:
            amount_to_be_applied = amount
        cash_activities.append(CashActivity(0.0 if dt.weekday() > 4 else amount_to_be_applied,timedelta(0,0,0,0,0,8 if dt.weekday() < 5 else 0,0),dt))
        if dt.weekday() <= 4:
            amount_to_be_applied = 0.0
    return cash_activities

# Assumptions:
# 1. No public holiday
# 2. Working 8 hours a day from Monday to Friday
# 3. Salary pay day at 28th date of the month or the next working day if on the weekend
def monthlySalaryFactory(amount,start_month,end_month,start_year,end_year):
    start_dt = date(start_year, start_month, 1)
    tmp = date(end_year, end_month, 1)+timedelta(days=31)
    end_dt = date(tmp.year,tmp.month,1)-timedelta(days=1)
    return create8HoursSalary(amount,start_dt,end_dt)

def reccurentCashActivitiesFactory(daily_amount,start_date,end_date):
    dates = daterange(start_date, end_date)
    cash_activities = []
    for dt in dates:
        cash_activities.append(CashActivity(daily_amount,timedelta(0,0,0,0,0,0,0),dt))
    return cash_activities

def calculateBalanceDiff(dt, cash_activities):
    cash_activities_dt = list(filter(lambda cash_entity: cash_entity.execution_date == dt, cash_activities))
    balance_diff = 0
    total_work_effort = timedelta(0,0,0,0,0,0,0)
    for n in cash_activities_dt:
        balance_diff += n.cash_amount
        total_work_effort += n.work_effort
    return balance_diff, total_work_effort

# Only consider pay entities in the scope of start and end date
def calculateEndBalance(initial_amount,max_daily_work_duration,start_date,end_date,cash_activities, print_daily = False):
    if max_daily_work_duration >= timedelta(1,0,0,0,0,0,0):
        raise ValueError("Maximum work duration must be less than one day!")
    end_balance = initial_amount
    dates = daterange(start_date, end_date)
    balance_at_minimum = initial_amount + calculateBalanceDiff(start_date,cash_activities)[0]
    date_with_minimum_balance = start_date
    for dt in dates:
        balance_diff, total_work_effort = calculateBalanceDiff(dt,cash_activities)
        end_balance += balance_diff
        # check everything here
        if total_work_effort > max_daily_work_duration:
            raise ValueError('Cannot work more than ' + str(max_daily_work_duration) + ' hours!')
        if end_balance < 0:
            print(dt)
            raise ValueError('Not enough balance!')
        if(end_balance < balance_at_minimum):
            balance_at_minimum = end_balance
            date_with_minimum_balance = dt
        if print_daily:
            print(dt,end=" ")
            print("daily balance: " + str(balance_diff) + ", work duration: " + str(total_work_effort) + ", total balance: " + str(end_balance))
    return end_balance, balance_at_minimum, date_with_minimum_balance

def getAllowance(initial_amount,max_daily_work_duration,start_date,end_date,cash_activities,goal):
    end_balance, balance_at_minimum, date_with_minimum_balance = calculateEndBalance(initial_amount,max_daily_work_duration,start_date,end_date,cash_activities)
    print("total balance: " + str(end_balance))
    total_allowance = end_balance - goal
    assert(total_allowance >= 0)
    print("total allowance: " + str(total_allowance))
    print("minimum total balance: " + str(balance_at_minimum) + ", days: " + str(date_with_minimum_balance))
    total_days_to_divide = (date_with_minimum_balance - start_date).days+1
    print("days until minimum balance reached: " + str(total_days_to_divide))
    allowance_to_divide = balance_at_minimum if balance_at_minimum < total_allowance else total_allowance
    allowance = allowance_to_divide / total_days_to_divide
    return allowance

def investmentAllowance(return_days,profit_model,initial_amount,max_daily_work_duration,start_date,end_date,cash_activities):
    if return_days < 0:
        raise ValueError("The profit cannot be received in the past!")
    elif return_days == 0:
        balance_on_start_date = initial_amount + calculateBalanceDiff(start_date,cash_activities)[0]
        profit_on_start_date = profit_model(balance_on_start_date)
        return balance_on_start_date if profit_on_start_date > balance_on_start_date else 0.0
    one_day_before_profit = start_date+timedelta(days=(return_days-1))
    if one_day_before_profit >= end_date:
        return 0.0
    end_balance, balance_at_minimum, _ = calculateEndBalance(initial_amount,max_daily_work_duration,start_date,one_day_before_profit,cash_activities)
    profit_at_minimum = profit_model(balance_at_minimum)
    return balance_at_minimum if profit_at_minimum > balance_at_minimum else 0.0