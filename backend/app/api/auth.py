from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.dependencies import get_current_user
from app.models.all_models import User, Company, CompanyMember, AuditLog
from app.schemas.auth import UserRegister, UserLogin, Token, UserResponse, CompanyResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )
    
    # Hash password
    hashed_pwd = get_password_hash(user_in.password)

    # Valid role verification (supplier, buyer, partner)
    role = user_in.role.lower().strip()
    if role not in ["supplier", "buyer", "partner"]:
        role = "supplier"

    # Create user
    new_user = User(
        email=user_in.email.lower().strip(),
        hashed_password=hashed_pwd,
        full_name=user_in.full_name.strip(),
        phone=user_in.phone,
        role=role,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    # Create associated Company
    new_company = Company(
        name=user_in.company_name.strip(),
        industry=user_in.industry,
        city=user_in.city.strip(),
        state=user_in.state.strip(),
        address=user_in.address,
        verified=False
    )
    db.add(new_company)
    db.flush()

    # Link user to company as owner
    member = CompanyMember(
        user_id=new_user.id,
        company_id=new_company.id,
        role_in_company="owner"
    )
    db.add(member)

    # Audit log
    audit = AuditLog(
        actor_user_id=new_user.id,
        action="USER_REGISTER",
        resource_type="User",
        resource_id=str(new_user.id),
        details=f"User registered with role: {role}, Company: {new_company.name}"
    )
    db.add(audit)
    db.commit()
    db.refresh(new_user)

    # Generate token
    token = create_access_token(new_user.id)

    comp_resp = CompanyResponse(
        id=new_company.id,
        name=new_company.name,
        industry=new_company.industry,
        city=new_company.city,
        state=new_company.state,
        address=new_company.address,
        verified=new_company.verified
    )

    user_resp = UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        phone=new_user.phone,
        role=new_user.role,
        is_active=new_user.is_active,
        company=comp_resp,
        created_at=new_user.created_at
    )

    return Token(access_token=token, token_type="bearer", user=user_resp)

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email.lower().strip()).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated"
        )
    
    token = create_access_token(user.id)

    comp_resp = None
    membership = db.query(CompanyMember).filter(CompanyMember.user_id == user.id).first()
    if membership and membership.company:
        c = membership.company
        comp_resp = CompanyResponse(
            id=c.id,
            name=c.name,
            industry=c.industry,
            city=c.city,
            state=c.state,
            address=c.address,
            verified=c.verified
        )

    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        is_active=user.is_active,
        company=comp_resp,
        created_at=user.created_at
    )

    return Token(access_token=token, token_type="bearer", user=user_resp)

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    comp_resp = None
    membership = db.query(CompanyMember).filter(CompanyMember.user_id == current_user.id).first()
    if membership and membership.company:
        c = membership.company
        comp_resp = CompanyResponse(
            id=c.id,
            name=c.name,
            industry=c.industry,
            city=c.city,
            state=c.state,
            address=c.address,
            verified=c.verified
        )

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        role=current_user.role,
        is_active=current_user.is_active,
        company=comp_resp,
        created_at=current_user.created_at
    )
