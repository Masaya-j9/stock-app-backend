import { Observable } from 'rxjs';

export type ItemQuantityUpdatedEvent = {
  id: number;
  quantity: number;
  updatedAt: Date;
};

export interface ItemQuantityUpdatedEventPublisherInterface {
  publishItemQuantityUpdatedEvent(
    event: ItemQuantityUpdatedEvent
  ): Observable<void>;
}
