data from user


get opening price of start date 
get opening price of end date 

get total share = entered_amount/opening_price of start date
end_date_value = total_share * end date opening price 


Start Amount: User Input Amount
Total Shares: Start Amount/Opening Price of Start Date
End Amount: Total Shares * Opening Price of End Date
Difference(+/-): End Amount - Start Amount
Percentage(+/-): Difference/Start Amount * 100%
Period: No of years if years > 2 otherwise No of months
Periodic Amount: Total Share * Opening Price of last day of period




if start date < 2014
    request twelvedata
        if that day was holiday and it return none
            return closet date data **
        else
            return data  **

if end_date>today
    get return rate from user

 

function total_shares(start_date, symbol):
    opening_price = self.get_opening_price(start_date, symbol)
    total_shares = Start Amount/opening_price
    return total_shares
    

function get_periods_date(start_date, end_date):
    if star_date and end_date difference is  less than 2 years
        return [month ending dates]
    else: 
        return [year ending dates]



function get_period_value(symbol, start_date, end_date):
    dates = self.get_periods_date(start_date, end_date)
    periods_price = [{}]
    for date in dates:
        opening_price = self.get_opening_price(date, symbol)
    return periods_price

function get_opening_price(date, symbol):
    get opening price of symbol of that date
    if opening_price couldn't get, try one day ago and do until it get's the opening price s
    return opening price



        


Remaining: TSLA
Date: 2016-01-01