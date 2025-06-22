from sqlalchemy.orm import Session
from . import models, schemas
from datetime import datetime

def get_tasks(db: Session, user_id: int, status: str = None, created_at: str = None):
    query = db.query(models.Task).filter(models.Task.owner_id == user_id)
    
    if status:
        query = query.filter(models.Task.status == status)
    if created_at:
        query = query.filter(models.Task.created_at >= created_at)
        
    return query.all()

def create_task(db: Session, task: schemas.TaskCreate, user_id: int):
    db_task = models.Task(**task.dict(), owner_id=user_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task: schemas.TaskCreate, user_id: int):
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == user_id).first()
    if not db_task:
        return None
    
    for key, value in task.dict().items():
        setattr(db_task, key, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int, user_id: int):
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == user_id).first()
    if not db_task:
        return False
    
    db.delete(db_task)
    db.commit()
    return True