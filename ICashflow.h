//
// Created by arsad on 06.03.19.
//

#ifndef SPANDA_ICASHFLOW_H
#define SPANDA_ICASHFLOW_H

#include <boost/date_time/gregorian/gregorian.hpp>


namespace Spanda {
    enum DateUnit { DAY,WEEK,MONTH,YEAR };
}


namespace {
    class Reccuring {
    protected:
        double mMoney;
        boost::gregorian::date mStart, mEnd;
        int mInterval;
        Spanda::DateUnit mDateUnit;
        Reccuring(const boost::gregorian::date& start, const boost::gregorian::date& end, const int& interval, const Spanda::DateUnit dateUnit, const double& money) :
        mStart(start), mEnd(end), mInterval(interval), mDateUnit(dateUnit), mMoney(money) {}
        double getOccurencesFromStart(const boost::gregorian::date& date) {
            if(date < mStart) return 0;

            auto endDate = (mEnd > date) ? date : mEnd;

            if(mDateUnit == Spanda::DateUnit::DAY)
                return (endDate - mStart).days() / mInterval + 1;

            if(mDateUnit == Spanda::DateUnit::WEEK) {
                return getOccurencesFromStartImpl<boost::gregorian::week_iterator>(endDate);
            }

            if(mDateUnit == Spanda::DateUnit::MONTH) {
                return getOccurencesFromStartImpl<boost::gregorian::month_iterator>(endDate);
            }

            if(mDateUnit == Spanda::DateUnit::YEAR) {
                return getOccurencesFromStartImpl<boost::gregorian::year_iterator>(endDate);
            }

        }

        double getOccurences(const boost::gregorian::date& startdate, const boost::gregorian::date& enddate) {
            return getOccurencesFromStart(enddate) - getOccurencesFromStart(startdate - boost::gregorian::days(1));
        }

    private:
        template<typename T>
        double getOccurencesFromStartImpl(const boost::gregorian::date& endDate)
        {
            boost::gregorian::date_period dp(mStart,endDate);
            if(mStart == endDate) return 1;
            T it = dp.begin();

            int total = 1;
            int counter = 1;
            boost::gregorian::date last;
            while (*it < dp.end()) {
                ++it;
                if(counter == mInterval) {
                    total++;
                    counter = 1;
                } else
                    counter++;

                last = *it;
            }
            if((counter == 1) && (endDate < last))
                total -= 1;
            return total;
        }

    };

    class NonReccuring {
    protected:
        double mMoney;
        boost::gregorian::date mDate;
        NonReccuring(const boost::gregorian::date& date, const double& money) : mDate(date), mMoney(money) {}

    public:
        boost::gregorian::date getDate() const {return mDate;}
    };
}

namespace Spanda{


    class ICashflow {
    public:
        virtual double getTotalAmount(const boost::gregorian::date& startdate, const boost::gregorian::date& enddate) = 0;
    };

    class RevenueReccuring : public ICashflow, private Reccuring {
    public:
        RevenueReccuring(const boost::gregorian::date& start, const boost::gregorian::date& end, const int& interval, const Spanda::DateUnit dateUnit, const double& money) :
                Reccuring(start,end,interval,dateUnit,money)  {}
        virtual double getTotalAmount(const boost::gregorian::date& startdate, const boost::gregorian::date& enddate) { return getOccurences(startdate,enddate) * mMoney; }
    };

    class RevenueNonReccuring : public ICashflow, private NonReccuring {
    public:
        RevenueNonReccuring(const boost::gregorian::date& date, const double& money) : NonReccuring(date, money)  {}
        virtual double getTotalAmount(const boost::gregorian::date& startdate, const boost::gregorian::date& enddate) { return (mDate >= startdate && mDate <= startdate) ? mMoney : 0; }
    };

    class ExpenseReccuring : public ICashflow, private Reccuring {
    public:
        ExpenseReccuring(const boost::gregorian::date& start, const boost::gregorian::date& end, const int& interval, const Spanda::DateUnit dateUnit, const double& money) :
                Reccuring(start,end,interval,dateUnit,money)  {}
        virtual double getTotalAmount(const boost::gregorian::date& startdate, const boost::gregorian::date& enddate) { return -getOccurences(startdate,enddate) * mMoney; }
    };

    class ExpenseNonReccuring : public ICashflow, private NonReccuring {
    public:
        ExpenseNonReccuring(const boost::gregorian::date& date, const double& money) : NonReccuring(date, money)  {}
        virtual double getTotalAmount(const boost::gregorian::date& startdate, const boost::gregorian::date& enddate) { return (mDate >= startdate && mDate <= startdate) ? -mMoney : 0; }
    };

}


#endif //SPANDA_ICASHFLOW_H
