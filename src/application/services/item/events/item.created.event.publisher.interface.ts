import { Observable } from 'rxjs';

export type ItemCreatedEvent = {
  id: number;
  name: string;
  quantity: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  categoryIds: number[];
};

export interface ItemCreatedEventPublisherInterface {
  publishItemCreatedEvent(event: ItemCreatedEvent): Observable<void>;
}
