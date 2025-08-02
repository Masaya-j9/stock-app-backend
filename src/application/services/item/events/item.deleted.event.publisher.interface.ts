import { Observable } from 'rxjs';

export interface ItemDeletedEvent {
  id: number;
  name: string;
  quantity: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
  categoryIds: number[];
}

export interface ItemDeletedEventPublisherInterface {
  publishItemDeletedEvent(event: ItemDeletedEvent): Observable<void>;
}
