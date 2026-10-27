from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str = "supplier" # supplier, buyer, partner, admin

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: str = "supplier"
    company_name: str
    industry: Optional[str] = None
    city: str
    state: str
    address: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class CompanyResponse(BaseModel):
    id: int
    name: str
    industry: Optional[str] = None
    city: str
    state: str
    address: Optional[str] = None
    verified: bool

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    company: Optional[CompanyResponse] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
