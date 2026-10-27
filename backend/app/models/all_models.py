from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

# 1. users
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), default="supplier", nullable=False) # supplier, buyer, partner, admin
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    company_memberships = relationship("CompanyMember", back_populates="user", cascade="all, delete-orphan")
    saved_listings = relationship("SavedListing", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    support_tickets = relationship("SupportTicket", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="actor")


# 2. companies
class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    industry = Column(String(255), nullable=True)
    registration_no = Column(String(100), nullable=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    address = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    # Relationships
    members = relationship("CompanyMember", back_populates="company", cascade="all, delete-orphan")
    listings = relationship("WasteListing", back_populates="company", cascade="all, delete-orphan")
    requirements = relationship("BuyerRequirement", back_populates="company", cascade="all, delete-orphan")


# 3. company_members
class CompanyMember(Base):
    __tablename__ = "company_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    role_in_company = Column(String(50), default="owner") # owner, manager, member
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="company_memberships")
    company = relationship("Company", back_populates="members")


# 4. material_categories
class MaterialCategory(Base):
    __tablename__ = "material_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    standard_unit = Column(String(20), default="KG") # KG, MT, Pieces
    co2_factor_per_kg = Column(Float, default=2.5) # kg CO2 avoided per kg recycled/reused
    energy_saved_percent = Column(Float, default=70.0) # % energy saved vs virgin
    is_active = Column(Boolean, default=True)

    listings = relationship("WasteListing", back_populates="category")
    requirements = relationship("BuyerRequirement", back_populates="category")


# 5. waste_listings
class WasteListing(Base):
    __tablename__ = "waste_listings"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("material_categories.id"), nullable=False)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), default="KG")
    condition = Column(String(50), nullable=False) # New Surplus, Reusable, Repairable, Recyclable
    location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    seller_price = Column(Float, nullable=True) # Asking price per unit
    ai_estimated_price_min = Column(Float, nullable=True)
    ai_estimated_price_max = Column(Float, nullable=True)
    currency = Column(String(10), default="INR")
    status = Column(String(50), default="Available", index=True) # Draft, Pending Review, Available, Reserved, Completed, Archived
    ai_prediction_status = Column(String(50), default="none") # none, pending, completed, confirmed, corrected
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    company = relationship("Company", back_populates="listings")
    category = relationship("MaterialCategory", back_populates="listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan")
    predictions = relationship("MaterialPrediction", back_populates="listing", cascade="all, delete-orphan")
    price_estimates = relationship("PriceEstimate", back_populates="listing", cascade="all, delete-orphan")
    matches = relationship("BuyerMatch", back_populates="listing", cascade="all, delete-orphan")
    enquiries = relationship("Enquiry", back_populates="listing", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="listing")


# 6. listing_images
class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("waste_listings.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(500), nullable=False)
    is_primary = Column(Boolean, default=False)
    original_filename = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    listing = relationship("WasteListing", back_populates="images")


# 7. material_predictions
class MaterialPrediction(Base):
    __tablename__ = "material_predictions"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("waste_listings.id", ondelete="CASCADE"), nullable=True)
    image_path = Column(String(500), nullable=True)
    predicted_category = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    model_version = Column(String(50), default="MobileNetV2-Industrial-v1.0")
    inference_time_ms = Column(Float, default=0.0)
    user_confirmed = Column(Boolean, default=False)
    user_corrected_category = Column(String(100), nullable=True)
    is_demo = Column(Boolean, default=False)
    rationale = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    listing = relationship("WasteListing", back_populates="predictions")


# 8. price_estimates
class PriceEstimate(Base):
    __tablename__ = "price_estimates"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("waste_listings.id", ondelete="CASCADE"), nullable=True)
    estimated_min_price = Column(Float, nullable=False)
    estimated_max_price = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    unit = Column(String(20), default="KG")
    model_name = Column(String(100), default="RandomForestRegressor-Scrap-v1")
    feature_summary = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    limitations_notice = Column(Text, default="Indicative valuation based on regional industrial scrap market benchmarks.")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    listing = relationship("WasteListing", back_populates="price_estimates")


# 9. buyer_requirements
class BuyerRequirement(Base):
    __tablename__ = "buyer_requirements"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("material_categories.id"), nullable=False)
    title = Column(String(255), nullable=False)
    min_quantity = Column(Float, nullable=False)
    max_quantity = Column(Float, nullable=False)
    unit = Column(String(20), default="KG")
    accepted_condition = Column(String(100), default="Any") # Any, Recyclable, Reusable, Repairable
    preferred_location = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    max_distance_km = Column(Float, default=200.0)
    max_budget_per_unit = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    company = relationship("Company", back_populates="requirements")
    category = relationship("MaterialCategory", back_populates="requirements")
    matches = relationship("BuyerMatch", back_populates="requirement", cascade="all, delete-orphan")


# 10. saved_listings
class SavedListing(Base):
    __tablename__ = "saved_listings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("waste_listings.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="saved_listings")
    listing = relationship("WasteListing")


# 11. buyer_matches
class BuyerMatch(Base):
    __tablename__ = "buyer_matches"

    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("buyer_requirements.id", ondelete="CASCADE"), nullable=False)
    listing_id = Column(Integer, ForeignKey("waste_listings.id", ondelete="CASCADE"), nullable=False)
    overall_score = Column(Float, nullable=False) # 0.0 to 100.0
    material_score = Column(Float, nullable=False)
    quantity_score = Column(Float, nullable=False)
    proximity_score = Column(Float, nullable=False)
    condition_score = Column(Float, nullable=False)
    explanation = Column(Text, nullable=False)
    is_viewed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    requirement = relationship("BuyerRequirement", back_populates="matches")
    listing = relationship("WasteListing", back_populates="matches")


# 12. enquiries
class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("waste_listings.id", ondelete="CASCADE"), nullable=False)
    buyer_company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    supplier_company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    initial_quantity = Column(Float, nullable=False)
    status = Column(String(50), default="Open", index=True) # Open, In Negotiation, Offer Made, Accepted, Declined, Closed
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    listing = relationship("WasteListing", back_populates="enquiries")
    buyer_company = relationship("Company", foreign_keys=[buyer_company_id])
    supplier_company = relationship("Company", foreign_keys=[supplier_company_id])
    messages = relationship("EnquiryMessage", back_populates="enquiry", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="enquiry", cascade="all, delete-orphan")


# 13. enquiry_messages
class EnquiryMessage(Base):
    __tablename__ = "enquiry_messages"

    id = Column(Integer, primary_key=True, index=True)
    enquiry_id = Column(Integer, ForeignKey("enquiries.id", ondelete="CASCADE"), nullable=False)
    sender_user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    sender_company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    message_text = Column(Text, nullable=False)
    attachments = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    enquiry = relationship("Enquiry", back_populates="messages")
    sender_user = relationship("User")
    sender_company = relationship("Company")


# 14. offers
class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    enquiry_id = Column(Integer, ForeignKey("enquiries.id", ondelete="CASCADE"), nullable=False)
    sender_company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    offered_price_per_unit = Column(Float, nullable=False)
    offered_quantity = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    notes = Column(Text, nullable=True)
    status = Column(String(50), default="Pending") # Pending, Accepted, Rejected, Countered
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    enquiry = relationship("Enquiry", back_populates="offers")
    sender_company = relationship("Company")
    transaction = relationship("Transaction", back_populates="offer", uselist=False)


# 15. transactions
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("waste_listings.id"), nullable=False)
    offer_id = Column(Integer, ForeignKey("offers.id"), nullable=True)
    buyer_company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    supplier_company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    agreed_quantity = Column(Float, nullable=False)
    agreed_price_per_unit = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(50), default="Agreed", index=True) # Agreed, In Transit, Delivered, Completed, Cancelled
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    listing = relationship("WasteListing", back_populates="transactions")
    offer = relationship("Offer", back_populates="transaction")
    buyer_company = relationship("Company", foreign_keys=[buyer_company_id])
    supplier_company = relationship("Company", foreign_keys=[supplier_company_id])
    events = relationship("TransactionEvent", back_populates="transaction", cascade="all, delete-orphan")
    impact_record = relationship("ImpactRecord", back_populates="transaction", uselist=False, cascade="all, delete-orphan")


# 16. transaction_events
class TransactionEvent(Base):
    __tablename__ = "transaction_events"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False) # Created, Payment Promised, Dispatch Initiated, Weight Verified, Completed, Cancelled
    description = Column(Text, nullable=False)
    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    transaction = relationship("Transaction", back_populates="events")
    actor = relationship("User")


# 17. notifications
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False, index=True)
    notification_type = Column(String(50), default="general") # match, enquiry, offer, transaction, system
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="notifications")


# 18. impact_records
class ImpactRecord(Base):
    __tablename__ = "impact_records"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False)
    material_category = Column(String(100), nullable=False)
    quantity_kg = Column(Float, nullable=False)
    co2_saved_kg = Column(Float, nullable=False)
    circular_economy_score = Column(Float, default=85.0)
    landfill_diverted_kg = Column(Float, nullable=False)
    calculated_at = Column(DateTime(timezone=True), default=utc_now)

    transaction = relationship("Transaction", back_populates="impact_record")


# 19. support_tickets
class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(20), default="Medium") # Low, Medium, High
    status = Column(String(50), default="Open") # Open, Pending, Resolved, Closed
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="support_tickets")


# 20. audit_logs
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False) # e.g., USER_LOGIN, LISTING_CREATED, OFFER_ACCEPTED, STATUS_UPDATED
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    actor = relationship("User", back_populates="audit_logs")
