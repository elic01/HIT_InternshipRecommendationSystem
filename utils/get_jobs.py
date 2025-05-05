import httpx
from bs4 import BeautifulSoup
from pydantic import BaseModel
from typing import Optional, List

class Job(BaseModel):
    title: str
    company: str
    location: str
    link: str
    description: Optional[str] = None
    employment_type: Optional[str] = None
    experience_level: Optional[str] = None
    posted_date: Optional[str] = None
    applicant_count: Optional[str] = None
    salary: Optional[str] = None
    
GUEST_SEARCH_URL = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search"

async def get_jobs(
    discipline: str,
    location: str = "Worldwide",
    start: int = 0,
):
    params = {
        "keywords": discipline,
        "location": location,
        "start": start,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(GUEST_SEARCH_URL, params=params)
        if resp.status_code != 200:
            raise Exception(f"Error fetching jobs: {resp.status_code}")
        html = resp.text

    soup = BeautifulSoup(html, "html.parser")
    jobs = []
    
    for card in soup.select("div.job-search-card"):
        try:
            # Basic info (existing)
            title = card.select_one("h3.base-search-card__title").get_text(strip=True)
            comp = card.select_one("h4.base-search-card__subtitle").get_text(strip=True)
            loc = card.select_one("span.job-search-card__location").get_text(strip=True)
            link = card.select_one("a.base-card__full-link")["href"]
            
            # Additional info
            description = card.select_one("div.base-search-card__metadata").get_text(strip=True) if card.select_one("div.base-search-card__metadata") else None
            employment_type = card.select_one("div.job-search-card__employment-type").get_text(strip=True) if card.select_one("div.job-search-card__employment-type") else None
            posted_date = card.select_one("time.job-search-card__listdate").get_text(strip=True) if card.select_one("time.job-search-card__listdate") else None
            applicant_count = card.select_one("div.job-search-card__applicant-count").get_text(strip=True) if card.select_one("div.job-search-card__applicant-count") else None
            salary = card.select_one("span.job-search-card__salary-info").get_text(strip=True) if card.select_one("span.job-search-card__salary-info") else None
            
            jobs.append(Job(
                title=title,
                company=comp,
                location=loc,
                link=link,
                description=description,
                employment_type=employment_type,
                posted_date=posted_date,
                applicant_count=applicant_count,
                salary=salary
            ))
        except AttributeError as e:
            print(f"Error parsing job card: {e}")
            continue

    return jobs