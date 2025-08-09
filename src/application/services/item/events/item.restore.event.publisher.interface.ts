import { Observable } from 'rxjs';

export type ItemRestoreEvent = {
  id: number;
  name: string;
  quantity: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  categoryIds: number[];
};

export interface ItemRestoreEventPublisherInterface {
  publishItemRestoreEvent(event: ItemRestoreEvent): Observable<void>;
}
