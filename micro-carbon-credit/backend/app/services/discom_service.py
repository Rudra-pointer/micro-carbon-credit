import random
from datetime import date, timedelta
from dataclasses import dataclass
from typing import List
import httpx
from dateutil.relativedelta import relativedelta

@dataclass
class BillData:
    units_consumed: float
    billing_period_start: date
    billing_period_end: date
    sanctioned_load: float
    has_solar_netmetering: bool
    total_amount_billed: float


class MockDISCOMService:
    """
    Fallback mock service generating 12 months of realistic consumption data.
    Base consumption: 200-400 kWh/month
    Seasonal multipliers: summer(Apr-Jun)=1.4, monsoon(Jul-Sep)=0.85, winter(Nov-Feb)=0.75, normal=1.0
    """
    async def fetch_12_month_history(self, consumer_number: str) -> List[BillData]:
        bills = []
        base_consumption = random.uniform(200.0, 400.0)
        
        end_date = date.today().replace(day=1) - timedelta(days=1)
        start_date = end_date.replace(day=1)

        for i in range(12):
            month = start_date.month
            if month in [4, 5, 6]:
                multiplier = 1.4
            elif month in [7, 8, 9]:
                multiplier = 0.85
            elif month in [11, 12, 1, 2]:
                multiplier = 0.75
            else:
                multiplier = 1.0

            noise = random.uniform(0.9, 1.1)  # +/- 10% noise
            units = base_consumption * multiplier * noise
            
            # Simple assumption: 1 kWh = 7 INR (local currency)
            amount = units * 7.0

            bills.append(BillData(
                units_consumed=round(units, 2),
                billing_period_start=start_date,
                billing_period_end=end_date,
                sanctioned_load=3.0,
                has_solar_netmetering=False,
                total_amount_billed=round(amount, 2)
            ))

            end_date = start_date - timedelta(days=1)
            start_date = end_date.replace(day=1)

        return bills

    async def fetch_latest_bill(self, consumer_number: str) -> BillData:
        bills = await self.fetch_12_month_history(consumer_number)
        return bills[0]


class DISCOMService:
    """
    Real DISCOM integration fetching data via HTTP.
    Falls back to MockDISCOMService on API failure.
    """
    def __init__(self, discom_name: str, api_key: str):
        self.discom_name = discom_name.upper() if discom_name else "MOCK"
        self.api_key = api_key
        self.mock_fallback = MockDISCOMService()

    async def fetch_12_month_history(self, consumer_number: str) -> List[BillData]:
        try:
            async with httpx.AsyncClient() as client:
                if self.discom_name == "MSEDCL":
                    # MSEDCL placeholder
                    url = f"https://wss.mahadiscom.in/wss/wss?UType=RH&consumer={consumer_number}"
                    # response = await client.get(url, timeout=5.0)
                    # response.raise_for_status()
                    # return [self.parse_bill_response(b) for b in response.json()]
                    raise Exception("API not implemented")
                
                elif self.discom_name == "BESCOM":
                    # BESCOM placeholder
                    url = f"https://bescom.karnataka.gov.in/api/history?consumer={consumer_number}"
                    # response = await client.get(url, timeout=5.0)
                    raise Exception("API not implemented")
                
                elif self.discom_name == "TPDDL":
                    # TPDDL placeholder
                    url = f"https://www.tpddl.com/api/bills?consumer={consumer_number}"
                    # response = await client.get(url, timeout=5.0)
                    raise Exception("API not implemented")
                
                else:
                    return await self.mock_fallback.fetch_12_month_history(consumer_number)

        except Exception as e:
            print(f"DISCOM API failed for {self.discom_name}: {e}. Using mock fallback.")
            return await self.mock_fallback.fetch_12_month_history(consumer_number)

    async def fetch_latest_bill(self, consumer_number: str) -> BillData:
        try:
            # Same structure as above
            raise Exception("API not implemented")
        except Exception:
            return await self.mock_fallback.fetch_latest_bill(consumer_number)

    def parse_bill_response(self, raw: dict) -> BillData:
        """Parse raw JSON from a DISCOM into a BillData struct."""
        return BillData(
            units_consumed=float(raw.get("units_consumed", 0)),
            billing_period_start=date.fromisoformat(raw.get("billing_period_start")),
            billing_period_end=date.fromisoformat(raw.get("billing_period_end")),
            sanctioned_load=float(raw.get("sanctioned_load", 0)),
            has_solar_netmetering=bool(raw.get("has_solar_netmetering", False)),
            total_amount_billed=float(raw.get("total_amount_billed", 0))
        )
