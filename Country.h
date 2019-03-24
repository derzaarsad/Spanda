//
// Created by arsad on 09.03.19.
//

#ifndef SPANDA_COUNTRY_H
#define SPANDA_COUNTRY_H


#include <string>

namespace Spanda {
    class Country {
    public:
        Country(const std::string& name, const double& min_wage_per_month);
        auto getMinimumWagePerMonth() const {return mMinWagePerMonth;}

    private:
        std::string mName;
        double mMinWagePerMonth;
    };
}


#endif //SPANDA_COUNTRY_H
