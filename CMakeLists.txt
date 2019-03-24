cmake_minimum_required(VERSION 3.10)
project(Spanda)

set(CMAKE_CXX_STANDARD 17)

find_package(Boost 1.65 REQUIRED COMPONENTS
        date_time)

add_executable(Spanda main.cpp ICashflow.h Country.cpp Country.h)
target_link_libraries(Spanda Boost::date_time)
