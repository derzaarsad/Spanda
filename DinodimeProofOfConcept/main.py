from datetime import timedelta, date
from dinodime import CashActivity, monthlySalaryFactory, reccurentCashActivitiesFactory, calculateBalanceDiff, getAllowance

########################### PLAYGROUND ###########################

start_eval_date = date(2021,2,4)
end_eval_date = date(2022,5,2)
salaries = monthlySalaryFactory(1200.0,3,4,2021,2022)
bonuses = [CashActivity(3000.0,timedelta(0,0,0,0,0,0,0),date(2021,12,31))]
expenses = reccurentCashActivitiesFactory(-10.0,start_eval_date,end_eval_date)
cash_activities = salaries + bonuses + expenses
total_balance_available = 1520

##################################################################
allowance = 0
start_date = start_eval_date

name = "not"
while name!= "exit":
    total_balance_before_allowance = total_balance_available + (calculateBalanceDiff(start_date,cash_activities)[0])
    allowance, diff_to_balance = getAllowance(total_balance_available,timedelta(0,0,0,0,0,10,0),start_date,end_eval_date,cash_activities, 115000)
    print("total balance available: " + str(total_balance_before_allowance) + ", total allowance: " + str(diff_to_balance))
    print("allowance at ",end="")
    print(start_date,end="")
    print(": " + str(allowance))
    name = input("How much do you want to spend at " + str(start_date.strftime("%Y-%m-%d")) + "? (write exit to finish) ")
    print("###########################################################################################")
    try:
        if name == "exit":
            print("Exiting..")
            break
        allowance = float(name)

        total_balance_available = total_balance_before_allowance - allowance
        start_date += timedelta(days=1)
    except:
        print("Input has to be a float number!")

# TEST: one of the days must have a total balance near 0
#allowance_used = dailyPayEntityFactory(-round(allowance,8),start_eval_date,date(2021,3,27))
#calculateEndBalance(1520,timedelta(0,0,0,0,0,10,0),start_eval_date,end_eval_date,cash_activities + allowance_used,True)
