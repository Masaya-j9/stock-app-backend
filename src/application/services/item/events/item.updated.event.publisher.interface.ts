import { Observable } from 'rxjs';

export type ItemUpdatedEvent = {
  id: number;
  name: string;
  quantity: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  categoryIds: number[];
};

export interface ItemUpdatedEventPublisherInterface {
  publishItemUpdatedEvent(event: ItemUpdatedEvent): Observable<void>;
}
