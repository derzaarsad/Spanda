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

def create8HoursSalary(amount,dates):
    assert isinstance(amount, float)
    cash_activities = []
    for dt in dates:
        cash_activities.append(CashActivity(0.0 if dt.day != 28 else amount,timedelta(0,0,0,0,0,8 if dt.weekday() < 5 else 0,0),dt))
    return cash_activities

# Assumptions:
# 1. No public holiday
# 2. Working 8 hours a day from Monday to Friday
# 3. Salary pay day at 28th date of the month and paid regardless of the weekend
def monthlySalaryFactory(amount,start_month,end_month,start_year,end_year):
    assert isinstance(amount, float)
    assert(amount > 0)
    start_dt = date(start_year, start_month, 1)
    tmp = date(end_year, end_month, 1)+timedelta(days=31)
    end_dt = date(tmp.year,tmp.month,1)-timedelta(days=1)
    dates = daterange(start_dt, end_dt)
    return create8HoursSalary(amount,dates)

def dailyPayEntityFactory(daily_amount,start_date,end_date):
    assert isinstance(daily_amount, float)
    dates = daterange(start_date, end_date)
    cash_entities = []
    for dt in dates:
        cash_entities.append(CashActivity(daily_amount,timedelta(0,0,0,0,0,0,0),dt))
    return cash_entities

def calculateDailyBalance(dt, cash_entities):
    cash_entities_dt = list(filter(lambda cash_entity: cash_entity.execution_date == dt, cash_entities))
    daily_balance = 0
    daily_work_duration = timedelta(0,0,0,0,0,0,0)
    for n in cash_entities_dt:
        daily_balance += n.cash_amount
        daily_work_duration += n.work_effort
    return daily_balance, daily_work_duration

# Only consider pay entities in the scope of start and end date
def calculateFinalBalance(initial_amount,max_daily_work_duration,start_date,end_date,cash_entities, print_daily = False):
    assert isinstance(start_date, date)
    assert isinstance(end_date, date)
    assert(max_daily_work_duration < timedelta(1,0,0,0,0,0,0))
    total_balance = initial_amount
    dates = daterange(start_date, end_date)
    minimum_total_balance = initial_amount + calculateDailyBalance(start_date,cash_entities)[0]
    days_with_minimum_total_balance = start_date
    for dt in dates:
        daily_balance, daily_work_duration = calculateDailyBalance(dt,cash_entities)
        total_balance += daily_balance
        # check everything here
        if daily_work_duration > max_daily_work_duration:
            raise Exception('Cannot work more than ' + str(max_daily_work_duration) + ' hours!')
        if total_balance < 0:
            print(dt)
            raise Exception('Not enough balance!')
        if(total_balance < minimum_total_balance):
            minimum_total_balance = total_balance
            days_with_minimum_total_balance = dt
        if print_daily:
            print(dt,end=" ")
            print("daily balance: " + str(daily_balance) + ", work duration: " + str(daily_work_duration) + ", total balance: " + str(total_balance))
    return total_balance,((end_date - start_date).days+1), minimum_total_balance, days_with_minimum_total_balance

def getAllowance(initial_amount,max_daily_work_duration,start_date,end_date,cash_entities,goal):
    tb,total_days, minimum_total_balance, days_with_minimum_total_balance = calculateFinalBalance(initial_amount,max_daily_work_duration,start_date,end_date,cash_entities)
    print("total balance: " + str(tb) + ", count: " + str(total_days))
    total_allowance = tb - goal
    assert(total_allowance >= 0)
    print("total allowance: " + str(total_allowance))
    print("minimum total balance: " + str(minimum_total_balance) + ", days: " + str(days_with_minimum_total_balance))
    total_days_to_divide = (days_with_minimum_total_balance - start_date).days+1
    print("days until minimum balance reached: " + str(total_days_to_divide))
    allowance_to_divide = minimum_total_balance if minimum_total_balance < total_allowance else total_allowance
    allowance = allowance_to_divide / total_days_to_divide
    return allowance